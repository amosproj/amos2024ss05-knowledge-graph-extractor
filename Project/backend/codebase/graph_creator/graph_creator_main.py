import mimetypes

from graph_creator.services.llm.llama_gemini_combination import llama_gemini_combination
from graph_creator.models.graph_job import GraphJob
from graph_creator import pdf_handler
from graph_creator import graph_handler
from graph_creator.services import netx_graphdb


def process_file_to_graph(g_job: GraphJob):
    """
    Processes a file to create a graph.

    Args:
        g_job (GraphJob): The GraphJob object containing information about the file and graph.

    Returns:
        None
    """
    # llm handler that is used for all llm calls during knowledge graph creation
    llm_handler = llama_gemini_combination()
    
    # extract entities and relations
    entities_and_relations, chunks = process_file_to_entities_and_relations(
        g_job.location,
        llm_handler
    )

    # check for error
    if entities_and_relations is None:
        return

    # connect graph pieces
    uuid = g_job.id
    create_and_store_graph(uuid, entities_and_relations, chunks, llm_handler)


def process_file_to_entities_and_relations(file: str, llm_handler):
    """
    Process the given file to extract entities and relations.

    Args:
        file (str): The path to the file to be processed.

    Returns:
        list: A list of dictionaries representing the extracted entities and relations.
    """
    # Save uploaded PDF file temporarily
    filename = file

    try:
        # Check if the file is a PDF by MIME type
        mime_type, _ = mimetypes.guess_type(filename)
        if mime_type != "application/pdf":
            raise ValueError("Uploaded file is not a PDF based on MIME type.")

        # Process PDF into chunks
        chunks = pdf_handler.process_pdf_into_chunks(filename)
        text_chunks = [
            {"text": chunk.page_content} for chunk in chunks
        ]  # Assuming chunk has 'page_content' attribute

        # Generate response using LLM
        # response_json = process_chunks(text_chunks, prompt_template)
        response_json = llm_handler.process_chunks(text_chunks)
        print(response_json)
    except Exception as e:
        print(e)
        response_json = None

    return response_json, chunks


def create_and_store_graph(uuid, entities_and_relations, chunks, llm_handler):
    """
    Create and store a graph based on the given entities and relations.

    Parameters:
    - uuid (str): The unique identifier for the graph.
    - entities_and_relations (list): A list of dictionaries representing the entities and relations.

    Returns:
    None
    """
    df_e_and_r = graph_handler.build_flattened_dataframe(entities_and_relations)

    # combine knowledge graph pieces
    # combined = graph_handler.connect_with_chunk_proximity(df_e_and_r)
    for i in range(len(chunks)):
        chunks[i] = chunks[i].dict()
    combined = graph_handler.connect_with_llm(df_e_and_r, chunks, llm_handler)

    # get graph db service
    graph_db_service = netx_graphdb.NetXGraphDB()

    # read entities and relations
    graph = graph_db_service.create_graph_from_df(combined, chunks)

    # save graph as file
    graph_db_service.save_graph(uuid, graph)
