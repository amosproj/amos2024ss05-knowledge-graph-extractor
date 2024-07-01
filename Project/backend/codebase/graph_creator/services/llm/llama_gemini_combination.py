import time
import logging
from graph_creator.services.llm.gemini import gemini
from graph_creator.services.llm.llama3 import llama3
from graph_creator.services.llm.llm_Interface import LlmInterface
from graph_creator.services.json_handler import transform_llm_output_to_dict


class llama_gemini_combination(LlmInterface):
    """
    Class that combines llm handlers for llama3 and gemini
    """

    def __init__(self) -> None:
        self.gemini = gemini()
        self.llama3 = llama3()
        self.start_waiting_time = 0
        self.currently_waiting = False

    def orchestrate_llm_calls(self, function, *args):
        """
        Direct llm calls to groq and llama to achive higher performance (only during graph connection phase)
        """
        llama_rate_timeout = self.llama3.get_rate_timeout()
        if self.currently_waiting:
            waiting_time = time.time() - self.start_waiting_time
            if waiting_time > llama_rate_timeout:
                self.llama3.reset_llm_call_count()
                self.currently_waiting = False

        llama_rate_limit = self.llama3.get_llm_rate_limit()
        current_llm_call_count = self.llama3.get_llm_calls()

        #capture waiting time in last call of current rate frame
        captureTime = current_llm_call_count == llama_rate_limit - 1

        match function:
            case self.extract_entities_and_relations:
                if current_llm_call_count < llama_rate_limit:
                    result = self.llama3.extract_entities_and_relations(args[0])
                else:
                    time.sleep(llama_rate_timeout)
                    logging.info("Wait 60s until groq allows more requests")
                    return self.orchestrate_llm_calls(function, args)
            case self.check_for_connecting_relation:
                if current_llm_call_count < llama_rate_limit:
                    result = self.llama3.check_for_connecting_relation(args[0], args[1], args[2])
                else:
                    result = self.gemini.check_for_connecting_relation(args[0], args[1], args[2])
        
        if captureTime:
            self.start_waiting_time = time.time()
            self.currently_waiting = True

        return result

    def extract_entities_and_relations(self, chunk):
        """
        Extracts entities and relations from the text chunk
        """
        return self.orchestrate_llm_calls(self.extract_entities_and_relations, chunk)

    def check_for_connecting_relation(self, text_chunk, entities_component_1, entities_component_2):
        """
        Tries to connect two graph components by checking for a connecting relation between a subset of nodes 
        from both components. Both subsets only contain nodes from the same text chunk. Given the text chunk and
        both sets of nodes the llm tries to find a connecting relation.
        """
        return self.orchestrate_llm_calls(self.check_for_connecting_relation, text_chunk, entities_component_1, entities_component_2)

    def process_chunks(self, chunks):
        """
        Itterate over all text chunks and extract entities and relations
        """
        responses = []

        for chunk in chunks:
            text_content = chunk["text"]

            response_json = self.extract_entities_and_relations(text_content)

            responses.append(transform_llm_output_to_dict(response_json))

        return responses
    
    def execute_llm_call(self, chat_session, message):
        pass #not used