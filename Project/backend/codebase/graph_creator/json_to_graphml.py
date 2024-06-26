import json
import logging

import networkx as nx
import pandas as pd


def json_string_to_graph(json_string):
    """
    Converts a JSON string to a NetworkX graph.

    Args:
        json_string (str): The JSON string representing the graph.

    Returns:
        nx.Graph: The NetworkX graph representation of the JSON.

    """
    try:
        json_object = json.loads(json_string)
    except json.JSONDecodeError as e:
        logging.error("Invalid JSON syntax: %s", e)
        return None

    if not isinstance(json_object, list):
        logging.error("JSON does not contain a list")
        return None

    graph = nx.Graph()

    for relation in json_object:
        if not isinstance(relation, dict):
            logging.error("Relation is not a dictionary: %s", relation)
            continue

        required_keys = {"node_1", "node_2", "edge"}
        if set(relation.keys()) != required_keys:
            logging.error(
                "Relation does not have exactly two nodes and one edge: %s", relation
            )
            continue

        node_1 = relation.get("node_1")
        node_2 = relation.get("node_2")
        edge_label = relation.get("edge")

        if (
            not isinstance(node_1, str)
            or not isinstance(node_2, str)
            or not isinstance(edge_label, str)
        ):
            logging.error("Node names and edge label must be strings: %s", relation)
            continue

        graph.add_node(node_1)
        graph.add_node(node_2)
        graph.add_edge(node_1, node_2, label=edge_label)

    return graph


def graph_to_dfs(graph):
    """
    Converts a NetworkX graph to DataFrames for nodes and edges.

    Args:
        graph (nx.Graph): The NetworkX graph to convert.

    Returns:
        tuple: A tuple containing the nodes DataFrame and edges DataFrame.

    """
    # Create DataFrames for nodes and edges
    nodes_df = pd.DataFrame(graph.nodes(), columns=["Node"])
    edges_df = pd.DataFrame(
        [(u, v, d["label"]) for u, v, d in graph.edges(data=True)],
        columns=["Node_1", "Node_2", "Edge"],
    )

    return nodes_df, edges_df


def graph_to_graphml(graph):
    """
    Converts a NetworkX graph to a GraphML string.

    Args:
        graph (nx.Graph): The NetworkX graph to convert.

    Returns:
        str: The GraphML string representation of the graph.

    """
    return nx.generate_graphml(graph, encoding="utf-8", prettyprint=True)
