import networkx as nx
import os
import json

def get_top_n_central_nodes(centrality_dict, n):
    """Sort nodes based on centrality measure and return top N nodes.
    
    Args:
        centrality_dict: Dictionary of nodes with their centrality values.
        n: Number of top nodes to return.
    
    Returns:
        Sorted list of top N nodes with their centrality values.
    """
    sorted_nodes = sorted(centrality_dict.items(), key=lambda item: item[1], reverse=True)
    return sorted_nodes[:n]

def analyze_graph_structure(G):
    """Analyzes the structure of a knowledge graph and provides hopefully useful information.
    Currently, I am not sure how to use most of the information, but we may find a way to use it

    Args:
        G: A networkx graph.

    Returns:
        A dictionary containing information about the graph's structure.
    """

    # Basic Graph Statistics
    num_nodes = G.number_of_nodes()  # Total number of nodes
    num_edges = G.number_of_edges()  # Total number of edges

    if num_nodes == 0 or num_edges == 0:
        raise ValueError("The graph is empty or not properly constructed.")

    # Degree Centrality: Measures node connectivity
    degree_centrality = nx.degree_centrality(G)
    """ Centrality Measures
    - Degree Centrality: Measures node connectivity
    - Nodes with high degree centrality are important in the network

    Examples: 3 nodes are connected in a line
    node1 - node2 - node3
    - Degree: node1 = 1, node2 = 2, node3 = 1
    - Degree Centrality: node1 = 0.33(1/3), node2 = 0.66(2/3), node3 = 0.33(1/3)
    """


    # Betweenness Centrality: Measures node's control over information flow
    betweenness_centrality = nx.betweenness_centrality(G)
    """ 
    - Betweenness Centrality: Measures node's control over information flow
    - Nodes with high betweenness centrality are important in the network
    
    Examples: 4 nodes are connected 
    1
 /    \
2-----3
 \   /
    4

    - Here, node 2 has the highest betweenness centrality because it lies on the shortest path between all other nodes
    - if node in not between any other nodes, its betweenness centrality is 0
    - Betweenness Centrality show the dependency of the network on a node

    """
    
    # eigenvector centrality measures the influence of a node in a network
    eigenvector_centrality = nx.eigenvector_centrality(G)

    """
    - Eigenvector Centrality: Measures influence of a node in a network
    - Nodes with high eigenvector centrality are important in the network

    Examples: 4 nodes are connected 
    1
 /    \
2-----3
 \   /
   4

    - Here, node 3 has the highest eigenvector centrality because it is connected to node 2 which has high eigenvector centrality
    - Eigenvector Centrality show the influence of a node in the network
    - Eigenvector Centrality is similar to PageRank algorithm
    - in this measure every node has some values and the values are updated based on the values of the connected nodes (node value != 0)

    """

    graph_info = {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "top_degree_centrality": get_top_n_central_nodes(degree_centrality, top_n),
        "top_betweenness_centrality": get_top_n_central_nodes(betweenness_centrality, top_n),
        "top_eigenvector_centrality": get_top_n_central_nodes(eigenvector_centrality, top_n)
    }

    return graph_info

def print_graph_info(graph_info):
    """Prints the graph information in a formatted and readable way.

    Args:
        graph_info: A dictionary containing information about the graph's structure.
    """

    print(json.dumps(graph_info, indent=4))


graph_directory = os.fsencode("../.media/graphs/")


top_n = int(input("Enter the number of top nodes to display: "))

with os.scandir("./Project/backend/codebase/.media/graphs/") as it:
    for entry in it:
        if entry.name.endswith("c.gml") and entry.is_file():
            print("-----------------------")
            print(f"Filename: {entry.name}")
            graph = nx.read_gml(entry.path)
            graph_info = analyze_graph_structure(graph)
            print_graph_info(graph_info)
