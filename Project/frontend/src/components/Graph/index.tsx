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
import { CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface Node {
  id: string;
  label: string;
  size: number;
  color: string;
}

interface Edge {
  id: string;
  label: string;
  size: number;
  color: string;
  source: string;
  target: string;
  type: string;
}

interface GraphData {
  nodes: Node[];
  edges: Edge[];
}

function findLast40PercentSize(
  totalCount: number,
  sizeNodeCounts: Map<number, number>,
): number {
  // Convert Map to an array of [size, count] pairs and sort by size numerically in descending order
  const sortedEntries = Array.from(sizeNodeCounts.entries()).sort(
    (a, b) => b[0] - a[0],
  );

  // Determine 40% and 50% thresholds based on totalCount
  const targetThreshold = 0.4 * totalCount;
  const maxThreshold = 0.5 * totalCount;

  // Cumulative sum to find the starting point of the last 40%
  let cumulativeSum = 0;
  let previousSize: number = sortedEntries[0][0]; // Start with the largest size by default

  for (const [size, count] of sortedEntries) {
    cumulativeSum += count;

    if (cumulativeSum >= targetThreshold) {
      // If cumulative sum with current size exceeds 50%, return the previous size
      if (cumulativeSum > maxThreshold) {
        return previousSize;
      }
      return size;
    }

    previousSize = size;
  }

  // Return the last size if all sizes are within the 40% threshold
  return previousSize;
}

export default function Graph() {
  const [graphData, setGraphData] = useState<MultiDirectedGraph | null>(null);
  const { fileId = '' } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [threshold, setThreshold] = useState(0);
  const theme = useTheme();

  useEffect(() => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API)
      .then((res) => res.json())
      .then((graphData: GraphData) => {
        const graph = new MultiDirectedGraph();
        const sizeCountMap = new Map<number, number>();
        graphData?.nodes?.forEach((node) => {
          const { id, ...rest } = node;
          const size = rest.size;
          if (sizeCountMap.has(size)) {
            sizeCountMap.set(size, sizeCountMap.get(size)! + 1);
          } else {
            sizeCountMap.set(size, 1);
          }
          graph.addNode(id, {
            ...rest,
            x: Math.random() * 100,
            y: Math.random() * 100,
          });
        });

        const threshold = findLast40PercentSize(
          graphData?.nodes.length ?? 0,
          sizeCountMap,
        );
        setThreshold(threshold);

        graphData?.edges?.forEach((edge) => {
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
    return (
      <div className="loader_container_graph">
        <CircularProgress size={30} />
        <span>Loading graph...</span>
      </div>
    );
  }
  if (!graphData) {
    return (
      <div className="error_container">Sorry error has been occurred!</div>
    );
  }
  return (
    <section className="graph_container">
      <Typography
        variant="h6"
        className="title"
        sx={{ color: (theme) => theme.palette.text.secondary }}
      >
        Graph Visualization
      </Typography>
      <SigmaContainer
        style={{
          height: 'calc(100vh - 50px)',
          width: '100vw',
          marginLeft: '-50%',
          background: theme.palette.background.default,
        }}
        graph={graphData}
        settings={{
          allowInvalidContainer: true,
          renderLabels: true,
          renderEdgeLabels: true,
          labelRenderedSizeThreshold: threshold,
          defaultEdgeType: 'straight',
          edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurveProgram,
          },
          labelColor: { color: 'green' },
        }}
      ></SigmaContainer>
    </section>
  );
}
