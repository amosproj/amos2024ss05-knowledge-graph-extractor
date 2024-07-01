from requests import patch
from graph_creator.services.llm.llama_gemini_combination import llama_gemini_combination
from graph_creator import graph_handler
from unittest.mock import patch, MagicMock

import json
import pandas as pd


def test_component_extraction():
    """
    Tests if component extraction works correctly
    """
    # Arrange
    testdata = [[1, 2], [3, 1], [1, 4], [4, 5], [5, 7], [6, 8]]
    # Act
    components = graph_handler.extract_components(testdata)
    # Assert
    assert len(components) == 2


def test_component_extraction_with_merge():
    """
    Tests if component extraction works with merge
    """
    # Arrange
    testdata = [[1, 2], [3, 1], [1, 4], [4, 5], [5, 7], [6, 8], [6, 5]]
    # Act
    components = graph_handler.extract_components(testdata)
    # Assert
    assert len(components) == 1


def test_relation_extraction_from_llm_output():
    """
    Tests if a relation dictionary can be extracted from the llm output
    """
    # Arrange
    llm_response = """
        Here is the data:[
            {
                "node_1": "Autonomous",
                "node_2": "Conference",
                "edge": "held"
            }
        ]
    """
    # Act
    relation = graph_handler.extract_relation_from_llm_output(
        llm_response, ["Autonomous"], ["Conference"]
    )
    # Assert
    assert relation is not None


def test_relation_extraction_from_llm_entity_not_in_lists():
    """
    Tests if only valid Relations are extracted that only contain entities from the input lists
    """
    # Arrange
    llm_response = """
        [
            {
                "node_1": "NewEntity",
                "node_2": "Conference",
                "edge": "held"
            }
        ]
    """
    # Act
    relation = graph_handler.extract_relation_from_llm_output(
        llm_response, ["Autonomous"], ["Conference"]
    )
    # Assert
    assert relation is None

def test_component_connection_with_llm(mocker):
    """
    Tests if component combination with llm works
    """
    # Arrange
    llm_response = """
        [
            {
                "node_1": "Autonomous",
                "node_2": "Conference",
                "edge": "held"
            }
        ]
    """

    patcher = patch('graph_creator.services.llm.llama_gemini_combination')
    MockLlama3 = patcher.start()
    mock_instance = MockLlama3.return_value

    mock_instance.check_for_connecting_relation.return_value = llm_response

    with open("tests/data/llmExtractedInformation.json") as file:
        entities_and_relations = json.load(file)

    with open("tests/data/chunks.json") as file:
        chunks = json.load(file)

    flattened_data = []
    for j in range(len(entities_and_relations)):
        id = j
        for i in range(len(entities_and_relations[j])):
            entities_and_relations[j][i]["chunk_id"] = str(id)
            flattened_data.append(entities_and_relations[j][i])
    df_entities_and_relations = pd.DataFrame(flattened_data)

    # Act
    # do one processing step to combine two disjoint components of the knowledge graph
    limit_attempts = 2
    result_entity_and_relations = graph_handler.connect_with_llm(
        df_entities_and_relations, chunks, mock_instance, limit_attempts
    )

    # Assert
    # calculate components of new knowledge graph
    entities = graph_handler.extract_entity_set(result_entity_and_relations)
    entities_dict, relations_list = graph_handler.index_entity_relation_table(
        result_entity_and_relations, entities
    )
    components = graph_handler.extract_components(relations_list)
    # now compare number of components after combining two components with the function
    # before combination we had 130 components now it should be one less
    assert len(components) == 129
