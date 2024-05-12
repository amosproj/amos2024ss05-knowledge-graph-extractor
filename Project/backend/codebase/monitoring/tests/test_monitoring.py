MONITORING_API = "monitoring"


def test_read_item(client):
    response = client.get(f"api/{MONITORING_API}/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World, I am healthy! :D"}
