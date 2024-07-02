import pandas as pd
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
import pickle
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist
import numpy as np

def generate_embeddings_and_merge_duplicates(data, model_name='xlm-r-bert-base-nli-stsb-mean-tokens', save_dir='embeddings', threshold=0.4):
    os.makedirs(save_dir, exist_ok=True)

    all_nodes = pd.concat([data['node_1'], data['node_2']]).unique()
    model = SentenceTransformer(model_name)

    embeddings = model.encode(all_nodes)
    embedding_dict = {node: emb for node, emb in zip(all_nodes, embeddings)}

    # Hierarchical Clustering
    distance_matrix = pdist(embeddings, 'cosine')
    Z = linkage(distance_matrix, 'ward')
    labels = fcluster(Z, threshold, criterion='distance')

    merged_nodes = {}
    for label in set(labels):
        cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
        # Choose the most representative (abstract) name
        merged_name = max(cluster, key=lambda x: sum(1 for c in x if c.isupper()) / len(x))
        merged_nodes[merged_name] = cluster

    node_mapping = {old: new for new, cluster in merged_nodes.items() for old in cluster}
    
    # Update embeddings for merged nodes
    updated_embedding_dict = {}
    for merged_name, cluster in merged_nodes.items():
        cluster_embeddings = [embedding_dict[node] for node in cluster]
        updated_embedding_dict[merged_name] = np.mean(cluster_embeddings, axis=0)

    # Create FAISS index with updated embeddings
    vector_store = FAISS.from_embeddings(
        [(node, emb) for node, emb in updated_embedding_dict.items()],
        embedding=model.encode
    )

    # Save updated FAISS index
    faiss_path = os.path.join(save_dir, 'faiss_index.pkl')
    with open(faiss_path, 'wb') as f:
        pickle.dump(vector_store, f)

    # Save updated embedding dictionary
    embedding_dict_path = os.path.join(save_dir, 'embedding_dict.pkl')
    with open(embedding_dict_path, 'wb') as f:
        pickle.dump(updated_embedding_dict, f)

    # Update edges in the graph
    merged_data = []
    for _, row in data.iterrows():
        node_1 = node_mapping.get(row['node_1'], row['node_1'])
        node_2 = node_mapping.get(row['node_2'], row['node_2'])
        edge = row['edge']
        if node_1 != node_2:
            merged_data.append({
                'node_1': node_1, 
                'node_2': node_2, 
                'edge': edge,
                'original_node_1': row['node_1'],
                'original_node_2': row['node_2']
            })

    merged_df = pd.DataFrame(merged_data).drop_duplicates()

    return updated_embedding_dict, merged_nodes, merged_df, vector_store

def search_graph(query, vector_store, merged_nodes, k=5):
    results = vector_store.similarity_search(query, k=k)
    similar_nodes = []
    for doc in results:
        node = doc.page_content
        similar_nodes.append({
            'merged_node': node,
            'original_nodes': merged_nodes.get(node, [node]),
            'similarity': doc.metadata['score'] if 'score' in doc.metadata else None
        })
    return similar_nodes

# Example usage
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

embedding_dict, merged_nodes, updated_data, vector_store = generate_embeddings_and_merge_duplicates(data)
print("Prozess abgeschlossen.")
print(f"Anzahl der zusammengefassten Knoten: {len(merged_nodes)}")
print(f"Anzahl der Embeddings: {len(embedding_dict)}")
print("Zusammengefasste Knoten:")
for merged, original in merged_nodes.items():
    print(f"  {merged}: {original}")
print("\nAktualisiertes DataFrame:")
print(updated_data)

print("\nBeispiel für eine spätere Suche:")
query = "Adresse"
results = search_graph(query, vector_store, merged_nodes, k=5)
print(f"Ähnliche Knoten zu '{query}':")
for result in results:
    print(f"  Merged Node: {result['merged_node']}")
    print(f"  Original Nodes: {result['original_nodes']}")
    print(f"  Similarity: {result['similarity']}")
    print()