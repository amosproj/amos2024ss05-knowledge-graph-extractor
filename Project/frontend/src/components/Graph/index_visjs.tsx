import React, { useEffect, useState, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { useParams } from 'react-router-dom';
import FloatingControlCard from './FloatingControlCard';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';
import { CircularProgress, Typography, Box } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import TextField from '@mui/material/TextField';
import { InputAdornment } from '@mui/material';
import { Node } from './';
type ITopicColourMap = Record<string, string>;

const VisGraph = ({ graphData, options, setStabilizationComplete }) => {
  const containerRef = useRef(null);
  const networkRef = useRef(null);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const isStabilizingRef = useRef(false);

  useEffect(() => {
    if (!graphData) return;


    const topicColorMap = graphData.nodes.reduce((acc: ITopicColourMap, curr: Node) => {
      if (!acc[curr.topic]) {
        acc[curr.topic] = '#' + Math.floor(Math.random() * 16777215).toString(16);
      } return acc;
    }, {});


    const data = {
      nodes: graphData.nodes.map((node) => ({
        id: node.id,
        label: node.id,
        shape: 'dot',
        size: 25,
        ...node,
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
  }, [graphData, options]);

  return (
    <div style={{ position: 'relative', width: '100vw', height: 'calc(100vh - 50px)', background: '#1A2130' }}>
      {isStabilizing && (
        <Box
          style={{
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
          <Typography variant="h6" style={{ marginTop: '8px' }}>
            Stabilizing... {Math.round(stabilizationProgress)}%
          </Typography>
        </Box>
      )}
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const GraphVisualization = () => {
  const { fileId = '' } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');
  const [stabilizationComplete, setStabilizationComplete] = useState(false);
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
    iterations: 1000, // Stabilization iterations
  });

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

  useEffect(() => {
    fetchGraphData();
  }, [fileId]);

  useEffect(() => {
    // Update physics options based on the selected layout
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

  const handlePhysicsChange = (name, value) => {
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
    setStabilizationComplete(false);
  };

  const options = {
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
    physics: {
      enabled: true,
      barnesHut: layout === 'barnesHut' ? {
        gravitationalConstant: physicsOptions.gravitationalConstant,
        centralGravity: 0.3,
        springLength: physicsOptions.springLength,
        springConstant: physicsOptions.springConstant,
        damping: physicsOptions.damping,
        avoidOverlap: 0.5,
      } : undefined,
      forceAtlas2Based: layout === 'forceAtlas2Based' ? {
        gravitationalConstant: physicsOptions.gravitationalConstant,
        centralGravity: 0.01,
        springConstant: physicsOptions.springConstant,
        springLength: physicsOptions.springLength,
        damping: physicsOptions.damping,
      } : undefined,
      repulsion: layout === 'repulsion' ? {
        nodeDistance: physicsOptions.nodeDistance,
        centralGravity: physicsOptions.centralGravity,
        springLength: physicsOptions.springLength,
        springConstant: physicsOptions.springConstant,
        damping: physicsOptions.damping,
      } : undefined,
      hierarchicalRepulsion: layout === 'hierarchicalRepulsion' ? {
        nodeDistance: physicsOptions.nodeDistance,
        centralGravity: 0.0,
        springLength: physicsOptions.springLength,
        springConstant: physicsOptions.springConstant,
        damping: physicsOptions.damping,
      } : undefined,
      solver: layout === 'hierarchical' ? 'hierarchicalRepulsion' : layout,
      stabilization: {
        enabled: true,
        iterations: physicsOptions.iterations,
        updateInterval: 50,
        onlyDynamicEdges: false,
        fit: true,
        adaptiveTimestep: true,
      },
      timestep: 0.5,
    },
    layout: layout === 'hierarchical' ? {
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
      }
    } : {}
  };

  const searchGraph = (event) => {
    if (event.key === 'Enter') {
      // Perform search logic based on searchQuery
    }
  };

  const searchBarStyle = {
    padding: '8px',
    width: '100%',
    marginBottom: '10px',
    fontSize: '16px',
  };

  const answerAreaStyle = {
    padding: '8px',
    width: '100%',
    fontSize: '16px',
  };

  if (isLoading) {
    return <div className="loading_spinner_graph">Loading graph...</div>;
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
      <h1>Graph Visualization </h1>
      <section className="graph_container">
        <div className="graph_info">
          <h1>Graph Information</h1>
          <p>
            Document Name: <br /> {graphData.document_name}
            <br /> <br />
            Created at: <br /> {formattedDate} {formattedTime}
          </p>
          <TextField
            className="search_text_field"
            placeholder="Search for keywords"
            style={searchBarStyle}
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
        <VisGraph
          graphData={graphData}
          options={options}
          setStabilizationComplete={setStabilizationComplete}
        />
        <FloatingControlCard
          layout={layout}
          setLayout={setLayout}
          physicsOptions={physicsOptions}
          handlePhysicsChange={handlePhysicsChange}
          restartStabilization={() => setStabilizationComplete(false)}
          style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000 }}
        />
      </section>
    </section>
  );
};

export default GraphVisualization;