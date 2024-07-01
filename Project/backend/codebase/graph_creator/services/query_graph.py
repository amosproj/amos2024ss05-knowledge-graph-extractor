import os

import networkx as nx
from langchain.chains.graph_qa.base import GraphQAChain
from langchain_community.graphs import NetworkxEntityGraph
from langchain_groq import ChatGroq
from networkx import NetworkXError

from graph_creator.llama3 import configure_groq
from graph_creator.schemas.graph_vis import GraphQueryOutput


class GraphQuery:

    def query_graph(self, graph: nx.Graph, query: str) -> GraphQueryOutput:
        entities_from_llm = self.retrieve_entities_from_llm(query)
        all_entities = set()
        all_entities.update(entities_from_llm)

        entities_relationships = {}

        for node in all_entities:
            edges_info = []
            try:
                for neighbor in graph.neighbors(node):
                    edge_data = graph.get_edge_data(node, neighbor)
                    relationship = edge_data.get("relation", "is connected to")
                    edges_info.append((relationship, neighbor))
                entities_relationships[node] = edges_info
            except NetworkXError:
                continue

        return GraphQueryOutput(
            llm_nodes=entities_from_llm,
            retrieved_info=entities_relationships,
        )

    @staticmethod
    def retrieve_entities_from_llm(query: str):
        groq_client = configure_groq()
        SYS_PROMPT = """
            The user has a knowledge graph and wants to query it. For that he needs entities.
            Your task is to extract all entities from the below query.
            Format you answer as below example:
            entity1, entity2, entity3
        """
        USER_PROMPT = f"user input: ```{query}``` \n\n output: "
        chat_completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYS_PROMPT},
                {"role": "user", "content": USER_PROMPT},
            ],
            model="llama3-8b-8192",
        )
        response = chat_completion.choices[0].message.content
        return [entity.strip() for entity in response.split(",")]

    def query_graph_via_langchain(self, query: str, graph_path: str):
        graph1 = NetworkxEntityGraph.from_gml(graph_path)
        chain = GraphQAChain.from_llm(
            ChatGroq(
                temperature=0, model="llama3-8b-8192", api_key=os.getenv("GROQ_API_KEY")
            ),
            graph=graph1,
            verbose=True,
        )
        response = chain.invoke(query)
        return response
