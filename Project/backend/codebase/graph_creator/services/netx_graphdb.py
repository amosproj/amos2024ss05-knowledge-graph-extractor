import os
import uuid

import networkx as nx
import numpy as np
import pandas as pd

from graph_creator.models.graph_job import GraphJob
from graph_creator.schemas.graph_vis import GraphVisData, GraphNode, GraphEdge

# Scale range for min-max scaling the node sizes
scale_range = [15, 35]


class NetXGraphDB:
    """
    This class serves as a service to create, read, save and work with graphs
    via the networkx package.
    Graphs will be saved in .edgelist format in local-storage and retrieved from there.
    All the graphs operations will happen in memory.
    """

    def create_graph_from_df(self, data: pd.DataFrame, chunks: dict) -> nx.Graph:
        df = pd.DataFrame(data)
        graph = nx.Graph()

        chunk_to_page = {}
        for i, chunk in enumerate(chunks):
            chunk_id = i
            page_number = chunk["metadata"].get("page", "No page in metadata")
            chunk_to_page[chunk_id] = page_number

        # Iterate over each row in the DataFrame
        for _, edge in df.iterrows():
            # Get the page number using the chunk id

            chunk_id = edge["chunk_id"]
            page_number = chunk_to_page[int(chunk_id)]
            if isinstance(page_number, int):
                page_number += 1

            # Add nodes with page attribute
            if edge["node_1"] not in graph:
                graph.add_node(
                    edge["node_1"], pages=set([]), topic=edge["topic_node_1"]
                )
            if edge["node_2"] not in graph:
                graph.add_node(
                    edge["node_2"], pages=set([]), topic=edge["topic_node_2"]
                )

            # Add edge with attributes to the graph
            graph.add_edge(edge["node_1"], edge["node_2"], relation=edge["edge"])

            # Add page numbers to each node
            graph.nodes[edge["node_1"]]["pages"].add(page_number)
            graph.nodes[edge["node_2"]]["pages"].add(page_number)

        # Sort pages and save as a string
        for node in graph.nodes:
            graph.nodes[node]["pages"] = ",".join(
                map(str, sorted(graph.nodes[node]["pages"]))
            )

        # Add min max log scaled sizes to nodes based on degree
        log_sizes = [np.log(graph.degree(node)) for node in graph.nodes()]
        min_log_size = min(log_sizes)
        max_log_size = max(log_sizes)

        scaled_sizes = [
            round(
                scale_range[0]
                + (scale_range[1] - scale_range[0])
                * (log_size - min_log_size)
                / (max_log_size - min_log_size)
            )
            for log_size in log_sizes
        ]

        for i, node in enumerate(graph.nodes):
            graph.nodes[node]["size"] = scaled_sizes[i]
            graph.nodes[node]["degree"] = graph.degree(node)

        return graph

    def save_graph(self, graph_job_id: uuid.UUID, graph: nx.Graph):
        """
        Save graph to local-storage as a .edgelist format.
        The filename/location will be <GraphJob.id>.edgelist
        """
        location = self._get_graph_file_path_local_storage(graph_job_id)
        nx.write_gml(graph, location)

    def load_graph(self, graph_job_id: uuid.UUID) -> nx.Graph:
        """
        Given a GraphJob retrieve its graph from the local-storage
        """
        graph_local_storage = self._get_graph_file_path_local_storage(graph_job_id)
        return nx.read_gml(graph_local_storage)

    def delete_graph(self, graph_job_id: uuid.UUID):
        file_location = self._get_graph_file_path_local_storage(graph_job_id)
        if os.path.exists(file_location):
            os.remove(file_location)

    async def graph_data_for_visualization(
        self, graph_job: GraphJob, node: str = None, adj_depth: int = 1
    ) -> GraphVisData:
        """
        Given a graph travers it and return a json format of all the nodes and edges they have
        ready for visualization to FE
        """

        graph = self.load_graph(graph_job.id)

        if node:
            return self._graph_bfs_edges(graph, graph_job, node, adj_depth)

        return self._all_graph_data_for_visualization(graph, graph_job)

    @staticmethod
    def _get_graph_file_path_local_storage(graph_job_id: uuid.UUID) -> str:
        # Define the path for saving graph files
        graphs_directory = os.path.join(
            os.path.dirname(
                os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
            ),
            ".media",
            "graphs",
        )
        os.makedirs(graphs_directory, exist_ok=True)

        return os.path.join(graphs_directory, f"{graph_job_id}.gml")

    @staticmethod
    def _graph_bfs_edges(
        graph: nx.Graph, graph_job: GraphJob, node: str, adj_depth: int
    ) -> GraphVisData:
        nodes_data = []
        edges_data = []
        visited = set()

        for source, target in nx.bfs_edges(graph, node, depth_limit=adj_depth):
            if source not in visited:
                visited.add(source)
                nodes_data.append(
                    GraphNode(
                        id=str(source),
                        label=str(source),
                        size=graph.nodes[source].get("size", 1),
                        degree=graph.nodes[source].get("degree", 0),
                        pages=graph.nodes[source].get("pages", "pages not found"),
                        topic=graph.nodes[source].get("topic", "topic not found"),
                    )
                )

            if target not in visited:
                visited.add(target)
                nodes_data.append(
                    GraphNode(
                        id=str(target),
                        label=str(target),
                        size=graph.nodes[target].get("size", 1),
                        degree=graph.nodes[target].get("degree", 0),
                        pages=graph.nodes[source].get("pages", "pages not found"),
                        topic=graph.nodes[source].get("topic", "topic not found"),
                    )
                )
            edge_properties = graph[source][target]
            edges_data.append(
                GraphEdge(
                    id=f"{source}_{target}",
                    source=str(source),
                    target=str(target),
                    label=str(edge_properties["relation"]),
                )
            )

        return GraphVisData(
            document_name=graph_job.name,
            graph_created_at=graph_job.updated_at,
            nodes=nodes_data,
            edges=edges_data,
        )

    @staticmethod
    def _all_graph_data_for_visualization(
        graph: nx.Graph, graph_job: GraphJob
    ) -> GraphVisData:
        nodes_data = []
        edges_data = []

        # Iterate over nodes
        for i, node in enumerate(graph.nodes(data=True)):
            node_id, node_attrs = node
            nodes_data.append(
                GraphNode(
                    id=str(node_id),
                    label=str(node_id),
                    size=node_attrs.get("size", 1),
                    degree=node_attrs.get("degree", 0),
                    pages=node_attrs.get("pages", "pages not found"),
                    topic=node_attrs.get("topic", "topic not found"),
                )
            )

        # Iterate over edges
        for edge in graph.edges(data=True):
            source, target, edge_attrs = edge
            edges_data.append(
                GraphEdge(
                    id=f"{source}_{target}",
                    source=str(source),
                    target=str(target),
                    label=str(edge_attrs["relation"]),
                )
            )

        return GraphVisData(
            document_name=graph_job.name,
            graph_created_at=graph_job.updated_at,
            nodes=nodes_data,
            edges=edges_data,
        )
