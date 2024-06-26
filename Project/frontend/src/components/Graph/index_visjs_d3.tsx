import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import FloatingControlCard from './FloatingControlCard';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';
import D3Graph from './D3Graph';
import { CircularProgress, Typography, Box } from '@mui/material';

const GraphVisualization = () => {
  const { fileId = '' } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('barnesHut');
  const [physicsOptions, setPhysicsOptions] = useState({
    gravitationalConstant: -20000,
    springLength: 100,
    springConstant: 0.1,
    damping: 0.09,
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

  const handlePhysicsChange = (name, value) => {
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
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
      <FloatingControlCard
        layout={layout}
        setLayout={setLayout}
        physicsOptions={physicsOptions}
        handlePhysicsChange={handlePhysicsChange}
      />
      <D3Graph graphData={graphData} />
    </section>
  );
};

export default GraphVisualization;