import spacy
from sentence_transformers import SentenceTransformer, util

# Load SpaCy model and SentenceTransformer model
nlp = spacy.load('en_core_web_md')
model = SentenceTransformer('all-MiniLM-L6-v2')

def normalize_entity(entity):
    """
    Normalize the entity for comparison.
    """
    return entity.lower()

def deduplicate_entities_and_relations(entities_and_relations):
    """
    Deduplicate entities and relations.

    Args:
        entities_and_relations (list): A list of dictionaries representing the entities and relations.

    Returns:
        list: A deduplicated list of entities and relations.
    """
    # Extract entities
    entities = [e['node_1'] for e in entities_and_relations] + [e['node_2'] for e in entities_and_relations]

    # Normalize entities
    normalized_entities = [normalize_entity(entity) for entity in entities]

    # Generate embeddings
    embeddings = model.encode(normalized_entities, convert_to_tensor=True)

    # Find duplicates based on cosine similarity
    duplicates = {}
    threshold = 0.8
    for i in range(len(embeddings)):
        for j in range(i + 1, len(embeddings)):
            similarity = util.pytorch_cos_sim(embeddings[i], embeddings[j])
            if similarity > threshold:
                duplicates[normalized_entities[j]] = normalized_entities[i]

    # Replace duplicates in entities_and_relations
    deduplicated_entities_and_relations = []
    for item in entities_and_relations:
        node_1 = normalize_entity(item['node_1'])
        node_2 = normalize_entity(item['node_2'])
        if node_1 in duplicates:
            item['node_1'] = duplicates[node_1]
        if node_2 in duplicates:
            item['node_2'] = duplicates[node_2]
        deduplicated_entities_and_relations.append(item)

    return deduplicated_entities_and_relations