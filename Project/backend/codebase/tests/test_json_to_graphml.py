import pytest
import networkx as nx
from ..graphCreator import json_to_graphml


def test_valid_json():
    json_string = '''
    [
        {"node_1": "A", "node_2": "B", "edge": "label1"},
        {"node_1": "C", "node_2": "D", "edge": "label2"},
        {"node_1": "E", "node_2": "F", "edge": "label3"}
    ]
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is not None
    assert len(graph.nodes) == 6
    assert len(graph.edges) == 3
    assert graph["A"]["B"]["label"] == "label1"
    assert graph["C"]["D"]["label"] == "label2"
    assert graph["E"]["F"]["label"] == "label3"


def test_invalid_json_syntax():
    json_string = '''
    [
        {"node_1": "A", "node_2": "B", "edge": "label1",
        {"node_1": "C", "node_2": "D", "edge": "label2"},
        {"node_1": "E", "node_2": "F", "edge": "label3"}
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is None


def test_not_a_list():
    json_string = '''
    {
        "node_1": "A", "node_2": "B", "edge": "label1"
    }
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is None


def test_relation_not_a_dict():
    json_string = '''
    [
        {"node_1": "A", "node_2": "B", "edge": "label1"},
        ["This", "is", "a", "list"],
        {"node_1": "C", "node_2": "D", "edge": "label2"}
    ]
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is not None
    assert len(graph.nodes) == 4
    assert len(graph.edges) == 2
    assert graph["A"]["B"]["label"] == "label1"
    assert graph["C"]["D"]["label"] == "label2"


def test_relation_missing_keys():
    json_string = '''
    [
        {"node_1": "A", "node_2": "B"},
        {"node_1": "C", "node_2": "D", "edge": "label2"}
    ]
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is not None
    assert len(graph.nodes) == 2
    assert len(graph.edges) == 1
    assert graph["C"]["D"]["label"] == "label2"


def test_relation_non_string_values():
    json_string = '''
    [
        {"node_1": "A", "node_2": "B", "edge": 123},
        {"node_1": "C", "node_2": "D", "edge": "label2"}
    ]
    '''
    graph = json_to_graphml.json_string_to_graph(json_string)
    assert graph is not None
    assert len(graph.nodes) == 2
    assert len(graph.edges) == 1
    assert graph["C"]["D"]["label"] == "label2"


if __name__ == "__main__":
    pytest.main()
