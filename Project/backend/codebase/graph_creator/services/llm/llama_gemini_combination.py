import time
from graph_creator.services.llm.gemini import gemini
from graph_creator.services.llm.llama3 import llama3
from graph_creator.services.llm.llm_Interface import LlmInterface
from graph_creator.services.json_handler import transform_llm_output_to_dict


class llama_gemini_combination(LlmInterface):

    def __init__(self) -> None:
        self.gemini = gemini()
        self.llama3 = llama3()
        self.start_waiting_time = 0
        self.currently_waiting = False

    def orchestrate_llm_calls(self, function, *args):

        if self.currently_waiting:
            rate_timeout = self.llama3.get_rate_timeout
            waiting_time = time.time() - self.start_waiting_time
            if waiting_time > rate_timeout:
                self.llama3.reset_llm_call_count()

        llama_rate_limit = self.llama3.get_llm_rate_limit()
        current_llm_call_count = self.llama3.get_llm_calls()

        #capture waiting time in last call of current rate frame
        captureTime = current_llm_call_count == llama_rate_limit - 1

        if current_llm_call_count < llama_rate_limit:
            match function:
                case self.extract_entities_and_relations:
                    result = self.llama3.extract_entities_and_relations(args)
                case self.check_for_connecting_relation:
                    result = self.llama3.extract_entities_and_relations(args)
        else:
            match function:
                case self.extract_entities_and_relations:
                    result = self.gemini.extract_entities_and_relations(args)
                case self.check_for_connecting_relation:
                    result = self.gemini.extract_entities_and_relations(args)
        
        if captureTime:
            self.start_waiting_time = time.time()
            self.currently_waiting = True

        return result

    def extract_entities_and_relations(self, chunk, genai_client):
        return self.orchestrate_llm_calls(self.extract_entities_and_relations, chunk, genai_client)

    def check_for_connecting_relation(self, text_chunk, entities_component_1, entities_component_2):
        return self.orchestrate_llm_calls(self.check_for_connecting_relation, text_chunk, entities_component_1, entities_component_2)

    def process_chunks(self, chunks):
        responses = []

        for chunk in chunks:
            text_content = chunk["text"]

            response_json = self.extract_entities_and_relations(text_content)

            responses.append(transform_llm_output_to_dict(response_json))

        return responses