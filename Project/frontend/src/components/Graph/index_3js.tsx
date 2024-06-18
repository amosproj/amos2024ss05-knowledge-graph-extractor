import { useEffect, useState, useRef } from 'react';
import {
  select,
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  zoom,
  drag,
} from 'd3';
import { useParams } from 'react-router-dom';
import './index.css';
import { VISUALIZE_API_PATH } from '../../constant';

const GraphVisualization = () => {
  const svgRef = useRef();
  const { fileId = '' } = useParams();
  const [graphData, setGraphData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const API = `${import.meta.env.VITE_BACKEND_HOST}${VISUALIZE_API_PATH.replace(':fileId', fileId)}`;
    fetch(API)
      .then((res) => res.json())
      .then((data) => {
        setGraphData(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error fetching graph data:', error);
        setIsLoading(false);
      });
  }, [fileId]);

  useEffect(() => {
    if (!graphData) return;

    const svg = select(svgRef.current);
    const width = svgRef.current.clientWidth;
    const height = svgRef.current.clientHeight;

    const g = svg.append('g');

    const simulation = forceSimulation(graphData.nodes)
      .force(
        'link',
        forceLink(graphData.edges)
          .id((d) => d.id)
          .distance(100),
      )
      .force('charge', forceManyBody().strength(-200))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collide', forceCollide().radius(30).strength(1))
      .alphaDecay(0.01)
      .alphaMin(0.001);

    const link = g
      .selectAll('line')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-width', 1.5)
      .attr('id', (d, i) => `link${i}`);

    const node = g
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', 15)
      .attr('fill', '#69b3a2')
      .call(
        drag()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on('drag', (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          }),
      )
      .on('mouseover', function (event, d) {
        select(this).attr('fill', 'orange');
        svg
          .select('#tooltip')
          .style('display', 'block')
          .html(`ID: ${d.id}<br>Label: ${d.label || 'N/A'}`)
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY + 10}px`);
      })
      .on('mouseout', function () {
        select(this).attr('fill', '#69b3a2');
        svg.select('#tooltip').style('display', 'none');
      });

    const nodeLabels = g
      .selectAll('text.node-label')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('dy', -20)
      .attr('text-anchor', 'middle')
      .style('font-size', '12px')
      .style('pointer-events', 'none')
      .text((d) => d.id);

    // Create path elements for each link
    const linkPaths = g
      .selectAll('path')
      .data(graphData.edges)
      .enter()
      .append('path')
      .attr('class', 'link-path')
      .attr('id', (d, i) => `link-path${i}`)
      .attr('fill', 'none')
      .attr('stroke', 'none');

    const edgeLabels = g
      .selectAll('text.edge-label')
      .data(graphData.edges)
      .enter()
      .append('text')
      .attr('class', 'edge-label')
      .attr('dy', -5)
      .style('font-size', '10px')
      .style('pointer-events', 'none')
      .append('textPath')
      .attr('xlink:href', (d, i) => `#link-path${i}`)
      .attr('startOffset', '50%')
      .style('text-anchor', 'middle')
      .text((d) => d.id);

    const zoomBehavior = zoom().on('zoom', (event) => {
      g.attr('transform', event.transform);
    });

    svg.call(zoomBehavior);

    simulation.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);

      node.attr('cx', (d) => d.x).attr('cy', (d) => d.y);

      nodeLabels.attr('x', (d) => d.x).attr('y', (d) => d.y);

      linkPaths.attr(
        'd',
        (d) => `M${d.source.x},${d.source.y} L${d.target.x},${d.target.y}`,
      );

      edgeLabels
        .attr('x', (d) => (d.source.x + d.target.x) / 2)
        .attr('y', (d) => (d.source.y + d.target.y) / 2);
    });

    svg
      .append('foreignObject')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background', '#fff')
      .style('border', '1px solid #ccc')
      .style('padding', '10px')
      .style('display', 'none')
      .append('xhtml:div')
      .style('font-size', '10px')
      .html('Tooltip');

    return () => simulation.stop();
  }, [graphData]);

  if (isLoading) {
    return <div className="loading_spinner_graph">Loading graph...</div>;
  }
  if (!graphData) {
    return <div className="error_container">Sorry, an error has occurred!</div>;
  }
  return (
    <section className="graph_container">
      <h1>Graph Visualization</h1>
      <svg
        ref={svgRef}
        style={{ width: '100vw', height: 'calc(100vh - 50px)' }}
      />
    </section>
  );
};

export default GraphVisualization;
