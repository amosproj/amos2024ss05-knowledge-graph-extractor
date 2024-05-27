import { useEffect, useState } from "react";

import { MultiDirectedGraph } from "graphology";
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/react-sigma.min.css";
import EdgeCurveProgram, { DEFAULT_EDGE_CURVATURE, indexParallelEdgesIndex } from "@sigma/edge-curve";
import { EdgeArrowProgram } from "sigma/rendering";

import "./index.css";

export default function Graph() {

  const [graphData, setGraphData] = useState<MultiDirectedGraph>({} as any);

  useEffect(() => {
    fetch('https://run.mocky.io/v3/0d596fcc-8909-4b4b-bae3-4c0400f2fa49')
      .then((res) => res.json())
      .then((graphData) => {
        const graph = new MultiDirectedGraph();
        graphData?.nodes?.forEach((node: any) => {
          const { id, ...rest } = node;
          graph.addNode(id, { ...rest, x: Math.random(), y: Math.random() });
        });
        graphData?.edges?.forEach((edge: any) => {
          const { id, source, target, ...rest } = edge;
          graph.addEdgeWithKey(id, source, target, rest);
        });

        indexParallelEdgesIndex(graph, { edgeIndexAttribute: "parallelIndex", edgeMaxIndexAttribute: "parallelMaxIndex" });

        // Adapt types and curvature of parallel edges for rendering:
        graph.forEachEdge((edge, { parallelIndex, parallelMaxIndex }) => {
          if (typeof parallelIndex === "number") {
            graph.mergeEdgeAttributes(edge, {
              type: "curved",
              curvature: DEFAULT_EDGE_CURVATURE + (3 * DEFAULT_EDGE_CURVATURE * parallelIndex) / (parallelMaxIndex || 1),
            });
          } else {
            graph.setEdgeAttribute(edge, "type", "straight");
          }
        });

        setGraphData(graph);

        console.log(graph)
      })
      .catch((error) => {
        console.error('Error fetching graphData:', error);
      });
  }, []);

  if (!graphData?.nodes) return null;

  return (
    <main>
      <h1>Graph Visualization</h1>
      <SigmaContainer
        style={{
          maxHeight: "100vh",
          minHeight: "50vh",
          height: "70vh",
          width: "70vw",
          marginLeft: "-50%",
        }}
        graph={graphData}
        settings={{
          allowInvalidContainer: true,
          renderLabels: true,
          renderEdgeLabels: true,
          defaultEdgeType: "straight",
          edgeProgramClasses: {
            straight: EdgeArrowProgram,
            curved: EdgeCurveProgram,
          },

        }}
      >
      </SigmaContainer>
    </main>
  )
{}}
