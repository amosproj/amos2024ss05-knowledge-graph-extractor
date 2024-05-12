import pytest

MONITORING_API = "monitoring"


@pytest.mark.api
async def test_read_item(async_client):
    response = await async_client.get(f"api/{MONITORING_API}/health")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World, I am healthy! :D"}
