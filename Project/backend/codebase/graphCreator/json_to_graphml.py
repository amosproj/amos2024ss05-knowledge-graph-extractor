import json
import networkx as nx
import pandas as pd
import logging

example = ('[\n   {\n       "node_1": "Measurement framework",\n       "node_2": "Capability levels",\n       "edge": '
           '"Defines the schema for determining Capability Level of a process"\n   },\n   {\n       "node_1": '
           '"Measurement framework",\n       "node_2": "Process attributes",\n       "edge": "Defines features of a '
           'process that can be evaluated"\n   },\n   {\n       "node_1": "Capability levels",\n       "node_2": '
           '"Level 0: Incomplete process",\n       "edge": "Characterized by a process that is not implemented or '
           'fails to achieve its process purpose"\n   },\n   {\n       "node_1": "Capability levels",'
           '\n       "node_2": "Level 1: Performed process",\n       "edge": "Characterized by a process that '
           'achieves its process purpose"\n   },\n   {\n       "node_1": "Capability levels",\n       "node_2": '
           '"Level 2: Managed process",\n       "edge": "Implemented in a managed fashion with planned, monitored and '
           'adjusted work products"\n   },\n   {\n       "node_1": "Process attributes",\n       "node_2": "Feature '
           'of a process",\n       "edge": "Can be evaluated on a scale of achievement, providing measurement of '
           'process capability"\n   }\n]')


def json_string_to_graph(json_string):
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

        required_keys = {'node_1', 'node_2', 'edge'}
        if set(relation.keys()) != required_keys:
            logging.error("Relation does not have exactly two nodes and one edge: %s", relation)
            continue

        node_1 = relation.get('node_1')
        node_2 = relation.get('node_2')
        edge_label = relation.get('edge')

        if not isinstance(node_1, str) or not isinstance(node_2, str) or not isinstance(edge_label, str):
            logging.error("Node names and edge label must be strings: %s", relation)
            continue

        graph.add_node(node_1)
        graph.add_node(node_2)
        graph.add_edge(node_1, node_2, label=edge_label)

    return graph


def graph_to_dfs(graph):
    # Create DataFrames for nodes and edges
    nodes_df = pd.DataFrame(graph.nodes(), columns=["Node"])
    edges_df = pd.DataFrame([(u, v, d['label']) for u, v, d in graph.edges(data=True)],
                            columns=["Node_1", "Node_2", "Edge"])

    return nodes_df, edges_df


def graph_to_graphml(graph):
    return nx.generate_graphml(graph, encoding='utf-8', prettyprint=True)
