import unittest
from graph_creator.graph_creator_main import process_file_to_entities_and_relations

class TestGraphCreatorMain(unittest.TestCase):

    def test_process_file_to_entities_and_relations_valid_json(self):
        """
        Test that process_file_to_entities_and_relations returns a valid JSON structure
        when given a valid JSON string.
        """
        entities_and_relations, chunks = process_file_to_entities_and_relations(json_string)

        self.assertIsNotNone(entities_and_relations)
        self.assertIsInstance(entities_and_relations, list)
        self.assertTrue(all(isinstance(item, dict) for item in entities_and_relations))
        self.assertTrue(all('node_1' in item.keys() for item in entities_and_relations))
        self.assertTrue(all('node_2' in item.keys() for item in entities_and_relations))
        self.assertTrue(all('edge' in item.keys() for item in entities_and_relations))

    def test_process_file_to_entities_and_relations_invalid_json(self):
        """
        Test that process_file_to_entities_and_relations returns None
        when given an invalid JSON string.
        """
        invalid_json_string = "[{node_1: 'Apple', node_2: 'Fruit', edge: 'is_a'}]"
        entities_and_relations, chunks = process_file_to_entities_and_relations(invalid_json_string)

        self.assertIsNone(entities_and_relations)

    def test_process_file_to_entities_and_relations_empty_json(self):
        """
        Test that process_file_to_entities_and_relations returns an empty list
        when given an empty JSON string.
        """
        empty_json_string = "[]"
        entities_and_relations, chunks = process_file_to_entities_and_relations(empty_json_string)

        self.assertIsNotNone(entities_and_relations)
        self.assertEqual(entities_and_relations, [])

if __name__ == '__main__':
    unittest.main()
