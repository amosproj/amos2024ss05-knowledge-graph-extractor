import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
import {
  useMediaQuery,
  Box,
  CssBaseline,
  IconButton,
  Card,
  CardContent,
  Drawer,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisGraph from './VisGraph';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import { KEYWORDS_API_PATH, VISUALIZE_API_PATH } from '../../constant';
import Navbar from '../Navbar/Navbar';
import GraphInfoPanel from './GraphInfoPanel';
import FloatingControlCard from './FloatingControlCard.tsx';
import {
  initialPhysicsOptions,
  leftDrawerWidth,
  getOptions,
  physicsOptionsByLayout,
} from './config';
import './index.css';
import * as d3 from 'd3';
import Legend from './Legend'; // Importiere die Legend-Komponente

interface GraphData {
  nodes: Array<{
    id: string;
    label?: string;
    topic: string;
    pages: string;
    [key: string]: any;
  }>;
  edges: Array<{ source: string; target: string; [key: string]: any }>;
  document_name: string;
  graph_created_at: string;
}

interface ITopicColourMap {
  [key: string]: string;
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  position: 'relative',
  padding: '10px',
  boxSizing: 'border-box',
  height: 'calc(100vh - 64px)',
  marginLeft: open ? leftDrawerWidth : 0,
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-start',
}));

const GraphVisualization: React.FC = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [stabilizationComplete, setStabilizationComplete] = useState(false);
  const [topicColorMap, setTopicColorMap] = useState<ITopicColourMap>({});
  const [physicsOptions, setPhysicsOptions] = useState(initialPhysicsOptions);

  const [drawerOpen, setDrawerOpen] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isStabilizingRef = useRef(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
    if (networkRef.current) {
      networkRef.current.redraw();
      networkRef.current.fit();
    }
  };

  useEffect(() => {
    if (isSmallScreen) {
      setDrawerOpen(false);
    }
  }, [isSmallScreen]);

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`,
        );
        const data = await response.json();
        setGraphData(data);

        // Get the list of unique topics
        const uniqueTopics = Array.from(
          new Set(data.nodes.map((node) => node.topic)),
        );

        // Create color scheme for the topics
        const colorSchemes = [
          d3.schemeCategory10,
          d3.schemePaired,
          d3.schemeSet1,
        ];
        const uniqueColors = Array.from(new Set(colorSchemes.flat()));

        const otherIndex = uniqueTopics.indexOf('other');
        if (otherIndex !== -1) {
          uniqueTopics.splice(otherIndex, 1);
        }

        const topicColorMap: ITopicColourMap = uniqueTopics.reduce(
          (acc: ITopicColourMap, topic, index) => {
            acc[topic] = uniqueColors[index % uniqueColors.length];
            return acc;
          },
          {},
        );

        if (otherIndex !== -1) {
          topicColorMap['other'] =
            uniqueColors[uniqueTopics.length % uniqueColors.length];
        }

        setTopicColorMap(topicColorMap);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
    const fetchKeywords = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}${KEYWORDS_API_PATH.replace(':fileId', fileId)}`,
        );
        const data = await response.json();
        setKeywords(data);
      } catch (error) {
        console.error('Error fetching keywords:', error);
      }
    };

    fetchKeywords();
  }, [fileId]);

  useEffect(() => {
    const newOptions = physicsOptionsByLayout[layout] || initialPhysicsOptions;
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      ...newOptions,
    }));
  }, [layout]);

  const handlePhysicsChange = (name: string, value: any) => {
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
    setStabilizationComplete(false);
  };

  const options = getOptions(layout, physicsOptions);

  const searchGraph = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!graphData) {
    return <ErrorScreen />;
  }

  const formattedDate = new Date(
    graphData.graph_created_at,
  ).toLocaleDateString();
  const formattedTime = new Date(
    graphData.graph_created_at,
  ).toLocaleTimeString();

  const isStabilizing = isStabilizingRef.current;

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Drawer
        sx={{
          width: 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: leftDrawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            borderRight: 0,
            transition: 'margin 0.3s ease-out',
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
        <DrawerHeader>
          <IconButton onClick={toggleDrawer}>
            <ChevronLeftIcon />
          </IconButton>
        </DrawerHeader>
        <GraphInfoPanel
          open={drawerOpen}
          toggleDrawer={toggleDrawer}
          graphData={{
            document_name: graphData.document_name,
            graph_created_at: graphData.graph_created_at,
          }}
          keywords={keywords}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchGraph={searchGraph}
        />
      </Drawer>
      {!drawerOpen && (
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="start"
          onClick={toggleDrawer}
          sx={{ position: 'absolute', left: 0, top: '64px', zIndex: 1300 }}
        >
          <ChevronRightIcon />
        </IconButton>
      )}
      <Main open={drawerOpen}>
        <DrawerHeader />
        <Card
          sx={{
            height: '95%',
            background: '#121826',
            width: '100%',
            overflow: 'hidden',
            padding: '5px',
            boxSizing: 'border-box',
            margin: '0',
            position: 'relative',
          }}
        >
          <CardContent sx={{ height: '102%', padding: 0 }}>
            {graphData && !isStabilizingRef.current && (
              <VisGraph
                graphData={graphData}
                options={options}
                setStabilizationComplete={setStabilizationComplete}
                topicColorMap={topicColorMap}
                isStabilizingRef={isStabilizingRef}
              />
            )}
            <Legend topicColorMap={topicColorMap} />
          </CardContent>
        </Card>
      </Main>
      <FloatingControlCard
        layout={layout}
        setLayout={setLayout}
        physicsOptions={physicsOptions}
        handlePhysicsChange={handlePhysicsChange}
        restartStabilization={() => setStabilizationComplete(false)}
      />
    </Box>
  );
};

export default GraphVisualization;
