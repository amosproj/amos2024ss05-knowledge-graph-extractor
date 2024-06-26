import { useEffect, useState } from 'react';
import { MultiDirectedGraph } from 'graphology';
import { SigmaContainer, useSigma } from '@react-sigma/core';
import { useParams } from 'react-router-dom';
import '@react-sigma/core/lib/react-sigma.min.css';
import EdgeCurveProgram, { DEFAULT_EDGE_CURVATURE, indexParallelEdgesIndex } from '@sigma/edge-curve';
import { EdgeArrowProgram } from 'sigma/rendering';
import forceAtlas2 from 'graphology-layout-forceatlas2';
import FloatingControlCard from './FloatingControlCard_sigma';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';

const ForceAtlas2Layout = ({ settings, onIteration, restart }) => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const [iterations, setIterations] = useState(0);

  useEffect(() => {
    if (restart) {
      setIterations(0);
    }

    const applyLayout = () => {
      forceAtlas2.assign(graph, { ...settings, adjustSizes: true });
      setIterations((prev) => {
        const newIteration = prev + 1;
        onIteration(newIteration);
        return newIteration;
      });
    };

    if (iterations < settings.iterations) {
      const interval = setInterval(applyLayout, 10); // Reduce interval for faster calculations
      return () => clearInterval(interval);
    }
  }, [graph, iterations, settings, onIteration, restart]);

  return null;
};

export default function GraphVisualization() {
  const [graphData, setGraphData] = useState(null);
  const { fileId = '' } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState('forceAtlas2Based');
  const [physicsOptions, setPhysicsOptions] = useState({
    iterations: 200,
    barnesHutOptimize: true,
    barnesHutTheta: 0.5,
    slowDown: 0.1, // Faster calculations
    gravity: 5, // Stronger gravity
    scalingRatio: 10,
    edgeWeightInfluence: 1,
    strongGravityMode: true,
    adjustSizes: true,
    edgeLength: 100, // Added for edge length
  });
  const [restart, setRestart] = useState(false);

  useEffect(() => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API)
      .then((res) => res.json())
      .then((graphData) => {
        const graph = new MultiDirectedGraph();
        graphData?.nodes?.forEach(
          (node) => {
            const { id, ...rest } = node;
            graph.addNode(id, {
              ...rest,
              size: 15, // just for testing, i am making all the same size
              x: Math.random() * 1000,
              y: Math.random() * 1000,
            });
          },
        );
        graphData?.edges?.forEach(
          (edge) => {
            const { id, source, target, ...rest } = edge;
            graph.addEdgeWithKey(id, source, target, {
              ...rest,
              size: 2, // edge
              length: physicsOptions.edgeLength, // Set edge length
            });
          },
        );
        indexParallelEdgesIndex(graph, {
          edgeIndexAttribute: 'parallelIndex',
          edgeMaxIndexAttribute: 'parallelMaxIndex',
        });
        graph.forEachEdge((edge, { parallelIndex, parallelMaxIndex }) => {
          if (typeof parallelIndex === 'number') {
            graph.mergeEdgeAttributes(edge, {
              type: 'curved',
              curvature:
                DEFAULT_EDGE_CURVATURE +
                (3 * DEFAULT_EDGE_CURVATURE * parallelIndex) /
                  (parallelMaxIndex || 1),
            });
          } else {
            graph.setEdgeAttribute(edge, 'type', 'straight');
          }
        });
        setGraphData(graph);
      })
      .catch((error) => {
        console.log('Error fetching graphData:', error);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [fileId, physicsOptions.edgeLength]); // Re-fetch data when edge length changes

  const handlePhysicsChange = (name, value) => {
    setPhysicsOptions((prevOptions) => ({
      ...prevOptions,
      [name]: value,
    }));
    setRestart(true);
  };

  useEffect(() => {
    if (restart) {
      setRestart(false);
    }
  }, [restart]);

  if (isLoading) {
    return <div className="loading_spinner_graph">Loading graph...</div>;
  }
  if (!graphData) {
    return (
      <div className="error_container">Sorry, an error has occurred!</div>
    );
  }
  return (
    <section className="graph_container" style={{ background: '#1A2130' }}>
      <h1>Graph Visualization</h1>
      <FloatingControlCard
        layout={layout}
        setLayout={setLayout}
        physicsOptions={physicsOptions}
        handlePhysicsChange={handlePhysicsChange}
      />
      <SigmaContainer
        style={{
          height: 'calc(100vh - 50px)',
          width: '100vw',
        }}
        graph={graphData}
        settings={{
          allowInvalidContainer: true,
          renderLabels: true,
          renderEdgeLabels: true,
          labelRenderedSizeThreshold: 0,
          defaultEdgeType: 'straight',
          edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurveProgram,
          },
        }}
      >
        <ForceAtlas2Layout settings={physicsOptions} onIteration={(iteration) => console.log(`Iteration: ${iteration}`)} restart={restart} />
      </SigmaContainer>
    </section>
  );
}