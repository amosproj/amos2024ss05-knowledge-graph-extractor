import React, { useEffect, useRef, useState } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { useParams } from 'react-router-dom';
import './index.css';
import { KEYWORDS_API_PATH, VISUALIZE_API_PATH } from '../../constant';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Chip,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import FloatingControlCard from './FloatingControlCard.jsx';
import * as d3 from 'd3';
import PersistentDrawerControls from './PersistentDrawerControls';

type ITopicColourMap = Record<string, string>;

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

const Legend: React.FC<{ topicColorMap: ITopicColourMap }> = ({
  topicColorMap,
}) => {
  return (
    <Box
      sx={{
        padding: '16px',
        backgroundColor: '#121826',
        borderRadius: '10px',
        color: 'white',
        maxHeight: '250px',
        overflowY: 'auto',
        maxWidth: '500px',
        position: 'absolute',
        left: '16px',
        top: '16px',
      }}
    >
      <Box component="ul" sx={{ padding: 0, margin: 0, listStyle: 'none' }}>
        {Object.entries(topicColorMap).map(([topic, color]) => (
          <Box
            component="li"
            key={topic}
            sx={{
              display: 'flex',
              marginBottom: '8px',
            }}
          >
            <Box
              sx={{
                width: '20px',
                height: '20px',
                backgroundColor: color,
                marginRight: '8px',
              }}
            />
            <span style={{ fontSize: '0.875rem' }}>
              {topic.substring(topic.indexOf('_') + 1)}
            </span>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const VisGraph: React.FC<{
  graphData: GraphData;
  options: Options;
  setStabilizationComplete: React.Dispatch<React.SetStateAction<boolean>>;
  topicColorMap: ITopicColourMap;
}> = ({ graphData, options, setStabilizationComplete, topicColorMap }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const isStabilizingRef = useRef(false);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const data = {
      nodes: graphData.nodes.map((node) => ({
        id: node.id,
        label: node.label || node.id,
        shape: 'dot',
        size: 25,
        ...node,
        title: `Found in pages: ${node.pages}
                Topic: ${node.topic.substring(node.topic.indexOf('_') + 1)}`,
        color: {
          background: topicColorMap[node.topic],
          border: 'white',
          highlight: {
            background: '#69b3a2',
            border: '#508e7f',
          },
        },
        borderWidth: 0.5,
      })),
      edges: graphData.edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        color: {
          color: '#ffffff',
          highlight: '#ffff00',
          hover: '#ffffff',
        },
        ...edge,
      })),
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    setIsStabilizing(true);
    setStabilizationProgress(0);
    isStabilizingRef.current = true;

    network.on('stabilizationProgress', function (params) {
      const progress = (params.iterations / params.total) * 100;
      setStabilizationProgress(progress);
    });

    network.on('stabilizationIterationsDone', function () {
      setStabilizationProgress(100);
      setIsStabilizing(false);
      setStabilizationComplete(true);
      isStabilizingRef.current = false;
      // network.fit();
    });

    network.on('stabilized', function () {
      if (isStabilizingRef.current) {
        setStabilizationProgress(100);
        setIsStabilizing(false);
        setStabilizationComplete(true);
        isStabilizingRef.current = false;
      }
      network.fit();
    });

    return () => {
      network.destroy();
      networkRef.current = null;
    };
  }, [graphData, options, topicColorMap]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#1A2130',
      }}
    >
      {isStabilizing && (
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: '#fff',
            textAlign: 'center',
            zIndex: 1000,
          }}
        >
          <CircularProgress color="inherit" />
          <Typography variant="h6" sx={{ marginTop: '8px' }}>
            Stabilizing... {Math.round(stabilizationProgress)}%
          </Typography>
        </Box>
      )}
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
    </Box>
  );
};

const GraphVisualization: React.FC = () => {
  const { fileId = '' } = useParams<{ fileId: string }>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);
  const [stabilizationComplete, setStabilizationComplete] = useState(false);
  const [topicColorMap, setTopicColorMap] = useState<ITopicColourMap>({});
  const [physicsOptions, setPhysicsOptions] = useState({
    gravitationalConstant: -20000,
    springLength: 100,
    springConstant: 0.1,
    damping: 0.09,
    levelSeparation: 150,
    nodeSpacing: 100,
    treeSpacing: 200,
    blockShifting: true,
    edgeMinimization: true,
    parentCentralization: true,
    direction: 'UD',
    sortMethod: 'hubsize',
    shakeTowards: 'leaves',
    iterations: 1000,
  });

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
  const fetchGraphData = async () => {
    try {
      // Try to retrieve the graph data from sessionStorage
      const cachedGraphData = sessionStorage.getItem(`graphData-${fileId}`);
      if (cachedGraphData) {
        console.log("Using cached graph data for fileId:", fileId);
        setGraphData(JSON.parse(cachedGraphData));
        setIsLoading(false);
        return;
      }

      // Fetch the graph data from the server
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`
      );
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();

      // Save the fetched data to state and sessionStorage
      setGraphData(data);
      sessionStorage.setItem(`graphData-${fileId}`, JSON.stringify(data));

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
}, [fileId]);

  useEffect(() => {
    switch (layout) {
      case 'barnesHut':
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          gravitationalConstant: -20000,
          springLength: 100,
          springConstant: 0.1,
          damping: 0.09,
        }));
        break;
      case 'forceAtlas2Based':
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          gravitationalConstant: -50,
          springLength: 100,
          springConstant: 0.08,
          damping: 0.4,
        }));
        break;
      case 'hierarchicalRepulsion':
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          gravitationalConstant: 0,
          springLength: 120,
          springConstant: 0,
          damping: 0,
        }));
        break;
      case 'repulsion':
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          gravitationalConstant: 0.2,
          springLength: 200,
          springConstant: 0.05,
          damping: 0.09,
        }));
        break;
      case 'hierarchical':
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          levelSeparation: 150,
          nodeSpacing: 100,
          treeSpacing: 200,
          blockShifting: true,
          edgeMinimization: true,
          parentCentralization: true,
          direction: 'UD',
          sortMethod: 'hubsize',
          shakeTowards: 'leaves',
        }));
        break;
      default:
        setPhysicsOptions((prevOptions) => ({
          ...prevOptions,
          gravitationalConstant: -20000,
          springLength: 100,
          springConstant: 0.1,
          damping: 0.09,
        }));
    }
  }, [layout]);

  const handlePhysicsChange = (name: string, value: any) => {
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
    setStabilizationComplete(false);
  };

  const options: Options = {
    nodes: {
      shape: 'dot',
      size: 25,
      font: {
        size: 18,
        color: '#ffffff',
      },
    },
    edges: {
      width: 2,
      color: '#ffffff',
      arrows: {
        to: { enabled: true, scaleFactor: 0.5 },
      },
      font: {
        size: 14,
        color: '#ffffff',
        strokeWidth: 3,
        strokeColor: '#000000',
      },
    },
    interaction: {
      hover: true,
      tooltipDelay: 30,
      zoomView: true,
      dragView: true,
      selectConnectedEdges: false,
    },
    physics: {
      enabled: true,
      barnesHut: layout === 'barnesHut' ? physicsOptions : {},
      forceAtlas2Based: layout === 'forceAtlas2Based' ? physicsOptions : {},
      hierarchicalRepulsion:
        layout === 'hierarchicalRepulsion'
          ? { nodeDistance: physicsOptions.springLength }
          : {},
      repulsion:
        layout === 'repulsion'
          ? {
              nodeDistance: physicsOptions.springLength,
              centralGravity: physicsOptions.gravitationalConstant,
              springLength: physicsOptions.springLength,
              springConstant: physicsOptions.springConstant,
              damping: physicsOptions.damping,
            }
          : {},
      solver: layout,
      stabilization: {
        iterations: physicsOptions.iterations,
      },
    },
    layout:
      layout === 'hierarchical'
        ? {
            hierarchical: {
              direction: physicsOptions.direction,
              sortMethod: physicsOptions.sortMethod,
              levelSeparation: physicsOptions.levelSeparation,
              nodeSpacing: physicsOptions.nodeSpacing,
              treeSpacing: physicsOptions.treeSpacing,
              blockShifting: physicsOptions.blockShifting,
              edgeMinimization: physicsOptions.edgeMinimization,
              parentCentralization: physicsOptions.parentCentralization,
              shakeTowards: physicsOptions.shakeTowards,
              improvedLayout: false,
            },
          }
        : {},
  };

  const searchGraph = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter') {
      performSearch();
    }
  };

  const performSearch = () => {
    // Perform the search based on searchQuery
    console.log('Searching for:', searchQuery);
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="h6" sx={{ marginLeft: '10px' }}>
          Loading graph...
        </Typography>
      </Box>
    );
  }

  if (!graphData) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Typography variant="h6">Sorry, an error has occurred!</Typography>
      </Box>
    );
  }

  const formattedDate = new Date(
    graphData.graph_created_at,
  ).toLocaleDateString();
  const formattedTime = new Date(
    graphData.graph_created_at,
  ).toLocaleTimeString();

  return (
    <Stack
      sx={{
        height: '100vh',
        overflow: 'hidden',
      }}
      direction={isMobile ? 'column' : 'row'}
      alignItems="stretch"
    >
      <Stack
        direction="column"
        alignItems="center"
        textAlign="center"
        padding={2}
        sx={{
          width: isMobile ? '100%' : '300px',
          overflowY: 'auto',
          bgcolor: theme.palette.background.paper,
        }}
      >
        <Typography variant="h5" sx={{ margin: '15px' }}>
          Graph Information
        </Typography>
        <Typography variant="subtitle1" sx={{ margin: '10px' }}>
          Document Name:
          <Box component="span" sx={{ display: 'block', marginTop: '2px' }}>
            {graphData.document_name}
          </Box>
        </Typography>
        <Typography variant="subtitle1" sx={{ margin: '10px' }}>
          Created at:
          <Box component="span" sx={{ display: 'block', marginTop: '2px' }}>
            {formattedDate} {formattedTime}
          </Box>
        </Typography>
        <Typography variant="subtitle1" sx={{ margin: '10px' }}>
          Graph keywords:
          <Box sx={{ marginTop: '4px' }}>
            {keywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onClick={() => setSearchQuery(keyword)}
                sx={{ margin: '2px' }}
                clickable
              />
            ))}
          </Box>
        </Typography>
        <TextField
          placeholder="Search for keywords"
          fullWidth
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={searchGraph}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ marginBottom: '10px' }}
        />
        <TextField
          placeholder="Answer to your search will be displayed here!"
          fullWidth
          multiline
          rows={8}
          InputProps={{
            readOnly: true,
          }}
          sx={{ marginBottom: '10px' }}
        />
      </Stack>

      <Stack
        flex={1}
        direction="column"
        alignItems="stretch"
        sx={{ height: '100%', overflow: 'hidden' }}
      >
        <Typography variant="h4" align="center" gutterBottom>
          Graph Visualization
        </Typography>
        <Box
          flex={1}
          margin={2}
          borderRadius={2}
          bgcolor={theme.palette.background.default}
          sx={{ position: 'relative', overflow: 'hidden' }}
        >
          {graphData && (
            <VisGraph
              graphData={graphData}
              options={options}
              setStabilizationComplete={setStabilizationComplete}
              topicColorMap={topicColorMap}
            />
          )}
          <Legend topicColorMap={topicColorMap} />
        </Box>
      </Stack>
      {/* <FloatingControlCard
        layout={layout}
        setLayout={setLayout}
        physicsOptions={physicsOptions}
        handlePhysicsChange={handlePhysicsChange}
        restartStabilization={() => setStabilizationComplete(false)}
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
      /> */}
      <PersistentDrawerControls
        layout={layout}
        setLayout={setLayout}
        physicsOptions={physicsOptions}
        handlePhysicsChange={handlePhysicsChange}
        restartStabilization={() => setStabilizationComplete(false)}
        sx={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          zIndex: 1000,
        }}
      />
    </Stack>
  );
};

export default GraphVisualization;
