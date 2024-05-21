import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from graph_creator import pdf_handler
from graph_creator import llm_handler
from graph_creator import graph_handler

import json


#convert pdf to text chunks using the pdf_handler
def convert_pdf_to_text_chunks():
    testfile = "tests/data/india_health_article.pdf"
    chunks = pdf_handler.process_pdf_into_chunks(testfile)
    for i in range(len(chunks)):
        chunks[i] = chunks[i].dict()
    with open("chunks.json", "w") as outfile: 
        json.dump(chunks, outfile)

#extract information of each text chunk using the llm_handler
def extract_information_with_llm():
    with open('chunks.json') as file:
        data = json.load(file)

    #print(data[0]['page_content'])
    resultData = []
    for datum in data:
        output = llm_handler.extraxt_entities_and_relations_from_chunk(datum['page_content'])
        resultData.append(output)
    
    #convert and check validity with json.loads()
    with open("llmExtractedInformationResponse.json", "w") as outfile: 
        json.dump(resultData, outfile)

#convert output content for each chunk to json (string -> object)
def convert_llm_output_to_json():
    with open('llmExtractedInformationResponse.json') as file:
        data = json.load(file)
    
    allJson = []
    for i in range(len(data)):
        allJson.append(json.loads(data[i]))

    with open("llmExtractedInformation.json", "w") as outfile: 
        json.dump(allJson, outfile)

#combine graph pieces to graph
def combine_extracted_nodes_and_relations():
    with open('llmExtractedInformation.json') as file:
        data = json.load(file)

if __name__ == '__main__':
    #convert_pdf_to_text_chunks()
    #extract_information_with_llm()
    #convert_llm_output_to_json()
    combine_extracted_nodes_and_relations()