import pandas as pd
import re
import json
from graph_creator import llm_handler


def connect_with_chunk_proximity(entity_and_relation_df):
    """
    Create connections by connecting entities that are from the same text chunk

    Parameters
    ----------
    entity_and_relation_df :  pandas.dataframe
        Table of nodes and relations between the nodes

    Returns
    -------
    pandas.dataframe
        A table with given relations and chunk proximity relations between the nodes
    """
    # seperate all nodes by chunk_id
    df_by_chunk_id = pd.melt(
        entity_and_relation_df,
        id_vars=["chunk_id"],
        value_vars=["node_1", "node_2"],
        value_name="node",
    )
    df_by_chunk_id.drop(columns=["variable"], inplace=True)

    # connect all nodes within a chunk to each other
    df_merge = pd.merge(df_by_chunk_id, df_by_chunk_id, on="chunk_id")

    # we don't want self-loops
    df_merge = df_merge.drop(df_merge[df_merge["node_x"] == df_merge["node_y"]].index)

    # aggregate connections
    df_result = (
        df_merge.groupby(by=["node_x", "node_y"]).size().reset_index(name="count")
    )

    # lower number of connections
    df_result = df_result.drop(df_result[df_result["count"] == 1].index)

    # adapt naming and add edge name
    df_result = df_result.rename(columns={"node_x": "node_1", "node_y": "node_2"})
    df_result.drop(columns=["count"], inplace=True)
    df_result["edge"] = "text proximity"

    return df_result


def extract_entity_set(entity_and_relation_df):
    """
    Extract a set of all entities from the table of entities and relations

    Parameters
    ----------
    entity_and_relation_df :  pandas.dataframe
        Table of nodes and relations between the nodes

    Returns
    -------
    list
        A set of all entities as a list
    """
    nodes = entity_and_relation_df["node_1"].tolist()
    nodes += entity_and_relation_df["node_2"].tolist()

    return list(set(nodes))


def index_entity_relation_table(entity_and_relation_df, entities):
    """
    Translate relation table with entity index to better process relations

    Parameters
    ----------
    entity_and_relation_df :  pandas.dataframe
        Table of nodes and relations between the nodes
    entities : list
        Set of entities (every entity just exists once)

    Returns
    -------
    dict, list
        A dictionary to translate entities to an index number
        A List containing all relations as tuples of entity indexes
    """
    entities_dict = {}
    # for reproducable results
    entities = sorted(entities)
    for i in range(len(entities)):
        entities_dict[entities[i]] = i

    relations = []
    for i, row in entity_and_relation_df.iterrows():
        relations.append([entities_dict[row["node_1"]], entities_dict[row["node_2"]]])

    return entities_dict, relations


def extract_components(relations_list):
    """
    Extract components of the graph created by the entities and relations

    Parameters
    ----------
    relations_list :  list
        A List containing all relations as tuples of entity indexes

    Returns
    -------
    list
        A list of lists, which each contain the entities of a component
    """
    components = [[]]
    for relation in relations_list:
        node_1 = relation[0]
        node_2 = relation[1]

        inserte = {"at": -1, "new_node": -1}
        merge_with = -1
        for i in range(len(components)):
            if i >= len(components):
                break
            if len(components[i]) == 0 and inserte["at"] == -1:
                components[i].append(node_1)
                components[i].append(node_2)
                components.append([])
                break
            for j in range(len(components[i])):
                if node_1 == components[i][j]:
                    if inserte["at"] == -1:
                        inserte["new_node"] = node_2
                        inserte["at"] = i
                    else:
                        merge_with = i
                    break
                if node_2 == components[i][j]:
                    if inserte["at"] == -1:
                        inserte["new_node"] = node_1
                        inserte["at"] = i
                    else:
                        merge_with = i
                    break
        if merge_with >= 0:
            components[inserte["at"]] += components[merge_with]
            components.pop(merge_with)
        elif inserte["at"] >= 0:
            components[inserte["at"]].append(inserte["new_node"])

    # remove empty componente
    components.pop(len(components) - 1)

    return components


def get_entities_by_chunk(entity_and_relation_df, entities_dict):
    """
    Get for each chunk all entities that were extracted from a chunk

    Parameters
    ----------
    entity_and_relation_df :  pandas.dataframe
        Table of nodes and relations between the nodes
    entities_dict : dict
        A dictionary to translate entities to an index number

    Returns
    -------
    dict
        A dictionary containing all entities per chunk as ids
    """
    entities_by_chunk = {}
    for i, row in entity_and_relation_df.iterrows():
        if row["chunk_id"] in entities_by_chunk:
            entities_by_chunk[row["chunk_id"]].append(entities_dict[row["node_1"]])
            entities_by_chunk[row["chunk_id"]].append(entities_dict[row["node_2"]])
        else:
            entities_by_chunk[row["chunk_id"]] = []
            entities_by_chunk[row["chunk_id"]].append(entities_dict[row["node_1"]])
            entities_by_chunk[row["chunk_id"]].append(entities_dict[row["node_2"]])

    return entities_by_chunk


def get_shared_chunks_by_component(component1, component2, entity_chunks_list):
    """
    For two graph components get the shared chunks from which entities for both components were extracted

    Parameters
    ----------
    component1 : list
        A list contain the entities of component1
    component2 : list
        A list contain the entities of component2
    entity_chunks_list : dict
        A dictionary containing all entities per chunk as ids

    Returns
    -------
    list, dict
        A list containing the chunk_ids of all shared chunks
        A dictionary containing for each shared chunk the nodes from component1 and component2 (seperated)
    """
    entities_component_1 = set(component1)
    entities_component_2 = set(component2)
    shared_chunks = []

    keys = list(entity_chunks_list.keys())
    intersections = {}
    for i in range(len(entity_chunks_list)):
        chunk_entities = set(entity_chunks_list[keys[i]])
        intersection_c1 = chunk_entities.intersection(entities_component_1)
        intersection_c2 = chunk_entities.intersection(entities_component_2)
        # print(f"{intersection_size_c1}, {intersection_size_c2}")
        if len(intersection_c1) > 0 and len(intersection_c2) > 0:
            shared_chunks.append(keys[i])
            intersections[keys[i]] = {"c1": intersection_c1, "c2": intersection_c2}

    return shared_chunks, intersections


def translate_entity_list(entity_list, reverse_entities_dict):
    """
    Translate a list of entity_ids back to the actual entities

    Parameters
    ----------
    entity_list : list
        A set of all entities as a list
    reverse_entities_dict:
        A dictionary containing the entity_id to entity mapping

    Returns
    -------
    list
        A list of entities
    """
    return [reverse_entities_dict[entity] for entity in entity_list]


def extract_relation_from_llm_output(llm_output, entities_c1, entities_c2):
    """
    Extract a dictionary from the llm output

    Parameters
    ----------
    llm_output : str
        The llm output
    entities_c1 : list
        The entities of component1
    entities_c1 : list
        The entities of component2

    Returns
    -------
    dict
        The relation as a dictionary
    """
    x = re.search(r"\{.*?\}", llm_output, re.DOTALL)
    if x is None:
        return None
    try:
        relation = json.loads(x.group(0))
    except json.JSONDecodeError:
        return None
    keys = relation.keys()
    if "node_1" not in keys or "node_2" not in keys or "edge" not in keys:
        return None
    if relation["node_1"] in entities_c1 and relation["node_2"] in entities_c2:
        return relation
    else:
        return None


def add_relations_to_data(entity_and_relation_df, new_relations):
    """
    Add a relation to the table of relations

    Parameters
    ----------
    entity_and_relation_df : pandas.dataframe
        Table of nodes and relations between the nodes
    new_relations : dict
        A new relation


    Returns
    -------
    pandas.dataframe
        The updated dataframe

    """
    for relation in new_relations:
        node_1 = relation["node_1"]
        node_2 = relation["node_2"]
        edge = relation["edge"]
        chunk_id = relation["chunk_id"]

        pos = len(entity_and_relation_df.index)
        entity_and_relation_df.loc[pos] = [node_1, node_2, edge, chunk_id]

    return entity_and_relation_df


def connect_with_llm(data, text_chunks, rate_limit):
    """
    Connect the pieces of the knowlege graph by extracting new relations between disjoint
    graph pieces from the text chunks using the llm

    Parameters
    ----------
    data : pandas.dataframe
        Table of nodes and relations between the nodes
    text_chunks : list
        A list of dictionaries containing the text chunks

    Returns
    -------
    pandas.dataframe
        A table of the old and new relations
    """
    # get components of unconnected graph
    entities = extract_entity_set(data)
    entities_dict, relations_list = index_entity_relation_table(data, entities)
    components = extract_components(relations_list)

    # get chunk information about contained entities
    entity_chunks_list = get_entities_by_chunk(data, entities_dict)

    # try to combine components
    # sort existing components by length
    components.sort(reverse=True, key=len)
    reverse_entities_dict = {v: k for k, v in entities_dict.items()}

    # try connecting to the biggest component
    counter = 0
    connecting_relations = []
    for i in range(1, len(components)):
        main_component = components[0]
        current_component = components[i]

        sharedChunks, intersections = get_shared_chunks_by_component(
            main_component, current_component, entity_chunks_list
        )

        # try to find new connection within each chunk
        for key_shared_chunk in sharedChunks:
            chunk_intersections = intersections[key_shared_chunk]
            main_chunk_entities = chunk_intersections["c1"]
            current_chunk_entities = chunk_intersections["c2"]
            main_chunk_entities = translate_entity_list(
                main_chunk_entities, reverse_entities_dict
            )
            current_chunk_entities = translate_entity_list(
                current_chunk_entities, reverse_entities_dict
            )

            # make call to llm with chunk and the entities of both components from that chunk
            text_chunk = text_chunks[int(key_shared_chunk)]
            if counter == rate_limit:
                break
            connecting_relation = llm_handler.check_for_connecting_relation(
                text_chunk["page_content"], main_chunk_entities, current_chunk_entities
            )
            counter += 1

            relation = extract_relation_from_llm_output(
                connecting_relation, main_chunk_entities, current_chunk_entities
            )
            # if relation is extracted than a valid relation containing only existing entities can be added
            # print(relation)
            if relation is not None:
                relation["chunk_id"] = key_shared_chunk
                connecting_relations.append(relation)
                break

    data = add_relations_to_data(data, connecting_relations)

    return data
