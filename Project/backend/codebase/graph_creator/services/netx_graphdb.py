import os
import uuid

import networkx as nx
import pandas as pd

from graph_creator.schemas.graph_vis import GraphVisData, GraphNode, GraphEdge


class NetXGraphDB:
    """
    This class serves as a service to create, read, save and work with graphs
    via the networkx package.
    Graphs will be saved in .edgelist format in local-storage and retrieved from there.
    All the graphs operations will happen in memory.
    """

    def create_graph_from_df(
        self, graph_job_id: uuid.UUID, data: pd.DataFrame = None
    ) -> nx.Graph:
        # todo- This function needs to be adapted and changed accordingly
        # Dummy DATA
        import pandas as pd

        df = pd.DataFrame(data)
        graph = nx.Graph()

        # Iterate over each row in the DataFrame
        for _, edge in df.iterrows():
            # Add edge with attributes to the graph
            graph.add_edge(edge["node_1"], edge["node_2"], relation=edge["edge"])

        # Add node sizes based on degree
        for node in graph.nodes:
            graph.nodes[node]['size'] = graph.degree(node)

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

    def graph_data_for_visualization(
        self, graph_job_id: uuid.UUID, node: str | None, adj_depth: int
    ) -> GraphVisData:
        """
        Given a graph travers it and return a json format of all the nodes and edges they have
        ready for visualization to FE
        """
        graph = self.load_graph(graph_job_id)

        if node:
            return self._graph_bfs_edges(graph, node, adj_depth)

        return self._all_graph_data_for_visualization(graph)

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
    def _graph_bfs_edges(graph: nx.Graph, node: str, adj_depth: int) -> GraphVisData:
        nodes_data = []
        edges_data = []
        visited = set()

        for source, target in nx.bfs_edges(graph, node, depth_limit=adj_depth):

            if source not in visited:
                visited.add(source)
                nodes_data.append(GraphNode(id=str(source), label=str(source)))

            if target not in visited:
                visited.add(target)
                nodes_data.append(GraphNode(id=str(target), label=str(target)))
            edge_properties = graph[source][target]
            edges_data.append(
                GraphEdge(
                    id=f"{source}_{target}",
                    source=str(source),
                    target=str(target),
                    label=str(edge_properties["relation"]),
                )
            )

        return GraphVisData(nodes=nodes_data, edges=edges_data)

    @staticmethod
    def _all_graph_data_for_visualization(graph: nx.Graph) -> GraphVisData:
        nodes_data = []
        edges_data = []

        # Iterate over nodes
        for node in graph.nodes(data=True):
            node_id, node_attrs = node
            nodes_data.append(GraphNode(id=str(node_id),
                                        label=str(node_id),
                                        size=node_attrs.get("size", 1)))

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

        return GraphVisData(nodes=nodes_data, edges=edges_data)
