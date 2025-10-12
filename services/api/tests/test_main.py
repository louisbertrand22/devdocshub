"""Basic tests for the main API endpoints."""
from fastapi import status


def test_root_endpoint(client):
    """Test the root endpoint returns a welcome message."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
    assert "message" in response.json()
    assert "DevDocsHub" in response.json()["message"]


def test_health_check(client):
    """Test that the API is healthy."""
    response = client.get("/")
    assert response.status_code == status.HTTP_200_OK
