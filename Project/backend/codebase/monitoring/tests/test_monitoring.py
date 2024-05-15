from starlette import status

MONITORING_API = "monitoring"


def test_health_check(client):
    url = client.app.url_path_for("health_check")
    response = client.get(url)
    assert response.status_code == status.HTTP_200_OK
