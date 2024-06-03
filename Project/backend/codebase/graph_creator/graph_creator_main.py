import json
import pandas

from graph_creator.models.graph_job import GraphJob

from graph_creator import pdf_handler
from graph_creator import llm_handler
from graph_creator import graph_handler
from graph_creator.services import netx_graphdb

def process_file_to_graph(g_job: GraphJob):
    #extract entities and relations
    entities_and_relations = process_file_to_entities_and_relations(g_job.location)
    uuid = g_job.id
    create_and_store_graph(uuid, entities_and_relations)

def process_file_to_entities_and_relations(file):
    #todo: implement actual processing
    #chunks = pdf_handler.process_pdf_into_chunks(file)

    with open("tests/data/llmExtractedInformation.json") as file:
        entities_and_relations = json.load(file)
    
    #flatten the list ba adding attribute chunk_id
    flattened_data = []
    for j in range(len(entities_and_relations)):
        id = j
        for i in range(len(entities_and_relations[j])):
            entities_and_relations[j][i]['chunk_id'] = str(id)
            flattened_data.append(entities_and_relations[j][i])
    
    return flattened_data

def create_and_store_graph(uuid, entities_and_relations):
    #convert data to dataframe
    df_e_and_r = pandas.DataFrame(entities_and_relations)

    #combine knowlege graph pieces
    print(df_e_and_r)
    combined = graph_handler.connect_with_chunk_proximity(df_e_and_r)

    #get graph db service
    graph_db_service = netx_graphdb.NetXGraphDB()

    #read entitries and relations
    graph = graph_db_service.create_graph_from_df(uuid, combined)

    #safe graph as file
    graph_db_service.save_graph(uuid, graph)

    print("Done with processing")

