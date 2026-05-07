import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.db.session import Base, engine, get_db
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import io

# Setup test DB
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine_test = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine_test)

Base.metadata.create_all(bind=engine_test)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture
def auth_token():
    response = client.post("/api/auth/register", json={"username": "testuser", "password": "testpassword"})
    response = client.post("/api/auth/login", data={"username": "testuser", "password": "testpassword"})
    return response.json()["access_token"]

def test_root():
    response = client.get("/")
    assert response.status_code == 200

def test_register():
    response = client.post("/api/auth/register", json={"username": "newuser", "password": "password"})
    assert response.status_code == 200
    assert response.json()["username"] == "newuser"

def test_login():
    client.post("/api/auth/register", json={"username": "loginuser", "password": "password"})
    response = client.post("/api/auth/login", data={"username": "loginuser", "password": "password"})
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_upload_document(auth_token, monkeypatch):
    # mock background task to avoid actual processing
    monkeypatch.setattr("app.api.endpoints.documents.process_file_background", lambda *args, **kwargs: None)
    
    file_content = b"Dummy PDF content"
    files = {"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/documents/upload", files=files, headers=headers)
    assert response.status_code == 200
    assert response.json()["filename"] == "test.pdf"

def test_list_documents(auth_token):
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.get("/api/documents/", headers=headers)
    assert response.status_code == 200

def test_chat(auth_token, monkeypatch):
    # mock ask_question
    monkeypatch.setattr("app.api.endpoints.chat.ask_question", lambda *args: ("This is an answer [01:23]", [{"source": "test.pdf", "timestamp": 83}]))
    
    headers = {"Authorization": f"Bearer {auth_token}"}
    response = client.post("/api/chat/", json={"question": "test?"}, headers=headers)
    assert response.status_code == 200
    assert "answer" in response.json()
    assert response.json()["sources"][0]["timestamp"] == 83
