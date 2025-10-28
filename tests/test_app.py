import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)


def test_register_participant():
    response = client.post("/register", json={"name": "Test Participant"})
    assert response.status_code == 200
    assert response.json() == {"message": "Participant registered successfully"}


def test_unregister_participant():
    response = client.post("/unregister", json={"name": "Test Participant"})
    assert response.status_code == 200
    assert response.json() == {"message": "Participant unregistered successfully"}
