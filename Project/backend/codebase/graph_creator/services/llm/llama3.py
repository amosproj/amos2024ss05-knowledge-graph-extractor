import os
import time
from datetime import datetime
from groq import Groq

from graph_creator.services.llm.llm_Interface import LlmInterface
from graph_creator.services.json_handler import transform_llm_output_to_dict

class llama3(LlmInterface):
    """
    Llama3 llm handler that works with the provider groq
    """

    def __init__(self) -> None:
        self.llm_calls = 0
        self.llm_rate_limit = 30
        self.rate_timeout = 60

        self.genai_client = self.configure_groq()

    def get_llm_calls(self):
        return self.llm_calls
    
    def get_llm_rate_limit(self):
        return self.llm_rate_limit
    
    def get_rate_timeout(self):
        return self.rate_timeout
    
    def reset_llm_call_count(self):
        """
        Reset llm call tracking because groq limits the request rate
        """
        self.llm_calls = 0

    def configure_groq(self):
        """
        Ensure the API key is set in the environment
        """
        # load_dotenv("Project/backend/.env", override=True)
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            raise ValueError("API key not found in environment variables")
        return Groq(api_key=api_key)


    def serialize_chat_history(self, history):
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

    def execute_llm_call(self, message):
        """
        Execute a prompt with the groq client
        """
        # only make calls to the llm if request rate allows for it
        if self.llm_calls > 0 and self.llm_calls % self.llm_rate_limit == 0:
            # wait 60s so that available requests are refreshed
            time.sleep(self.rate_timeout)
        result = self.genai_client.chat.completions.create(
            messages=message,
            model="llama3-8b-8192",
        )
        self.llm_calls += 1

        return result


    def extract_entities_and_relations(self, chunk):
        """
        Extract entities and relations from a chunk using the Groq client.
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
        messages=[
                {"role": "system", "content": SYS_PROMPT},
                {"role": "user", "content": USER_PROMPT},
            ]
        chat_completion = self.execute_llm_call(messages)
        return chat_completion.choices[0].message.content


    def check_for_connecting_relation(self, 
        chunk, entities_component_1, entities_component_2
    ):
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
        messages=[
                {"role": "system", "content": SYS_PROMPT},
                {"role": "user", "content": USER_PROMPT},
            ]
        chat_completion = self.execute_llm_call(messages)
        return chat_completion.choices[0].message.content


    def process_chunks(self, chunks):
        """
        Process a list of chunks through the generative model.
        """
        responses = []

        for chunk in chunks:
            text_content = chunk["text"]

            response_json = self.extract_entities_and_relations(text_content)

            responses.append(transform_llm_output_to_dict(response_json))

        return responses
