import networkx as nx
import os
import json


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
    density = nx.density(G)  # Ratio of actual edges to possible edges (0 to 1)
    average_degree = 2 * num_edges / num_nodes  # Average number of edges per node

    # Degree Distribution
    degree_distribution = dict(G.degree())
    # Degree distribution can indicate the presence of hubs or important nodes

    degree_centrality = nx.degree_centrality(G)

    """ Centrality Measures
    - Degree Centrality: Measures node connectivity
    - Nodes with high degree centrality are important in the network

    Examples: 3 nodes are connected in a line
    node1 - node2 - node3
    - Degree: node1 = 1, node2 = 2, node3 = 1
    - Degree Centrality: node1 = 0.33(1/3), node2 = 0.66(2/3), node3 = 0.33(1/3)
    """

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

    #  - Closeness Centrality: Measures average length of the shortest path from a node to all other nodes
    closeness_centrality = nx.closeness_centrality(G)

    """

    """

    #  - Eigenvector Centrality: Measures influence of a node in a network
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

    # Community Structure
    #  - Louvain Algorithm (for community detection)
    communities = list(nx.community.greedy_modularity_communities(G))
    community_sizes = [len(community) for community in communities]
    num_communities = len(communities)
    # Communities can reveal modular structures in the graph

    # Graph Connectivity
    #  - Check if the graph is connected
    is_connected = nx.is_connected(G)
    #  - Calculate diameter: Longest shortest path between any two nodes
    diameter = nx.diameter(G) if is_connected else float('inf')
    #  - Average shortest path length: Average of all shortest paths in the graph
    average_shortest_path_length = nx.average_shortest_path_length(G) if is_connected else float('inf')

    # Clustering Coefficient
    #  - Measures the degree to which nodes tend to cluster together
    average_clustering_coefficient = nx.average_clustering(G)

    # Assortativity
    #  - Measures the similarity of connections in the graph with respect to node degree
    assortativity = nx.degree_assortativity_coefficient(G)

    # Graph Diameter and Radius
    #  - Diameter: Longest shortest path in the graph
    #  - Radius: Minimum eccentricity of any node
    radius = nx.radius(G) if is_connected else float('inf')

    # Graph Transitivity
    #  - Measures the overall probability for the network to have adjacent nodes interconnected
    transitivity = nx.transitivity(G)

    # Return a dictionary containing the structural information
    graph_info = {
        "num_nodes": num_nodes,
        "num_edges": num_edges,
        "density": density,
        "average_degree": average_degree,
        "degree_distribution": degree_distribution,
        "degree_centrality": degree_centrality,
        "betweenness_centrality": betweenness_centrality,
        "closeness_centrality": closeness_centrality,
        "eigenvector_centrality": eigenvector_centrality,
        "num_communities": num_communities,
        "community_sizes": community_sizes,
        "is_connected": is_connected,
        "diameter": diameter,
        "average_shortest_path_length": average_shortest_path_length,
        "average_clustering_coefficient": average_clustering_coefficient,
        "assortativity": assortativity,
        "radius": radius,
        "transitivity": transitivity
    }

    return graph_info


def print_graph_info(graph_info):
    """Prints the graph information in a formatted and readable way.

    Args:
        graph_info: A dictionary containing information about the graph's structure.
    """

    print(json.dumps(graph_info, indent=4))


graph_directory = os.fsencode("../.media/graphs/")

with os.scandir("./Project/backend/codebase/.media/graphs/") as it:
    for entry in it:
        if entry.name.endswith(".gml") and entry.is_file():
            print("-----------------------")
            print(f"Filename: {entry.name}")
            graph = nx.read_gml(entry.path)
            graph_info = analyze_graph_structure(graph)
            print_graph_info(graph_info)
