import sys
from pathlib import Path
import networkx as nx
import matplotlib.pyplot as plt
import pandas as pd

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
        #print(i)
        allJson.append(json.loads(data[i]))

    with open("llmExtractedInformation.json", "w") as outfile: 
        json.dump(allJson, outfile)


#extract information of each text chunk using the llm_handler
def extract_information_with_llm_entities():
    with open('chunks.json') as file:
        data = json.load(file)

    #print(data[0]['page_content'])
    resultData = []
    for datum in data:
        output = llm_handler.extraxt_entities_with_metadata(datum['page_content'])
        resultData.append(output)
    
    #convert and check validity with json.loads()
    with open("llmExtractedInformationResponseOnlyEntities.json", "w") as outfile: 
        json.dump(resultData, outfile)

def extract_information_with_llm_relations():
    with open('llmExtractedInformationOnlyEntities.json') as file:
        entities = json.load(file)
    
    with open('chunks.json') as file:
        chunks = json.load(file)

    resultData = []
    enteties = [d['entity'] for d in entities[0]]
    output = llm_handler.extraxt_relations_with_given_entities(chunks[0]['page_content'], enteties)
    for i in range(len(chunks)):
        enteties = [d['entity'] for d in entities[i]]
        output = llm_handler.extraxt_relations_with_given_entities(chunks[i]['page_content'], enteties)
        resultData.append(output)

    with open("llmExtractedInformationResponseWithRelations.json", "w") as outfile: 
        json.dump(resultData, outfile)


#combine graph pieces to graph
def combine_extracted_nodes_and_relations():
    with open('llmExtractedInformationWithRelations.json') as file:
        data = json.load(file)

    #flatten the list ba adding attribute chunk_id
    flattened_data = []
    for j in range(len(data)):
        id = j
        for i in range(len(data[j])):
            data[j][i]['chunk_id'] = str(id)
            flattened_data.append(data[j][i])
    
    df_data = pd.DataFrame(flattened_data)
    # connect subgraphs
    #combined = graph_handler.connect_with_chunk_proximity(df_data)
    combined = graph_handler.connect_with_llm(df_data)

    # show what graph
    graphBeforeCombination = True
    
    #display graph
    G = nx.Graph()
    if graphBeforeCombination:
        for edge in flattened_data:
            G.add_edge(edge['entity_1'], edge['entity_2'])
    else:
        combined = combined.reset_index()
        for index, row in combined.iterrows():
            G.add_edge(row['node_1'], row['node_2'])


    nx.draw_networkx(G)

    # Set margins for the axes so that nodes aren't clipped
    ax = plt.gca()
    ax.margins(0.20)
    plt.axis("off")
    plt.show()

if __name__ == '__main__':
    #convert_pdf_to_text_chunks()
    #extract_information_with_llm()
    #convert_llm_output_to_json()
    combine_extracted_nodes_and_relations()
    #extract_information_with_llm_entities()
    #extract_information_with_llm_relations()