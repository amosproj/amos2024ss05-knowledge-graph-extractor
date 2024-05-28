import os

from groq import Groq


def extraxt_entities_and_relations_from_chunk(chunk):

    # system prompt to guide bahavior of llm
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
        "and the relation between them, like the follwing: \n"
        "[\n"
        "   {\n"
        '       "node_1": "A concept from extracted ontology",\n'
        '       "node_2": "A related concept from extracted ontology",\n'
        '       "edge": "relationship between the two concepts, node_1 and node_2"\n'
        "   }, {...}\n"
        "]"
    )

    # input data for the llm to work on
    USER_PROMPT = f"context: ```{chunk}``` \n\n output: "

    # get api key from shell environment
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    # request to the llm with the prepared prompts
    chat_completion = client.chat.completions.create(
        messages=[

            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content


def check_for_connecting_relation(text_chunk, entities_component_1, entities_component_2):
    # system prompt to guide bahavior of llm
    SYS_PROMPT = (
        "Only answer in JSON format. \n"
        "Your task is to help create a knowlege graph by extracting one more relation between any entity of list_1 with any entity of list_2.\n"
        "We want to connect the subgraphs of nodes and relations that were extracted from the given text chunk (delimited by ```)."
        "For this one more relation needs to be extracted from the given text chunk between any entity of list_1 and list_2:\n"
        f"list_1: {entities_component_1}\n"
        f"list_2: {entities_component_2}\n"
        "Only use the exact entities given in the lists"
        "Return the one connecting relation in the following format:\n"
        "{\n"
        '    "node_1": "An entity from list_1",\n'
        '    "node_2": "An entity from list_2",\n'
        '    "edge": "relationship between the two entities, node_1 and node_2"\n'
        "}"
    )
    # input data for the llm to work on
    USER_PROMPT = f"text chunk: ```{text_chunk}``` \n\n output: "

    # get api key from shell environment
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    # request to the llm with the prepared prompts
    chat_completion = client.chat.completions.create(
        messages=[

            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content


def combine_dublicate_entities(entities_and_relations):
    # system prompt to guide bahavior of llm
    SYS_PROMPT = (
        "Only answer in a JSON format. \n"
        "Your task is to identify if there are dublicated nodes and if so merge them into one node."
        "Only merge nodes that refere to the same enitity.\n"
        "You will be given a dataset of nodes and relations and some of the nodes may be dublicated or refere to the same entity.\n"
        "The dataset contains nodes in the form [entity_1, entity_2, edge], where entity_1 and entity_2 are entities and the edge the relation between them.\n"
        "If either node_1 or node_2 refere to the same entity as another node then return tell me about the dublication."
        "If there are no dublications in the list of nodes and relations return nothing.\n"
        "Return dublicate entities in the following json format:\n"
        "[\n"
        "   {\n"
        '       "Entity": "the entity name that better represents the entity",\n'
        '       "Dublication": "The entity name that referes to the same entity"\n'
        "   }, {...}\n"
        "]"
    )

    # input data for the llm to work on
    USER_PROMPT = f"Here is the data:\n {entities_and_relations} \n\n output: "

    # get api key from shell environment
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    # request to the llm with the prepared prompts
    chat_completion = client.chat.completions.create(
        messages=[

            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content

def extraxt_entities_with_metadata(chunk):
    SYS_PROMPT = (
        "Only answer in a JSON format. \n"
        "Your task is extract the key concepts mentioned in the given context. "
        "Extract only the most important and atomistic concepts, if needed break the concepts down to the simpler concepts."
        "Categorize the concepts in one of the following categories: "
        "[person, event, concept, place, object, document, organisation, condition, miscellaneous]\n"
        "Format your output as a list of json (the output is processed further so only output json) with the following format:\n"
        "[\n"
        "   {\n"
        '       "entity": The Concept,\n'
        '       "importance": The concontextual importance of the concept on a scale of 1 to 5 (5 being the highest),\n'
        '       "category": The Type of Concept,\n'
        "   }, \n"
        "{ }, \n"
        "]\n"
    )

    # get api key from shell environment
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    # request to the llm with the prepared prompts
    chat_completion = client.chat.completions.create(
        messages=[

            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": chunk}
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content

def extraxt_relations_with_given_entities(chunk, entities):
    SYS_PROMPT = (
        "Only answer in a JSON format. \n"
        "You are a network graph maker who extracts relations and entities from a text piece"
        "In an earlier step of the knowlege graph creation process the following entities were extracted for this text chunk: "
        f"{entities}"
        "Given those entities what relations can you extract from the text chunk (delimited by ```) between the entities?"
        "Thought 1: Think about how these entities can have one on one relation with other entities.\n"
            "\tEntities that are mentioned in the same sentence or the same paragraph are typically related to each other.\n"
            "\tEntities can be related to many other Entities\n\n"
        "Thought 3: Find out the relation between each such related pair of terms. \n\n"
        "Format your output as a list of json with the following format:\n"
        "[\n"
        "   {\n"
        '       "entity_1": entity from the list of entities\n'
        '       "entity_2": entity from the list of entities\n'
        '       "edge": relationship between the two concepts, entity_1 and entity_2"\n'
        "   }, \n"
        "{ }, \n"
        "]\n"
    )

    # input data for the llm to work on
    USER_PROMPT = f"text chunk: ```{chunk}``` \n\n"

    # get api key from shell environment
    client = Groq(
        api_key=os.environ.get("GROQ_API_KEY"),
    )

    # request to the llm with the prepared prompts
    chat_completion = client.chat.completions.create(
        messages=[

            {"role": "system", "content": SYS_PROMPT},
            {"role": "user", "content": USER_PROMPT}
        ],
        model="llama3-8b-8192",
    )

    return chat_completion.choices[0].message.content
    