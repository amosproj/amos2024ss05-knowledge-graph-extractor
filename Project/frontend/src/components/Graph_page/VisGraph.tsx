import React, { useEffect, useState, useRef } from 'react';
import { Network, Options } from 'vis-network/standalone/esm/vis-network';
import { Box, Snackbar } from '@mui/material';
import { useEditMode } from './useEditMode'; // Import the custom hook

interface GraphData {
  nodes: Array<{
    id: string;
    label?: string;
    topic: string;
    pages: string;
    x?: number;
    y?: number;
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
  stabilizationComplete: boolean;
  setGraphData: React.Dispatch<React.SetStateAction<GraphData | null>>;
  topicColorMap: ITopicColourMap;
  isStabilizingRef: React.MutableRefObject<boolean>;
  fileId: string;
}> = ({
  graphData,
  options,
  setStabilizationComplete,
  stabilizationComplete,
  setGraphData,
  topicColorMap,
  isStabilizingRef,
  fileId,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);
  const [stabilizationProgress, setStabilizationProgress] = useState(0);
  const [isStabilizing, setIsStabilizing] = useState(false);
  const [showStabilizingMessage, setShowStabilizingMessage] = useState(false);

  const updateNodeStyles = () => {
    if (!networkRef.current) return;

    const allNodes = networkRef.current.body.nodes;
    const allEdges = networkRef.current.body.edges;

    if (!editMode || !firstClick) {
      // Reset all nodes and edges to normal state
      for (let nodeId in allNodes) {
        allNodes[nodeId].setOptions({
          color: { background: topicColorMap[graphData.nodes.find(node => node.id === nodeId)?.topic || ''], border: 'white' },
          opacity: 1,
          font: { color: 'white', strokeWidth: 3, strokeColor: 'black' }, // Add border to labels
        });
      }
      for (let edgeId in allEdges) {
        allEdges[edgeId].setOptions({ color: '#ccccff', opacity: 1, font: { color: 'white' }, hidden: false });
      }
      return;
    }

    // Reset all nodes and edges to dimmed state
    for (let nodeId in allNodes) {
      allNodes[nodeId].setOptions({
        color: { background: '#2f2f2f', border: '#2f2f2f' },
        opacity: 0.3,
        font: { color: '#2f2f2f', strokeWidth: 0 }, // Remove label border when dimmed
      });
    }
    for (let edgeId in allEdges) {
      allEdges[edgeId].setOptions({ color: '#2f2f2f', opacity: 0.1, font: { color: '#2f2f2f' }, hidden: true });
    }

    // Highlight selected nodes and their neighbors
    selectedNodes.forEach(nodeId => {
      const connectedNodes = networkRef.current.getConnectedNodes(nodeId);
      const connectedEdges = networkRef.current.getConnectedEdges(nodeId);

      allNodes[nodeId].setOptions({
        opacity: 1,
        color: { background: '#ffd700', border: 'white' },
        font: { color: 'white', strokeWidth: 3, strokeColor: 'black' }, // Add label border for selected nodes
      });
      connectedNodes.forEach((id: any) => {
        if (selectedNodes.has(id)) {
          allNodes[id].setOptions({
            opacity: 1,
            color: { background: '#ffd700', border: 'white' },
            font: { color: 'white', strokeWidth: 3, strokeColor: 'black' }, // Add label border for connected selected nodes
          });
        } else {
          allNodes[id].setOptions({
            opacity: 1,
            color: { background: topicColorMap[graphData.nodes.find(node => node.id === id)?.topic || ''], border: 'white' },
            font: { color: 'white', strokeWidth: 3, strokeColor: 'black' }, // Add label border for connected nodes
          });
        }
      });
      connectedEdges.forEach((id: any) => {
        if (selectedNodes.has(networkRef.current?.body.edges[id].fromId) && selectedNodes.has(networkRef.current?.body.edges[id].toId)) {
          allEdges[id].setOptions({ opacity: 1, color: '#ffd700', font: { color: 'white' }, hidden: false });
        } else {
          allEdges[id].setOptions({ opacity: 0.5, color: '#ccccff', font: { color: 'white' }, hidden: false });
        }
      });
    });
  };

  const {
    editMode,
    selectedNodes,
    setSelectedNodes,
    highlightActiveNodes,
    resetHighlight,
    setFirstClick,
    firstClick,
  } = useEditMode(networkRef, topicColorMap, graphData, updateNodeStyles);

  useEffect(() => {
    if (!containerRef.current || !graphData) return;

    const savedPositions = sessionStorage.getItem(`${fileId}_positions`);
    const parsedPositions = savedPositions ? JSON.parse(savedPositions) : {};

    const data = {
      nodes: graphData.nodes.map((node) => ({
        id: node.id,
        label: node.label || node.id,
        shape: 'dot',
        size: 25,
        x: parsedPositions[node.id]?.x ?? node.x,
        y: parsedPositions[node.id]?.y ?? node.y,
        ...node,
        title: `Found in pages: ${node.pages}
        Topic: ${node.topic.substring(node.topic.indexOf('_') + 1)}`,
        color: {
          background: topicColorMap[node.topic],
          border: 'white',
          highlight: {
            background: '#69b3a2',
            border: 'white',
          },
        },
        font: { color: 'white', strokeWidth: 3, strokeColor: 'black' }, // Add border to labels
      })),
      edges: graphData.edges.map((edge) => ({
        from: edge.source,
        to: edge.target,
        ...edge,
        arrows: {
          to: { enabled: false },
          from: { enabled: false },
        },
        color: {
          color: '#ccccff',
          highlight: '#ffff00',
          hover: '#ffffff',
        },
        font: {
          color: 'white',
        },
      })),
    };

    if (networkRef.current) {
      networkRef.current.destroy();
    }

    const network = new Network(containerRef.current, data, options);
    networkRef.current = network;

    if (!stabilizationComplete) {
      setIsStabilizing(true);
      setStabilizationProgress(0);
      setShowStabilizingMessage(true);
      network.setOptions({ physics: true });

      const stabilizationProgressHandler = (params: any) => {
        const progress = (params.iterations / params.total) * 100;
        setStabilizationProgress((prevProgress) =>
          Math.max(prevProgress, progress),
        );
      };

      const stabilizationIterationsDoneHandler = () => {
        const positions = network.getPositions();
        const updatedNodes = graphData.nodes.map((node) => ({
          ...node,
          x: positions[node.id].x,
          y: positions[node.id].y,
        }));

        const updatedGraphData = {
          ...graphData,
          nodes: updatedNodes,
        };

        setGraphData(updatedGraphData);
        sessionStorage.setItem(fileId, JSON.stringify(updatedGraphData));
        sessionStorage.setItem(`${fileId}_positions`, JSON.stringify(positions)); // Save positions

        network.setOptions({ physics: false });
        setStabilizationComplete(true);
        setIsStabilizing(false);
        setShowStabilizingMessage(false);
      };

      network.on('stabilizationProgress', stabilizationProgressHandler);
      network.on('stabilizationIterationsDone', stabilizationIterationsDoneHandler);
    } else {
      network.setOptions({ physics: false });
    }

    network.on('dragStart', function (params) {
      if (params.nodes.length > 0) {
        network.setOptions({ physics: true });
      }
    });

    network.on('dragEnd', function (params) {
      if (params.nodes.length > 0) {
        setTimeout(() => {
          if (networkRef.current) {
            const positions = networkRef.current.getPositions();
            const updatedNodes = graphData.nodes.map((node) => ({
              ...node,
              x: positions[node.id].x,
              y: positions[node.id].y,
            }));

            const updatedGraphData = {
              ...graphData,
              nodes: updatedNodes,
            };
            setGraphData(updatedGraphData);
            sessionStorage.setItem(fileId, JSON.stringify(updatedGraphData));
            sessionStorage.setItem(`${fileId}_positions`, JSON.stringify(positions)); // Save positions

            // Ensure that the view doesn't change after dragging
            networkRef.current.setOptions({ physics: false });
          }
        }, 70000); // Delay before disabling physics
      }
    });

    network.on('hoverNode', highlightActiveNodes);
    network.on('blurNode', resetHighlight);

    network.on('click', function (params) {
      if (editMode && params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        setSelectedNodes((prevSelectedNodes) => {
          const newSelectedNodes = new Set(prevSelectedNodes);
          if (newSelectedNodes.has(nodeId)) {
            newSelectedNodes.delete(nodeId);
          } else {
            newSelectedNodes.add(nodeId);
          }
          return newSelectedNodes;
        });
        setFirstClick(true); // Set first click to true on the first node click in edit mode
        updateNodeStyles(); // Update styles immediately after selecting nodes
      }
    });

    return () => {
      if (networkRef.current) {
        networkRef.current.off('stabilizationProgress');
        networkRef.current.off('stabilizationIterationsDone');
        networkRef.current.off('dragStart');
        networkRef.current.off('dragEnd');
        networkRef.current.off('hoverNode', highlightActiveNodes);
        networkRef.current.off('blurNode', resetHighlight);
        networkRef.current.off('click');
        networkRef.current.destroy();
        networkRef.current = null;
      }
    };
  }, [graphData, options, topicColorMap, setStabilizationComplete, fileId, selectedNodes, editMode, firstClick]);

  useEffect(() => {
    if (networkRef.current) {
      updateNodeStyles();
    }
  }, [selectedNodes, editMode, firstClick]);

  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        height: '100%',
        background: '#0e1e30',
      }}
    >
      <Box ref={containerRef} sx={{ width: '100%', height: '100%' }} />
      <Snackbar
        open={showStabilizingMessage}
        message={`Stabilizing... ${Math.round(stabilizationProgress)}%`}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      />
    </Box>
  );
};

export default VisGraph;

