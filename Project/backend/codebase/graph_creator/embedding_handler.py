import pandas as pd
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
import pickle
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist, cosine
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
    node_to_merged = {}
    for label in set(labels):
        cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
        merged_name = max(cluster, key=lambda x: sum(1 for c in x if c.isupper()) / len(x))
        merged_nodes[merged_name] = cluster
        for node in cluster:
            node_to_merged[node] = merged_name

    # Update edges in the graph
    merged_data = []
    for _, row in data.iterrows():
        node_1 = node_to_merged.get(row['node_1'], row['node_1'])
        node_2 = node_to_merged.get(row['node_2'], row['node_2'])
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

    # Create FAISS index with original embeddings, but map to merged nodes
    vector_store = FAISS.from_embeddings(
        [(node_to_merged[node], emb) for node, emb in embedding_dict.items()],
        embedding=model.encode
    )

    # Save FAISS index
    faiss_path = os.path.join(save_dir, 'faiss_index.pkl')
    with open(faiss_path, 'wb') as f:
        pickle.dump(vector_store, f)

    # Save embedding dictionary
    embedding_dict_path = os.path.join(save_dir, 'embedding_dict.pkl')
    with open(embedding_dict_path, 'wb') as f:
        pickle.dump(embedding_dict, f)

    return embedding_dict, merged_nodes, merged_df, vector_store, model, node_to_merged

def search_graph(query, vector_store, merged_nodes, model, node_to_merged, k=5):
    query_embedding = model.encode([query])[0]
    results = vector_store.similarity_search_with_score(query, k=k)
    similar_nodes = []
    for doc, score in results:
        merged_node = doc.page_content
        original_nodes = merged_nodes[merged_node]
        similarities = [1 - cosine(query_embedding, embedding_dict[node]) for node in original_nodes]
        avg_similarity = np.mean(similarities)
        similar_nodes.append({
            'merged_node': merged_node,
            'original_nodes': original_nodes,
            'similarity': avg_similarity,
            'individual_similarities': dict(zip(original_nodes, similarities))
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

embedding_dict, merged_nodes, updated_data, vector_store, model, node_to_merged = generate_embeddings_and_merge_duplicates(data)
print("Prozess abgeschlossen.")
print(f"Anzahl der zusammengefassten Knoten: {len(merged_nodes)}")
print(f"Anzahl der Embeddings: {len(embedding_dict)}")
print("Zusammengefasste Knoten:")
for merged, original in merged_nodes.items():
    print(f"  {merged}: {original}")
print("\nAktualisiertes DataFrame:")
print(updated_data)

print("\nBeispiel für eine spätere Suche:")
query = "Was ist der name bei der geburt?"
results = search_graph(query, vector_store, merged_nodes, model, node_to_merged, k=10)
print(f"Ähnliche Knoten zu '{query}':")
for result in results:
    print(f"  Merged Node: {result['merged_node']}")
    print(f"  Original Nodes: {result['original_nodes']}")
    print(f"  Average Similarity: {result['similarity']:.4f}")
    print("  Individual Similarities:")
    for node, sim in result['individual_similarities'].items():
        print(f"    {node}: {sim:.4f}")
    print()