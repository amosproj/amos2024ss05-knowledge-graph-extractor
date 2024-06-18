import React, { useEffect, useState, useRef } from 'react';
import { Network } from 'vis-network/standalone/esm/vis-network';
import { useParams } from 'react-router-dom';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';

const VisGraph = ({ graphData, options }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!graphData) return;

    const data = {
      nodes: graphData.nodes.map(node => ({
        id: node.id,
        label: node.id,
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
      edges: graphData.edges.map(edge => ({
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

    const network = new Network(containerRef.current, data, options);

    network.on("selectNode", function (params) {
      network.setSelection({
        nodes: params.nodes,
        edges: network.getConnectedEdges(params.nodes[0])
      });
    });

    return () => network.destroy();
  }, [graphData, options]);

  return <div ref={containerRef} style={{ width: '100vw', height: 'calc(100vh - 50px)', background: '#1A2130' }} />;
};

const GraphVisualization = () => {
  const { fileId = '' } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');

  useEffect(() => {
    const fetchGraphData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`);
        const data = await response.json();
        setGraphData(data);
      } catch (error) {
        console.error('Error fetching graph data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGraphData();
  }, [fileId]);

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
    physics: layout === 'barnesHut' ? {
      enabled: true,
      barnesHut: {
        gravitationalConstant: -20000,
        springLength: 100,
        springConstant: 0.1,
      },
      stabilization: {
        iterations: 2500,
      },
    } : layout === 'forceAtlas2Based' ? {
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
    } : layout === 'hierarchicalRepulsion' ? {
      enabled: true,
      hierarchicalRepulsion: {
        nodeDistance: 120,
      },
      stabilization: {
        iterations: 2500,
      },
    } : layout === 'repulsion' ? {
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
    } : layout === 'hierarchical' ? {
      enabled: true,
      hierarchical: {
        direction: 'UD', // UD, DU, LR, RL
        sortMethod: 'hubsize', 
      },
      stabilization: {
        iterations: 2500,
      },
    } : layout === 'grid' ? {
      enabled: false,
      layout: {
        hierarchical: false,
        randomSeed: undefined,
        improvedLayout: true,
      },
      physics: {
        enabled: false,
      },
    } : {
      enabled: true,
      randomSeed: 2,
    },
  };

  if (isLoading) {
    return <div className="loading_spinner_graph">Loading graph...</div>;
  }

  if (!graphData) {
    return <div className="error_container">Sorry, an error has occurred!</div>;
  }

  return (
    <section className="graph_container">
      <h1>Graph Visualization</h1>
      <select onChange={(e) => setLayout(e.target.value)} value={layout}>
        <option value="barnesHut">Barnes Hut</option>
        <option value="forceAtlas2Based">Force Atlas 2 Based</option>
        <option value="hierarchicalRepulsion">Hierarchical Repulsion</option>
        <option value="repulsion">Repulsion</option>
        <option value="hierarchical">Hierarchical</option>
        <option value="grid">Grid</option>
        <option value="random">Random</option>
      </select>
      <VisGraph graphData={graphData} options={options} />
    </section>
  );
};

export default GraphVisualization;