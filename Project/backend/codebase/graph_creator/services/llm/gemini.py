import os
import logging
from datetime import datetime
import google.generativeai as genai
from graph_creator.services.llm.llm_Interface import LlmInterface
from graph_creator.services.json_handler import transform_llm_output_to_dict
from google.generativeai.types.generation_types import StopCandidateException


class gemini(LlmInterface):
    """
    Gemini llm handler
    """

    def __init__(self) -> None:
        super().__init__()
        self.configure_genai()
        self.genai_client = self.get_genai_client()

    def configure_genai(self):
        """
        Ensure the API key is set in the environment
        """
        # load_dotenv("Project/backend/.env", override=True)
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("API key not found in environment variables")
        genai.configure(api_key=api_key)

    def get_genai_client(self):
        genai_client = genai.GenerativeModel(
            # model_name="gemini-1.5-pro-latest",
            model_name="gemini-1.5-flash-latest",
            safety_settings=[
                {
                    "category": "HARM_CATEGORY_HARASSMENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_HATE_SPEECH",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
                {
                    "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                    "threshold": "BLOCK_MEDIUM_AND_ABOVE",
                },
            ],
            generation_config={
                "temperature": 1,
                "top_p": 0.95,
                "top_k": 64,
                "max_output_tokens": 8192,
                "response_mime_type": "text/plain",
            },
        )

        return genai_client

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

    def execute_llm_call(self, chat_session, message):
        """
        Execute the prompt with the gemini client
        """
        logging.info("Run prompt with gemini")
        return chat_session.send_message(message)

    def extract_entities_and_relations(self, chunk):
        """
        Extract entities and relations from a chunk using the Gemini client.
        """
        SYS_PROMPT = (
            "Only answer in a JSON format. \n"
            "You are a network graph maker who extracts the most critical terms and their relations from a given context. "
            "You are provided with a context chunk (delimited by ```). Your task is to extract the ontology "
            "of the few key terms that are indispensable for understanding the given context. These terms should represent the core concepts as per the context. \n"
            "Thought 1: Identify the few most critical terms in the entire context.\n"
            "\tTerms may include only the most significant objects, entities, locations, organizations, people, conditions, acronyms, documents, services, concepts, etc.\n"
            "\tExclude all terms that are not crucial to the core message.\n"
            "\tDo not extract a term from every sentence; focus only on the most important terms across the entire context.\n\n"
            "Thought 2: Determine how these indispensable terms are directly related to each other.\n"
            "\tTerms that are mentioned in the same sentence or paragraph are typically related to each other.\n"
            "\tFocus solely on relationships that reveal the most critical interactions or dependencies, ignoring all minor details.\n\n"
            "Thought 3: Identify the specific type of relationship between each related pair of terms.\n"
            "\tEnsure the relationship is crucial, highly relevant, and necessary for understanding the context.\n\n"
            "Format your output as a list of JSON. Each element of the list contains a pair of terms "
            "and the relation between them, like the following: \n"
            "[\n"
            "   {\n"
            '       "node_1": "A core concept from extracted ontology",\n'
            '       "node_2": "A related core concept from extracted ontology",\n'
            '       "edge": "relationship between the two concepts, node_1 and node_2"\n'
            "   }, {...}\n"
            "]"
        )
        
        USER_PROMPT = f"context: ```{chunk}``` \n\n output: "

        chat_session = self.genai_client.start_chat(history=[])
        message = SYS_PROMPT + USER_PROMPT
        response = self.execute_llm_call(chat_session, message)

        return response.text

    def check_for_connecting_relation(
        self, chunk, entities_component_1, entities_component_2
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

        chat_session = self.genai_client.start_chat(history=[])
        message = SYS_PROMPT + USER_PROMPT
        result = ""
        try:
            response = self.execute_llm_call(chat_session, message)
            result = response.text
        except StopCandidateException as googleException:
            logging.error(googleException)

        return result

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
