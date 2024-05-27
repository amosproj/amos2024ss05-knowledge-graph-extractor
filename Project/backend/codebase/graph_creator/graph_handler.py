import pandas as pd
from graph_creator import llm_handler


def connect_with_chunk_proximity(data):
    # seperate all nodes by chunk_id
    df_by_chunk_id = pd.melt(data, id_vars=["chunk_id"], value_vars=["node_1", "node_2"], value_name="node")
    df_by_chunk_id.drop(columns=["variable"], inplace=True)
    
    # connect all nodes within a chunk to each other
    df_merge = pd.merge(df_by_chunk_id, df_by_chunk_id, on="chunk_id")

    # we don't want self-loops
    df_merge = df_merge.drop(df_merge[df_merge["node_x"] == df_merge["node_y"]].index)

    # aggregate connections
    df_result = df_merge.groupby(by=['node_x', 'node_y']).size().reset_index(name='count')

    # lower number of connections 
    df_result = df_result.drop(df_result[df_result["count"] == 1].index)

    # adapt naming and add edge name
    df_result = df_result.rename(columns={'node_x': 'node_1', 'node_y': 'node_2'})
    df_result.drop(columns=["count"], inplace=True)
    df_result["edge"] = "text proximity"
    
    return df_result

def connect_with_llm(data):
    dataCSV = data.to_csv(columns=["entity_1", "entity_2", "edge"], index=False)
    llmDublicates = llm_handler.combine_dublicate_entities(dataCSV)
    print(llmDublicates)
