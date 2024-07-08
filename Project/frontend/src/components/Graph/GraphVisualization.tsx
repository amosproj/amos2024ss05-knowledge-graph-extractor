import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { styled, useTheme } from '@mui/material/styles';
// impport mediauery
import { useMediaQuery } from '@mui/material';
import {
  Box,
  Typography,
  CssBaseline,
  Toolbar,
  IconButton,
  Drawer,
  Card,
  CardContent,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import VisGraph from './VisGraph';
import LoadingScreen from './LoadingScreen';
import ErrorScreen from './ErrorScreen';
import { KEYWORDS_API_PATH, VISUALIZE_API_PATH } from '../../constant';
import PersistentDrawerControls from './PersistentDrawerControls';
import Navbar from '../Navbar/Navbar';
import GraphInfoPanel from './GraphInfoPanel';
import {
  initialPhysicsOptions,
  leftDrawerWidth,
  rightDrawerWidth,
  physicsOptionsByLayout,
  getOptions,
} from './config';
import './index.css';

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
  marginLeft: open ? 0 : `-${leftDrawerWidth}px`,
  marginRight: open ? 0 : `-${rightDrawerWidth}px`,
  position: 'relative',
  padding: '10px',
  boxSizing: 'border-box', // Ensure padding is included in the width calculation
  height: 'calc(100vh - 64px)', // Ensure proper height accounting for AppBar
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
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isStabilizingRef = useRef(false);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const toggleRightPanel = () => {
    setRightPanelOpen(!rightPanelOpen);
  };

  useEffect(() => {
    if (isSmallScreen) {
      setRightPanelOpen(false);
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

        const newTopicColorMap = data.nodes.reduce(
          (acc: ITopicColourMap, curr: any) => {
            if (!acc[curr.topic]) {
              acc[curr.topic] =
                '#' + Math.floor(Math.random() * 16777215).toString(16);
            }
            return acc;
          },
          {},
        );
        setTopicColorMap(newTopicColorMap);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

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

    fetchGraphData();
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

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <CssBaseline />
      <Navbar />
      <Drawer
        sx={{
          width: drawerOpen ? leftDrawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: leftDrawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            borderRight: 0,
          },
        }}
        variant="persistent"
        anchor="left"
        open={drawerOpen}
      >
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
      <Main open={drawerOpen || rightPanelOpen}>
        <DrawerHeader />
        <Card
          sx={{
            height: 'calc(100% - 64px)',
            width: '100%',
            overflow: 'hidden',
            padding: '10px',
            boxSizing: 'border-box', // Ensure padding is included in the width calculation
          }}
        >
          <CardContent sx={{ height: '100%', padding: 0 }}>
            {graphData && (
              <VisGraph
                graphData={graphData}
                options={options}
                setStabilizationComplete={setStabilizationComplete}
                topicColorMap={topicColorMap}
                isStabilizingRef={isStabilizingRef}
              />
            )}
          </CardContent>
        </Card>
      </Main>
      <Drawer
        sx={{
          width: rightPanelOpen ? rightDrawerWidth : 0,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: rightDrawerWidth,
            boxSizing: 'border-box',
            marginTop: '64px',
            borderLeft: 0,
          },
        }}
        variant="persistent"
        anchor="right"
        open={rightPanelOpen}
      >
        <PersistentDrawerControls
          open={rightPanelOpen}
          toggleDrawer={toggleRightPanel}
          layout={layout}
          setLayout={setLayout}
          physicsOptions={physicsOptions}
          handlePhysicsChange={handlePhysicsChange}
          restartStabilization={() => setStabilizationComplete(false)}
        />
      </Drawer>
      {!rightPanelOpen && (
        <IconButton
          color="inherit"
          aria-label="open right drawer"
          edge="end"
          onClick={toggleRightPanel}
          sx={{ position: 'absolute', right: 0, top: '64px', zIndex: 1300 }}
        >
          <ChevronLeftIcon />
        </IconButton>
      )}
    </Box>
  );
};

export default GraphVisualization;
