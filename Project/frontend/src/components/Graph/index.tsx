import { useEffect, useState } from 'react';
import { MultiDirectedGraph } from 'graphology';
import { SigmaContainer } from '@react-sigma/core';
import { useParams } from 'react-router-dom';
import '@react-sigma/core/lib/react-sigma.min.css';
import EdgeCurveProgram, {
  DEFAULT_EDGE_CURVATURE,
  indexParallelEdgesIndex,
} from '@sigma/edge-curve';
import { EdgeArrowProgram } from 'sigma/rendering';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';

export default function Graph() {
  const [graphData, setGraphData] = useState<MultiDirectedGraph | null>(null);
  const { fileId = '' } = useParams();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API)
      .then((res) => res.json())
      .then((graphData) => {
        const graph = new MultiDirectedGraph();
        graphData?.nodes?.forEach((node: any) => {
          const { id, ...rest } = node;
          graph.addNode(id, {
            ...rest,
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        });
        graphData?.edges?.forEach((edge: any) => {
          const { id, source, target, ...rest } = edge;
          graph.addEdgeWithKey(id, source, target, rest);
        });
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
  }, [fileId]);

  if (isLoading) {
    return <div className="loading_spinner_graph">Loading graph...</div>;
  }
  if (!graphData) {
    return (
      <div className="error_container">Sorry error has been occurred!</div>
    );
  }
  return (
    <section className="graph_container">
      <h1>Graph Visualization</h1>
      <SigmaContainer
        style={{
          height: 'calc(100vh - 50px)',
          width: '100vw',
          marginLeft: '-50%',
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
      ></SigmaContainer>
    </section>
  );
}
