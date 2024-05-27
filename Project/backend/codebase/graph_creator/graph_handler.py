import pandas as pd
import re
import json
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

def extract_entity_set(entity_and_relation_df):
    nodes = entity_and_relation_df['node_1'].tolist()
    nodes += entity_and_relation_df['node_2'].tolist()

    return list(set(nodes))

def index_entity_relation_table(entity_and_relation_df, entities):
    entities_dict = {}
    #for reproducable results
    entities = sorted(entities)
    for i in range(len(entities)):
        entities_dict[entities[i]] = i

    relations = []
    for i, row in entity_and_relation_df.iterrows():
        relations.append([entities_dict[row['node_1']], entities_dict[row['node_2']]])

    return entities_dict, relations


def extract_components(relations_list):
    components = [[]]
    for relation in relations_list:
        node_1 = relation[0]
        node_2 = relation[1]
        
        inserte = {'at' : -1, 'new_node' : -1}
        merge_with = -1
        for i in range(len(components)):
            if i >= len(components):
                break
            if len(components[i]) == 0 and inserte['at'] == -1:
                components[i].append(node_1)
                components[i].append(node_2)
                components.append([])
                break
            for j in range(len(components[i])):
                if node_1 == components[i][j]:
                    if inserte['at'] == -1:
                        inserte['new_node'] = node_2
                        inserte['at'] = i
                    else:
                        merge_with = i
                    break
                if node_2 == components[i][j]:
                    if inserte['at'] == -1:
                        inserte['new_node'] = node_1
                        inserte['at'] = i
                    else:
                        merge_with = i
                    break
        if merge_with >= 0:
            components[inserte['at']] += components[merge_with]
            components.pop(merge_with)
        elif inserte['at'] >= 0:
            components[inserte['at']].append(inserte['new_node'])

    # remove empty componente
    components.pop(len(components) - 1)
    
    return components

def get_entities_by_chunk(entity_and_relation_df, entities_dict):
    entities_by_chunk = {}
    for i, row in entity_and_relation_df.iterrows():
        if row['chunk_id'] in entities_by_chunk:
            entities_by_chunk[row['chunk_id']].append(entities_dict[row['node_1']])
            entities_by_chunk[row['chunk_id']].append(entities_dict[row['node_2']])
        else:
            entities_by_chunk[row['chunk_id']] = []
            entities_by_chunk[row['chunk_id']].append(entities_dict[row['node_1']])
            entities_by_chunk[row['chunk_id']].append(entities_dict[row['node_2']])
    
    return entities_by_chunk


def get_shared_chunks_by_component(component1, component2, entity_chunks_list):
    entities_component_1 = set(component1)
    entities_component_2 = set(component2)
    shared_chunks = []

    keys = list(entity_chunks_list.keys())
    intersections = {}
    for i in range(len(entity_chunks_list)):
        chunk_entities = set(entity_chunks_list[keys[i]])
        intersection_c1 = chunk_entities.intersection(entities_component_1)
        intersection_c2 = chunk_entities.intersection(entities_component_2)
        #print(f"{intersection_size_c1}, {intersection_size_c2}")
        if len(intersection_c1) > 0 and len(intersection_c2) > 0:
            shared_chunks.append(keys[i])
            intersections[keys[i]] = {'c1' : intersection_c1, 'c2' : intersection_c2}
    
    return shared_chunks, intersections


def translate_entity_list(entity_list, reverse_entities_dict):
    return [reverse_entities_dict[entity] for entity in entity_list]

def extract_relation_from_llm_output(llm_output):
    x = re.search(r"\{.*?\}", llm_output, re.DOTALL)
    if x is None:
        return None
    relation = json.loads(x.group(0))
    keys = relation.keys()
    if 'node_1' in keys and 'node_2' in keys and 'edge' in keys:
        return relation
    else:
        return None

def add_relations_to_data(entity_and_relation_df, new_relations):
    for relation in new_relations:
        node_1 = relation['node_1']
        node_2 = relation['node_2']
        edge = relation['edge']
        chunk_id = relation['chunk_id']

        pos = len(entity_and_relation_df.index)
        entity_and_relation_df.loc[pos] = [node_1, node_2, edge, chunk_id] 
    
    return entity_and_relation_df


def connect_with_llm(data, text_chunks):
    #dataCSV = data.to_csv(columns=["node_1", "node_2", "edge"], index=False)
    #llmDublicates = llm_handler.combine_dublicate_entities(dataCSV)
    #print(llmDublicates)
    # get components of unconnected graph
    entities = extract_entity_set(data)
    entities_dict, relations_list = index_entity_relation_table(data, entities)
    # test data [[1,2],[3,1],[1,4],[4,5],[5,7],[6,8],[6,5]]
    components = extract_components(relations_list)

    # get chunk information about contained entities
    entity_chunks_list = get_entities_by_chunk(data, entities_dict)
    
    #try to combine components
    #sort existing components by length
    components.sort(reverse=True, key=len)
    reverse_entities_dict = {v: k for k, v in entities_dict.items()}

    #try connecting to the biggest component
    #sharedChunks, intersections= get_shared_chunks_by_component(components[0], components[1], entity_chunks_list)
    counter = 0
    rate_limit = 1
    connecting_relations = []
    for i in range(1, len(components)):
        main_component = components[0]
        current_component = components[i]

        sharedChunks, intersections = get_shared_chunks_by_component(main_component, current_component, entity_chunks_list)

        #try to find new connection within each chunk
        for key_shared_chunk in sharedChunks:
            chunk_intersections = intersections[key_shared_chunk]
            main_chunk_entities = chunk_intersections['c1']
            current_chunk_entities = chunk_intersections['c2']
            main_chunk_entities = translate_entity_list(main_chunk_entities, reverse_entities_dict)
            current_chunk_entities = translate_entity_list(current_chunk_entities, reverse_entities_dict)

            #make call to llm with chunk and the entities of both components from that chunk
            text_chunk = text_chunks[int(key_shared_chunk)]
            if counter == rate_limit:
                break
            connecting_relation = llm_handler.check_for_connecting_relation(text_chunk['page_content'], main_chunk_entities, current_chunk_entities)
            counter += 1
        
            relation = extract_relation_from_llm_output(connecting_relation)
            if relation is not None:
                relation['chunk_id'] = key_shared_chunk
                connecting_relations.append(relation)
                continue

    #testdata connecting_relations = [{'node_1': 'Ford', 'node_2': 'Toyota', 'edge': 'partnered for the development of autonomous cars', 'chunk_id' : '0'}]
    data = add_relations_to_data(data, connecting_relations)
    entities_dict, relations_list = index_entity_relation_table(data, entities)
    # test data [[1,2],[3,1],[1,4],[4,5],[5,7],[6,8]]
    components = extract_components(relations_list)

    return data

                


            


