import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const D3Graph = ({ graphData, layout }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!graphData) return;

    // Set up SVG dimensions
    const width = window.innerWidth;
    const height = window.innerHeight - 50;

    // Clear previous graph
    d3.select(containerRef.current).select('svg').remove();

    // Create SVG element
    const svg = d3.select(containerRef.current)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .call(d3.zoom().on('zoom', (event) => {
        svg.attr('transform', event.transform);
      }))
      .append('g');

    // Set up the simulation
    const simulation = d3.forceSimulation(graphData.nodes)
      .force('link', d3.forceLink(graphData.edges).id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));

    // Apply different layout algorithms
    if (layout === 'hierarchical') {
      simulation.force('y', d3.forceY().strength(0.1));
      simulation.force('x', d3.forceX().strength(0.1));
    }

    // Create links
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphData.edges)
      .enter()
      .append('line')
      .attr('stroke-width', 2)
      .attr('stroke', '#fff');

    // Create link labels
    const linkLabels = svg.append('g')
      .attr('class', 'link-labels')
      .selectAll('text')
      .data(graphData.edges)
      .enter()
      .append('text')
      .attr('class', 'link-label')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .text(d => d.label)  // Correctly reading the label property for edges
      .attr('fill', '#fff');

    // Create nodes
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('circle')
      .data(graphData.nodes)
      .enter()
      .append('circle')
      .attr('r', 25)
      .attr('fill', '#69b3a2')
      .attr('stroke', '#508e7f')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));

    // Node labels
    const nodeLabels = svg.append('g')
      .attr('class', 'node-labels')
      .selectAll('text')
      .data(graphData.nodes)
      .enter()
      .append('text')
      .attr('class', 'node-label')
      .attr('dx', 15)
      .attr('dy', '.35em')
      .text(d => d.label)  // Correctly reading the label property for nodes
      .attr('fill', '#fff');

    // Update simulation
    simulation
      .nodes(graphData.nodes)
      .on('tick', ticked);

    simulation.force('link')
      .links(graphData.edges);

    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);

      node
        .attr('cx', d => d.x)
        .attr('cy', d => d.y);

      nodeLabels
        .attr('x', d => d.x)
        .attr('y', d => d.y);

      linkLabels
        .attr('x', d => (d.source.x + d.target.x) / 2)
        .attr('y', d => (d.source.y + d.target.y) / 2);
    }

    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Stabilize nodes after a certain time
    setTimeout(() => {
      simulation.alphaTarget(0).restart();
    }, 5000); // 5 seconds stabilization time

  }, [graphData, layout]);

  return <div ref={containerRef} style={{ width: '100vw', height: 'calc(100vh - 50px)', background: '#1A2130' }} />;
};

export default D3Graph;