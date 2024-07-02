import pandas as pd
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
import pickle
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist, cosine
import numpy as np

def save_data(graph_dir, graph_id, vector_store, embedding_dict, merged_nodes, node_to_merged):
    for name, data in zip(['faiss_index', 'embedding_dict', 'merged_nodes', 'node_to_merged'],
                          [vector_store, embedding_dict, merged_nodes, node_to_merged]):
        with open(os.path.join(graph_dir, f'{graph_id}_{name}.pkl'), 'wb') as f:
            pickle.dump(data, f)

def load_data(graph_dir, graph_id):
    return [pickle.load(open(os.path.join(graph_dir, f'{graph_id}_{name}.pkl'), 'rb'))
            for name in ['faiss_index', 'embedding_dict', 'merged_nodes', 'node_to_merged']]
    

def generate_embeddings_and_merge_duplicates(data, graph_id, model_name='xlm-r-bert-base-nli-stsb-mean-tokens', save_dir='embeddings', threshold=0.2):
    """
    Generates embeddings for nodes in the given data and merges duplicate nodes based on a threshold.

    Args:
        data (pd.DataFrame): The input data containing 'node_1', 'node_2', and 'edge' columns.
        model_name (str, optional): The name of the pre-trained model to use for generating embeddings. Defaults to 'xlm-r-bert-base-nli-stsb-mean-tokens'.
        save_dir (str, optional): The directory to save the generated embeddings and other files. Defaults to 'embeddings'.
        threshold (float, optional): The threshold value for hierarchical clustering. Nodes with a cosine distance below this threshold will be merged. Defaults to 0.2.

    Returns:
        tuple: A tuple containing the following elements:
            - embedding_dict (dict): A dictionary mapping nodes to their corresponding embeddings.
            - merged_nodes (dict): A dictionary mapping merged node names to the original nodes in each cluster.
            - merged_df (pd.DataFrame): A DataFrame containing the merged data with updated node names.
            - vector_store (FAISS): The FAISS index created with original embeddings mapped to merged nodes.
            - model (SentenceTransformer): The SentenceTransformer model used for generating embeddings.
            - node_to_merged (dict): A dictionary mapping original nodes to their corresponding merged node names.
    """

    # Create a directory for the graph if it doesn't exist
    graph_dir = os.path.join(save_dir, graph_id)
    os.makedirs(graph_dir, exist_ok=True)

    all_nodes = pd.concat([data['node_1'], data['node_2']]).unique()
    model = SentenceTransformer(model_name)

    embeddings = model.encode(all_nodes)
    embedding_dict = {node: emb for node, emb in zip(all_nodes, embeddings)}

    # Hierarchical Clustering
    distance_matrix = pdist(embeddings, 'cosine')
    Z = linkage(distance_matrix, 'ward')
    labels = fcluster(Z, threshold, criterion='distance')

    merged_nodes = {}
    node_to_merged = {}
    # for label in set(labels):
    #     cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
    #     merged_name = "_".join(cluster)
    #     # merged_name = max(cluster, key=lambda x: sum(1 for c in x if c.isupper()) / len(x)) # Choose the longest node with the most uppercase characters
    #     merged_nodes[merged_name] = cluster
    #     for node in cluster:
    #         node_to_merged[node] = merged_name

    # The under the command find the average embedding of the cluster and assign the node with the smallest cosine distance to the average embedding as the representative node
    for label in set(labels):
        cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
        average_embedding = np.mean([embedding_dict[node] for node in cluster], axis=0)
        representative_node = min(cluster, key=lambda node: cosine(embedding_dict[node], average_embedding))
        merged_nodes[representative_node] = cluster
        for node in cluster:
            node_to_merged[node] = representative_node

    # Update edges in the graph and avoid duplicate edges
    seen_edges = set()
    merged_data = []
    for _, row in data.iterrows():
        node_1 = node_to_merged.get(row['node_1'], row['node_1'])
        node_2 = node_to_merged.get(row['node_2'], row['node_2'])
        edge = row['edge']
        edge_tuple = (node_1, node_2, edge)
        if node_1 != node_2 and edge_tuple not in seen_edges:
            merged_data.append({
                'node_1': node_1, 
                'node_2': node_2, 
                'edge': edge,
                'original_node_1': row['node_1'],
                'original_node_2': row['node_2']
            })
            seen_edges.add(edge_tuple)

    merged_df = pd.DataFrame(merged_data).drop_duplicates()

    # Create FAISS index with original embeddings, but map to merged nodes
    vector_store = FAISS.from_embeddings(
        [(node_to_merged[node], emb) for node, emb in embedding_dict.items()],
        embedding=model.encode
    )

    save_data(graph_dir, graph_id, vector_store, embedding_dict, merged_nodes, node_to_merged)

    return embedding_dict, merged_nodes, merged_df, vector_store, model, node_to_merged

def search_graph(query, graph_id, save_dir='embeddings', k=20):
    # Load the model
    model_name = 'xlm-r-bert-base-nli-stsb-mean-tokens'
    model = SentenceTransformer(model_name)
    vector_store, embedding_dict, merged_nodes, node_to_merged = load_data(os.path.join(save_dir, graph_id), graph_id)
    
    query_embedding = model.encode([query])[0]
    results = vector_store.similarity_search_with_score(query, k=k)
    similar_nodes = []
    visited_nodes = set()  # Set to track which merged nodes have been added to the result

    for doc, score in results:
        merged_node = doc.page_content
        if merged_node in visited_nodes:
            continue  # Skip this node if it has already been added

        original_nodes = merged_nodes[merged_node]
        similarities = [1 - cosine(query_embedding, embedding_dict[node]) for node in original_nodes]
        avg_similarity = np.mean(similarities)
        similar_nodes.append({
            'merged_node': merged_node,
            'original_nodes': original_nodes,
            'similarity': avg_similarity,
            'individual_similarities': dict(zip(original_nodes, similarities))
        })
        visited_nodes.add(merged_node)  # Mark this node as visited
    return similar_nodes





def main():
    # Example data 
    data = pd.DataFrame({
        'node_1': ['Name', 'Straße', 'Wohnort', 'Geburtsname', 'Geburtsort', 'Adresse', 'Geburtsdatum',
                   'Name', 'Strasse', 'wohnort', 'GeburtsName', 'geburtsort', 'Anschrift', 'GeburtsDaten',
                   'Namen', 'Straßen', 'Wohnorte', 'Geburtsnamen', 'Geburtsorte', 'Adressen', 'Geburtsdaten',
                   'Vorname', 'Hausnummer', 'PLZ', 'Mädchenname', 'Geburtsstadt', 'Anschrift', 'Geburtsjahr'],
        'node_2': ['Vorname', 'Hausnummer', 'PLZ', 'Mädchenname', 'Geburtsstadt', 'Anschrift', 'Geburtsjahr',
                   'Spitzname', 'hausnummer', 'Postleitzahl', 'MädchenName', 'GeburtsStadt', 'Adresse', 'GeburtsJahr',
                   'Vornamen', 'Hausnummern', 'PLZs', 'Mädchennamen', 'Geburtsstädte', 'Adressen', 'Geburtsjahre',
                   'Nickname', 'HouseNumber', 'PostalCode', 'MaidenName', 'BirthCity', 'Address', 'YearOfBirth'],
        'edge': ['related_as_personal_details', 'located_at', 'located_in', 'related_as_birth_details',
                 'related_as_place_of_birth', 'located_at', 'related_as_birth_details',
                 'related_as_personal_details', 'located_at', 'located_in', 'related_as_birth_details',
                 'related_as_place_of_birth', 'located_at', 'related_as_birth_details',
                 'related_as_personal_details', 'located_at', 'located_in', 'related_as_birth_details',
                 'related_as_place_of_birth', 'located_at', 'related_as_birth_details',
                 'related_as_personal_details', 'located_at', 'located_in', 'related_as_birth_details',
                 'related_as_place_of_birth', 'located_at', 'related_as_birth_details']
    })

    # Process the data
    model_name = 'xlm-r-bert-base-nli-stsb-mean-tokens'
    threshold = 0.2
    graph_id = 'example_graph'
    embedding_dict, merged_nodes, updated_data, vector_store, model, node_to_merged = generate_embeddings_and_merge_duplicates(data, graph_id, model_name=model_name, threshold=threshold)

# Output results
    print("Process completed.")
    print(f"Number of merged nodes: {len(merged_nodes)}")
    print(f"Number of embeddings: {len(embedding_dict)}")
    print("Merged Nodes:")
    
    for merged, original in merged_nodes.items():
        print(f"  {merged}: {original}")
        
    print("\nUpdated DataFrame:")
    print(updated_data)
    print("\n")
    # Example of a future search
    query = "What is the name at birth?"
    
    results = search_graph(query, graph_id, k=20)
    
    print(f"Similar nodes to '{query}':")
    for result in results:
        print(f"  Merged Node: {result['merged_node']}")
        print(f"  Original Nodes: {result['original_nodes']}")
        print(f"  Average Similarity: {result['similarity']:.4f}")
        print("  Individual Similarities:")
        for node, sim in result['individual_similarities'].items():
            print(f"    {node}: {sim:.4f}")
        print()


if __name__ == "__main__":
    main()