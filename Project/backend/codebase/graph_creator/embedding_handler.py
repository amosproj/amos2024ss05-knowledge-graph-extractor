import pandas as pd
import os
import logging
from graph_creator.models.graph_job import GraphJob
from sentence_transformers import SentenceTransformer
from langchain_community.vectorstores import FAISS
import pickle
from scipy.cluster.hierarchy import linkage, fcluster
from scipy.spatial.distance import pdist, cosine
import numpy as np

class embeddings_handler:

    def __init__(self, g_job: GraphJob, lazyLoad=False):
        # Get graph (document) uuid
        self.graph_id = g_job.id

        # Store embeddings in directory
        self.save_dir = ".media/embeddings"

        # Model used for embedding
        self.model_name = "xlm-r-bert-base-nli-stsb-mean-tokens"

        # Ensure the embeddings directory exists
        self.graph_dir = os.path.join(self.save_dir, str(self.graph_id))  # Convert UUID to string

        # Check if Graph already embedded
        os.makedirs(self.graph_dir, exist_ok=True)
        self.isEmbedded = os.path.isdir(self.graph_dir) and all(
            os.path.isfile(os.path.join(self.graph_dir, f"{self.graph_id}_{name}.pkl"))
            for name in ["faiss_index", "embedding_dict", "merged_nodes", "node_to_merged"]
        )
        self.embeddings = self.load_data() if self.isEmbedded  and not lazyLoad else None

    def delete(self):
        files = [os.path.join(self.graph_dir, f"{self.graph_id}_{name}.pkl")
                    for name in ["faiss_index", "embedding_dict", "merged_nodes", "node_to_merged"]]
        for file in files:
            if os.path.exists(file):
                os.remove(file)
        if os.path.exists(self.graph_dir):
            os.rmdir(self.graph_dir)

    def is_embedded(self):
        return self.isEmbedded

    def save_data(self, vector_store, embedding_dict, merged_nodes, node_to_merged):
        """
        Serialize and make variables of embedding step persistant
        
        Args:
            vector_store   : langchain_community.vectorstores.faiss.FAISS
            embedding_dict : dict
            merged_nodes   : dict
            node_to_merged : dict
        """
        # store dictionaries
        for name, data in zip(
            ["faiss_index", "embedding_dict", "merged_nodes", "node_to_merged"],
            [vector_store, embedding_dict, merged_nodes, node_to_merged],
        ):
            with open(os.path.join(self.graph_dir, f"{self.graph_id}_{name}.pkl"), "wb") as f:
                pickle.dump(data, f)

    def load_data(self):
        loaded_data = []
        for name in ["faiss_index", "embedding_dict", "merged_nodes", "node_to_merged"]:
            file_path = os.path.join(self.graph_dir, f"{self.graph_id}_{name}.pkl")
            #print(f"Loading {file_path}")
            try:
                with open(file_path, "rb") as f:
                    data = pickle.load(f)
                    loaded_data.append(data)
                    #print(f"Loaded {name}: {data}")
            except Exception as e:
                print(f"Error loading {file_path}: {e}")
                loaded_data.append(None)
        return loaded_data

    def generate_embeddings_and_merge_duplicates(
        self,
        data,
        threshold=0.2,
    ):
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
        # Debug: Print the DataFrame columns
        print("DataFrame Columns:", data.columns)

        # Ensure columns are as expected
        expected_columns = ["node_1", "node_2", "edge", "chunk_id", "topic_node_1", "topic_node_2"]
        for col in expected_columns:
            if col not in data.columns:
                raise ValueError(f"Missing expected column: {col}")
            
        #work on copy of dataframe
        data = data.copy()

        all_nodes = pd.concat([data["node_1"], data["node_2"]]).unique()
        model = SentenceTransformer(self.model_name)

        embeddings = model.encode(all_nodes)
        embedding_dict = {node: emb for node, emb in zip(all_nodes, embeddings)}

        # Hierarchical Clustering
        distance_matrix = pdist(embeddings, "cosine")
        Z = linkage(distance_matrix, "ward")
        labels = fcluster(Z, threshold, criterion="distance")

        merged_nodes = {}
        node_to_merged = {}

        # The under the command find the average embedding of the cluster and assign the node with the smallest cosine distance to the average embedding as the representative node
        for label in set(labels):
            cluster = [all_nodes[i] for i in range(len(all_nodes)) if labels[i] == label]
            average_embedding = np.mean([embedding_dict[node] for node in cluster], axis=0)
            representative_node = min(
                cluster, key=lambda node: cosine(embedding_dict[node], average_embedding)
            )
            merged_nodes[representative_node] = cluster
            for node in cluster:
                node_to_merged[node] = representative_node

        # Update edges in the graph and avoid duplicate edges
        seen_edges = set()
        merged_data = []
        for _, row in data.iterrows():
            node_1 = node_to_merged.get(row["node_1"], row["node_1"])
            node_2 = node_to_merged.get(row["node_2"], row["node_2"])
            edge = row["edge"]
            edge_tuple = (node_1, node_2, edge)
            if node_1 != node_2 and edge_tuple not in seen_edges:
                merged_data.append(
                    {
                        "node_1": node_1,
                        "node_2": node_2,
                        "edge": edge,
                        "chunk_id": row["chunk_id"],
                        "topic_node_1": row["topic_node_1"],
                        "topic_node_2": row["topic_node_2"],
                        "original_Node_1": row["node_1"],
                        "original_Node_2": row["node_2"],
                    }
                )
                seen_edges.add(edge_tuple)

        merged_df = pd.DataFrame(merged_data).drop_duplicates()

        # Create FAISS index with original embeddings, but map to merged nodes
        vector_store = FAISS.from_embeddings(
            [(node_to_merged[node], emb) for node, emb in embedding_dict.items()],
            embedding=model,
        )
        try:
            self.save_data(
                vector_store, embedding_dict, merged_nodes, node_to_merged
            )
        except Exception as e:
            logging.error(e)
        
        return merged_df

    def search_graph(self, query, k=20):

        if not self.isEmbedded:
            logging.error("No embeddings found!")
            return None

        # Load the model
        model = SentenceTransformer(self.model_name)
        vector_store, embedding_dict, merged_nodes, node_to_merged = self.embeddings

        query_embedding = model.encode([query])[0]
        results = vector_store.similarity_search_with_score(query, k=k)
        similar_nodes = []
        visited_nodes = (
            set()
        )  # Set to track which merged nodes have been added to the result

        for doc, score in results:
            merged_node = doc.page_content
            if merged_node in visited_nodes:
                continue  # Skip this node if it has already been added

            original_nodes = merged_nodes[merged_node]
            similarities = [
                1 - cosine(query_embedding, embedding_dict[node]) for node in original_nodes
            ]
            avg_similarity = np.mean(similarities)
            similar_nodes.append(
                {
                    "merged_node": merged_node,
                    "original_nodes": original_nodes,
                    "similarity": avg_similarity,
                    "individual_similarities": dict(zip(original_nodes, similarities)),
                }
            )
            visited_nodes.add(merged_node)  # Mark this node as visited
        return similar_nodes