import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine, get_db
from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine

# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.drop_all(bind=engine_test)
Base.metadata.create_all(bind=engine_test)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_register_user():
    response = client.post("/api/auth/register", json={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

def test_login_user():
    response = client.post("/api/auth/login", data={"username": "testuser", "password": "testpassword"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_upload_document_unauthorized():
    response = client.get("/api/documents/")
    assert response.status_code == 401

def test_chat_unauthorized():
    response = client.get("/api/chat/history")
    assert response.status_code == 401
