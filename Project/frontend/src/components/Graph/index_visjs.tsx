import React, { useEffect, useState, useRef } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { useParams } from 'react-router-dom';
import './index.css';
import { KEYWORDS_API_PATH, VISUALIZE_API_PATH } from '../../constant';
import SearchIcon from '@mui/icons-material/Search';
import {
  TextField,
  InputAdornment,
  Chip,
  Box,
  CircularProgress,
  Typography,
  Stack,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import FloatingControlCard from './FloatingControlCard';

interface GraphData {
  nodes: Array<{ id: string; label?: string; topic: string; pages: string; [key: string]: any }>;
  edges: Array<{ source: string; target: string; [key: string]: any }>;
  document_name: string;
  graph_created_at: string;
}

interface ITopicColourMap {
  [key: string]: string;
}

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
        title: `Found in pages: ${node.pages}`,
        color: {
          background: topicColorMap[node.topic],
          border: 'white',
          highlight: {
            background: '#69b3a2',
            border: '#508e7f',
          },
        },
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
    });

    network.on('stabilized', function () {
      if (isStabilizingRef.current) {
        setStabilizationProgress(100);
        setIsStabilizing(false);
        setStabilizationComplete(true);
        isStabilizingRef.current = false;
      }
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
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`,
        );
        const data = await response.json();
        setGraphData(data);

        // Generate and set topic color map
        const newTopicColorMap = data.nodes.reduce((acc: ITopicColourMap, curr: any) => {
          if (!acc[curr.topic]) {
            acc[curr.topic] = '#' + Math.floor(Math.random() * 16777215).toString(16);
          }
          return acc;
        }, {});
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

  const formattedDate = new Date(graphData.graph_created_at).toLocaleDateString();
  const formattedTime = new Date(graphData.graph_created_at).toLocaleTimeString();

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
        </Box>
      </Stack>
      <FloatingControlCard
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