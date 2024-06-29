from abc import ABC, abstractmethod

class LlmInterface(ABC):

    @abstractmethod
    def execute_llm_call(self, chat_session, message):
        pass

    @abstractmethod
    def extract_entities_and_relations(self, chunk, genai_client):
        pass
    
    @abstractmethod
    def check_for_connecting_relation(self, text_chunk, entities_component_1, entities_component_2):
        pass

    @abstractmethod
    def process_chunks(self, chunks):
        pass