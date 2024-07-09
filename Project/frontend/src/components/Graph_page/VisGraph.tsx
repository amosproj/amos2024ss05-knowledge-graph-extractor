import React, { useEffect, useState, useRef } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { Box, CircularProgress, Typography } from '@mui/material';

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

  useEffect(() => {
    const handleResize = () => {
      if (networkRef.current) {
        networkRef.current.redraw();
        networkRef.current.fit();
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      })),
      edges: graphData.edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        ...edge,
        arrows: {
          to: { enabled: false }, // Entfernt die Pfeile in Richtung des Ziels
          from: { enabled: false },
        },
        color: {
          color: '#ccccff',
          highlight: '#ffff00',
          hover: '#ffffff',
        },
      })),
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    setIsStabilizing(true);
    setStabilizationProgress(0);

    const stabilizationProgressHandler = (params: any) => {
      const progress = (params.iterations / params.total) * 100;
      setStabilizationProgress((prevProgress) =>
        Math.max(prevProgress, progress),
      );
    };

    const stabilizationIterationsDoneHandler = () => {
      setStabilizationProgress(100);
      setIsStabilizing(false);
      setStabilizationComplete(true);
      network.fit();
    };

    network.on('stabilizationProgress', stabilizationProgressHandler);
    network.on(
      'stabilizationIterationsDone',
      stabilizationIterationsDoneHandler,
    );

    return () => {
      network.off('stabilizationProgress', stabilizationProgressHandler);
      network.off(
        'stabilizationIterationsDone',
        stabilizationIterationsDoneHandler,
      );
      network.destroy();
      networkRef.current = null;
    };
  }, [graphData, options, topicColorMap, setStabilizationComplete]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0e1e30',
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

export default VisGraph;
