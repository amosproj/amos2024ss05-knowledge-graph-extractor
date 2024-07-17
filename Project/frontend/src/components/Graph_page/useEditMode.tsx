import { useState, useEffect } from 'react';

export const useEditMode = (networkRef, topicColorMap, graphData, updateNodeStyles) => {
  const [editMode, setEditMode] = useState(false);
  const [selectedNodes, setSelectedNodes] = useState(new Set());
  const [firstClick, setFirstClick] = useState(false); // Track if a node has been clicked in edit mode

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setSelectedNodes(new Set());
      setEditMode(false);
      setFirstClick(false); // Reset first click status
      updateNodeStyles();
    } else if (event.key === 'e') {
      setEditMode((prevEditMode) => !prevEditMode);
      if (!prevEditMode) {
        setFirstClick(false); // Reset first click status when entering edit mode
      }
      updateNodeStyles();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (networkRef.current) {
      updateNodeStyles();
    }
  }, [selectedNodes, editMode, firstClick]);

  const highlightActiveNodes = (params) => {
    if (!editMode) return;

    const allNodes = networkRef.current.body.nodes;
    const allEdges = networkRef.current.body.edges;
    const nodeId = params.node;
    const connectedNodes = networkRef.current.getConnectedNodes(nodeId);
    const connectedEdges = networkRef.current.getConnectedEdges(nodeId);

    // Dim all nodes and edges and hide labels
    for (let nodeId in allNodes) {
      allNodes[nodeId].setOptions({
        color: { background: '#2f2f2f', border: '#2f2f2f' },
        opacity: 0.3,
        font: { color: '#2f2f2f', strokeWidth: 0 },
      });
    }
    for (let edgeId in allEdges) {
      allEdges[edgeId].setOptions({ color: '#2f2f2f', opacity: 0.1, font: { color: '#2f2f2f' }, hidden: true });
    }

    // Highlight the hovered node and its neighbors
    allNodes[nodeId].setOptions({
      opacity: 1,
      color: { background: topicColorMap[graphData.nodes.find((node) => node.id === nodeId)?.topic || ''], border: 'white' },
      font: { color: 'white', strokeWidth: 3, strokeColor: 'black' },
    });
    connectedNodes.forEach((id) => {
      allNodes[id].setOptions({
        opacity: 1,
        color: { background: topicColorMap[graphData.nodes.find((node) => node.id === id)?.topic || ''], border: 'white' },
        font: { color: 'white', strokeWidth: 3, strokeColor: 'black' },
      });
    });
    connectedEdges.forEach((id) => {
      allEdges[id].setOptions({ opacity: 0.5, color: '#ccccff', font: { color: 'white' }, hidden: false });
    });
  };

  const resetHighlight = () => {
    if (!editMode || (editMode && !firstClick)) {
      const allNodes = networkRef.current.body.nodes;
      const allEdges = networkRef.current.body.edges;

      // Reset all nodes and edges to normal state
      for (let nodeId in allNodes) {
        allNodes[nodeId].setOptions({
          color: { background: topicColorMap[graphData.nodes.find((node) => node.id === nodeId)?.topic || ''], border: 'white' },
          opacity: 1,
          font: { color: 'white', strokeWidth: 3, strokeColor: 'black' },
        });
      }
      for (let edgeId in allEdges) {
        allEdges[edgeId].setOptions({ color: '#ccccff', opacity: 1, font: { color: 'white' }, hidden: false });
      }
    } else {
      updateNodeStyles();
    }
  };

  return {
    editMode,
    selectedNodes,
    setSelectedNodes,
    highlightActiveNodes,
    resetHighlight,
    setFirstClick,
    firstClick,
  };
};
