import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { useParams } from 'react-router-dom';
import './index.css';
import { KEYWORDS_API_PATH, VISUALIZE_API_PATH } from '../../constant';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import {
  InputAdornment,
  Chip,
  Box,
  CircularProgress,
  MenuItem,
  Select,
  Typography,
  Stack,
} from '@mui/material';
import { Node } from './';
type ITopicColourMap = Record<string, string>;

interface GraphData {
  nodes: Array<{ id: string; label?: string; [key: string]: any }>;
  edges: Array<{ source: string; target: string; [key: string]: any }>;
  document_name: string;
  graph_created_at: string;
}

const VisGraph: React.FC<{ graphData: GraphData; options: Options }> = ({
  graphData,
  options,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useLayoutEffect(() => {
    const react = containerRef.current?.getBoundingClientRect();
    console.log(react);
    setHeight(react?.height || 0);
    setWidth(react?.width || 0);
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded || !containerRef.current || !graphData) return;


    const topicColorMap = graphData.nodes.reduce((acc: ITopicColourMap, curr: Node) => {
      if (!acc[curr.topic]) {
        acc[curr.topic] = '#' + Math.floor(Math.random() * 16777215).toString(16);
      } return acc;
    }, {});


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

    const network = new Network(
      containerRef.current as HTMLElement,
      data,
      options,
    );
    network.on('selectNode', function (params) {
      network.setSelection({
        nodes: params.nodes,
        edges: network.getConnectedEdges(params.nodes[0]),
      });
    });
    return () => network.destroy();
  }, [isLoaded, containerRef.current, graphData]);

  return (
    <div
      ref={containerRef}
      style={{
        flex: 1,
        ...(isLoaded ? { height, width, flex: '' } : {}),
      }}
    >
      Graph
    </div>
  );
};

const GraphVisualization: React.FC = () => {
  const { fileId = '' } = useParams<{ fileId: string }>();
  const [graphData, setGraphData] = useState<GraphData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');
  const [searchQuery, setSearchQuery] = useState('');
  const [keywords, setKeywords] = useState<string[]>([]);

  useEffect(() => {
    const fetchGraphData = async () => {
      if (sessionStorage.getItem(fileId)) {
        setGraphData(JSON.parse(sessionStorage.getItem(fileId) as string));
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`,
        );
        const data = await response.json();
        setGraphData(data);
        sessionStorage.setItem(fileId, JSON.stringify(data));
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

  const options: Options = {
    nodes: {
      shape: 'dot',
      size: 25,
      color: {
        background: '#69b3a2',
        border: '#508e7f',
        highlight: {
          background: '#ffeb3b',
          border: '#fbc02d',
        },
      },
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
    physics:
      layout === 'barnesHut'
        ? {
            enabled: true,
            barnesHut: {
              gravitationalConstant: -20000,
              springLength: 100,
              springConstant: 0.1,
            },
            stabilization: {
              iterations: 2500,
            },
          }
        : layout === 'forceAtlas2Based'
          ? {
              enabled: true,
              forceAtlas2Based: {
                gravitationalConstant: -50,
                centralGravity: 0.01,
                springConstant: 0.08,
                springLength: 100,
                damping: 0.4,
              },
              stabilization: {
                iterations: 2500,
              },
              solver: 'forceAtlas2Based',
            }
          : layout === 'hierarchicalRepulsion'
            ? {
                enabled: true,
                hierarchicalRepulsion: {
                  nodeDistance: 120,
                },
                stabilization: {
                  iterations: 2500,
                },
              }
            : layout === 'repulsion'
              ? {
                  enabled: true,
                  repulsion: {
                    nodeDistance: 200,
                    centralGravity: 0.2,
                    springLength: 50,
                    springConstant: 0.05,
                    damping: 0.09,
                  },
                  stabilization: {
                    iterations: 2500,
                  },
                }
              : layout === 'hierarchical'
                ? {
                    enabled: true,
                    hierarchical: {
                      direction: 'UD', // UD, DU, LR, RL
                      sortMethod: 'hubsize',
                    },
                    stabilization: {
                      iterations: 2500,
                    },
                  }
                : layout === 'grid'
                  ? {
                      enabled: false,
                      layout: {
                        hierarchical: false,
                        randomSeed: undefined,
                        improvedLayout: true,
                      },
                      physics: {
                        enabled: false,
                      },
                    }
                  : {
                      enabled: true,
                      randomSeed: 2,
                    },
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

  const searchBarStyle: React.CSSProperties = {
    padding: '8px',
    width: '100%',
    marginBottom: '10px',
    fontSize: '16px',
  };

  const answerAreaStyle: React.CSSProperties = {
    padding: '8px',
    width: '100%',
    fontSize: '16px',
  };

  if (isLoading) {
    return (
      <div className="loading_spinner_graph">
        <CircularProgress />
        <Typography variant="h6" style={{ marginLeft: '10px' }}>
          Loading graph...
        </Typography>
      </div>
    );
  }

  if (!graphData) {
    return <div className="error_container">Sorry, an error has occurred!</div>;
  }

  const formattedDate = new Date(
    graphData.graph_created_at,
  ).toLocaleDateString();
  const formattedTime = new Date(
    graphData.graph_created_at,
  ).toLocaleTimeString();

  return (
    <Stack flex={1} direction={'row'} alignItems={'stretch'} paddingTop={2}>
      <Stack
        direction={'column'}
        alignItems={'center'}
        textAlign={'center'}
        padding={5}
        maxWidth={450}
        minWidth={450}
      >
        <Stack sx={{ fontSize: '25px', margin: '15px' }}>
          Graph Information
        </Stack>
        <Stack sx={{ fontSize: '16px', margin: '10px' }}>
          Document Name:
          <Typography sx={{ marginTop: '2px' }}>
            {graphData.document_name}
          </Typography>
        </Stack>
        <Stack sx={{ fontSize: '16px', margin: '10px' }}>
          Created at:
          <Typography sx={{ marginTop: '2px' }}>
            {formattedDate} {formattedTime}
          </Typography>
        </Stack>
        <Stack sx={{ fontSize: '16px', margin: '10px' }}>
          Graph keywords:
          <Box sx={{ marginTop: '4px' }}>
            {keywords.map((keyword) => (
              <Chip
                key={keyword}
                label={keyword}
                onClick={() => setSearchQuery(keyword)}
                sx={{ marginRight: 1, marginBottom: 1 }}
                clickable
              />
            ))}
          </Box>
        </Stack>
        <TextField
          className="search_text_field"
          placeholder="Search for keywords"
          style={searchBarStyle}
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
        />
        <TextField
          className="answer_text_field"
          placeholder="Answer to your search will be displayed here!"
          style={answerAreaStyle}
          multiline
          rows={8}
          InputProps={{
            readOnly: true,
          }}
        />
      </Stack>
      <Stack flex={1} direction={'column'} alignItems={'stretch'}>
        <Stack justifyContent={'center'} alignItems={'center'} spacing={2}>
          <Typography variant="h4" gutterBottom>
            Graph Visualization
          </Typography>
          <Select
            size="small"
            value={layout}
            onChange={(e) => setLayout(e.target.value as string)}
            style={{ marginBottom: '20px' }}
          >
            <MenuItem value="barnesHut">Barnes Hut</MenuItem>
            <MenuItem value="forceAtlas2Based">Force Atlas 2 Based</MenuItem>
            <MenuItem value="hierarchicalRepulsion">
              Hierarchical Repulsion
            </MenuItem>
            <MenuItem value="repulsion">Repulsion</MenuItem>
            <MenuItem value="hierarchical">Hierarchical</MenuItem>
            <MenuItem value="grid">Grid</MenuItem>
            <MenuItem value="random">Random</MenuItem>
          </Select>
        </Stack>
        <Stack flex={1} margin={2} borderRadius={2} bgcolor={'#333'}>
          <VisGraph graphData={graphData} options={options} />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default GraphVisualization;
