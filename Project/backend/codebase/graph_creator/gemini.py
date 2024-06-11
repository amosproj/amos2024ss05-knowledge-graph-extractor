import os
import json
from datetime import datetime
from dotenv import load_dotenv
import google.generativeai as genai
from graph_creator.graph_handler import extract_relation_from_llm_output
from graph_creator.services.json_handler import transform_llm_output_to_dict


def configure_genai():
    """
    Ensure the API key is set in the environment
    """
    # load_dotenv("Project/backend/.env", override=True)
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("API key not found in environment variables")
    genai.configure(api_key=api_key)

def serialize_chat_history(history):
    """
    Convert the chat history to a serializable format.
    """
    serialized_history = []
    for entry in history:
        serialized_entry = {
            "message": str(entry),
            "timestamp": datetime.now().isoformat(),
            "role": entry.role if hasattr(entry, "role") else None,
        }
        serialized_history.append(serialized_entry)
    return serialized_history

def extract_entities_and_relations(chunk, genai_client):
    """
    Extract entities and relations from a chunk using the Gemini client.
    """
    SYS_PROMPT = (
        "Only answer in a JSON format. \n"
        "You are a network graph maker who extracts terms and their relations from a given context. "
        "You are provided with a context chunk (delimited by ```) Your task is to extract the ontology "
        "of terms mentioned in the given context. These terms should represent the key concepts as per the context. \n"
        "Thought 1: While traversing through each sentence, Think about the key terms mentioned in it.\n"
        "\tTerms may include object, entity, location, organization, person, \n"
        "\tcondition, acronym, documents, service, concept, etc.\n"
        "\tTerms should be as atomistic as possible\n\n"
        "Thought 2: Think about how these terms can have one on one relation with other terms.\n"
        "\tTerms that are mentioned in the same sentence or the same paragraph are typically related to each other.\n"
        "\tTerms can be related to many other terms\n\n"
        "Thought 3: Find out the relation between each such related pair of terms. \n\n"
        "Format your output as a list of JSON. Each element of the list contains a pair of terms"
        "and the relation between them, like the following: \n"
        "[\n"
        "   {\n"
        '       "node_1": "A concept from extracted ontology",\n'
        '       "node_2": "A related concept from extracted ontology",\n'
        '       "edge": "relationship between the two concepts, node_1 and node_2"\n'
        "   }, {...}\n"
        "]"
    )
    USER_PROMPT = f"context: ```{chunk}``` \n\n output: "
    
    chat_session = genai_client.start_chat(history=[])
    message = SYS_PROMPT + USER_PROMPT
    response = chat_session.send_message(message)
    
    return response.text

def check_for_connecting_relation(chunk, entities_component_1, entities_component_2, genai_client):
    """
    Check for connecting relation between entities of two components.
    """
    SYS_PROMPT = (
        "Only answer in JSON format. \n"
        "Your task is to help create a knowledge graph by extracting one more relation between any entity of list_1 with any entity of list_2.\n"
        "We want to connect the subgraphs of nodes and relations that were extracted from the given text chunk (delimited by ```)."
        "For this one more relation needs to be extracted from the given text chunk between any entity of list_1 and list_2:\n"
        f"list_1: {entities_component_1}\n"
        f"list_2: {entities_component_2}\n"
        "Only use the exact entities given in the lists."
        "Return the one connecting relation in the following format:\n"
        "{\n"
        '    "node_1": "An entity from list_1",\n'
        '    "node_2": "An entity from list_2",\n'
        '    "edge": "relationship between the two entities, node_1 and node_2"\n'
        "}"
    )
    USER_PROMPT = f"text chunk: ```{chunk}``` \n\n output: "
    
    chat_session = genai_client.start_chat(history=[])
    message = SYS_PROMPT + USER_PROMPT
    response = chat_session.send_message(message)
    
    return response.text

def check_for_connecting_relation_(text_chunk, entities_component_1, entities_component_2):
    """
    Takes a text chunk, and two lists of entities (from each component in the graph)
    and tries to extract a connection relation between any entity of
    entities_component_1 with any entity of entities_component_2

    Parameters
    ----------
    text_chunk : str
        The text chunk to be proccessed
    entities_component_1 : list
        List of entities
    entities_component_1 : list
        List of entities

    Returns
    -------
    str
        The Response of the llm as a string
    """
    configure_genai()
    genai_client = genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ],
        generation_config={
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }
    )

    return check_for_connecting_relation(text_chunk, entities_component_1, entities_component_2, genai_client)

def process_chunks(chunks):
    """
    Process a list of chunks through the generative model.
    """
    configure_genai()
    genai_client = genai.GenerativeModel(
        model_name="gemini-1.5-pro-latest",
        safety_settings=[
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ],
        generation_config={
            "temperature": 1,
            "top_p": 0.95,
            "top_k": 64,
            "max_output_tokens": 8192,
            "response_mime_type": "text/plain",
        }
    )
    
    responses = []

    for chunk in chunks:
        text_content = chunk["text"]
        
        response_json = extract_entities_and_relations(text_content, genai_client)

        responses.append(transform_llm_output_to_dict(response_json))

    return responses