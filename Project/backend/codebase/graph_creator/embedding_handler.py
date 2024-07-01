# Datei: embedding_handler.py
import pandas as pd
import os
from tqdm import tqdm
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
import pickle
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist

def generate_embeddings_and_merge_duplicates(data, model_name='xlm-r-bert-base-nli-stsb-mean-tokens', save_dir='embeddings', threshold=0.4):
    os.makedirs(save_dir, exist_ok=True)

    all_nodes = pd.concat([data['node_1'], data['node_2']]).unique()
    model = SentenceTransformer(model_name)

    embeddings = model.encode(all_nodes)
    embedding_dict = {node: emb for node, emb in zip(all_nodes, embeddings)}  # Definition von embedding_dict
    vector_store = FAISS.from_embeddings(
        [(node, emb) for node, emb in zip(all_nodes, embeddings)],
        embedding=model.encode
    )

    faiss_path = os.path.join(save_dir, 'faiss_index.pkl')
    with open(faiss_path, 'wb') as f:
        pickle.dump(vector_store, f)

    embedding_dict_path = os.path.join(save_dir, 'embedding_dict.pkl')
    with open(embedding_dict_path, 'wb') as f:
        pickle.dump(embedding_dict, f)

    # Hierarchical Clustering
    distance_matrix = pdist(embeddings, 'cosine')
    Z = linkage(distance_matrix, 'ward')
    labels = fcluster(Z, threshold, criterion='distance')

    merged_nodes = {}
    for label in set(labels):
        cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
        merged_name = min(cluster, key=len)
        merged_nodes[merged_name] = cluster

    node_mapping = {old: new for new, cluster in merged_nodes.items() for old in cluster}
    
    merged_data = []
    for _, row in data.iterrows():
        node_1 = node_mapping.get(row['node_1'], row['node_1'])
        node_2 = node_mapping.get(row['node_2'], row['node_2'])
        edge = row['edge']
        if node_1 != node_2:
            merged_data.append({'node_1': node_1, 'node_2': node_2, 'edge': edge})

    merged_df = pd.DataFrame(merged_data).drop_duplicates()
    updated_embedding_dict = {new: embedding_dict[new] for new in merged_nodes.keys()}

    return updated_embedding_dict, merged_nodes, merged_df, vector_store

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

print("\n Suche:")
query = "Adresse"
results = vector_store.similarity_search(query, k=5)
print(f"Ähnliche Knoten zu '{query}':")
for doc in results:
    print(f"  {doc.page_content}")