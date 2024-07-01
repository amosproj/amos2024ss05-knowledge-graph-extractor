import React, { useEffect, useState, useRef } from 'react';
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
} from '@mui/material';

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

  useEffect(() => {
    if (!graphData) return;

    const data = {
      nodes: graphData.nodes.map((node) => ({
        id: node.id,
        label: node.label || node.id,
        shape: 'dot',
        size: 25,
        color: {
          background: '#69b3a2',
          border: '#508e7f',
          highlight: {
            background: '#69b3a2',
            border: '#508e7f',
          },
        },
        ...node,
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
  }, [graphData, options]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100vw',
        height: 'calc(100vh - 50px)',
        background: '#1A2130',
      }}
    />
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
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`,
        );
        const data = await response.json();
        setGraphData(data);
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
    <section className="main_graph_container">
      <Typography variant="h4" gutterBottom>
        Graph Visualization
      </Typography>
      <Select
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
      <section className="graph_container">
        <div className="graph_info">
          <Typography variant="h5" gutterBottom>
            Graph Information
          </Typography>
          <Typography variant="body1">
            Document Name: <br /> {graphData.document_name}
            <br /> <br />
            Created at: <br /> {formattedDate} {formattedTime}
            <br /> <br />
            Graph keywords: <br />
            <Box sx={{ marginBottom: 1 }}>
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
          </Typography>
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
        </div>
        <VisGraph graphData={graphData} options={options} />
      </section>
    </section>
  );
};

export default GraphVisualization;
