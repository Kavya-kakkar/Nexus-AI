import os
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from dotenv import dotenv_values

BASE_DIR = Path(__file__).resolve().parent.parent.parent
env_path = BASE_DIR / ".env"
local_env = dotenv_values(env_path) if env_path.exists() else {}

if local_env.get("GROQ_API_KEY"):
    os.environ["GROQ_API_KEY"] = str(local_env["GROQ_API_KEY"])
if local_env.get("SECRET_KEY"):
    os.environ["SECRET_KEY"] = str(local_env["SECRET_KEY"])

class Settings(BaseSettings):
    PROJECT_NAME: str = "Nexus AI - Document & Media Analysis"
    SECRET_KEY: str = "supersecretkey"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"
    
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    GROQ_API_KEY: str = ""
    
    UPLOAD_DIR: str = str(BASE_DIR / "uploads")
    FAISS_DIR: str = str(BASE_DIR / "faiss_store")

    model_config = SettingsConfigDict(
        env_file=str(env_path) if env_path.exists() else ".env",
        extra="ignore"
    )

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.FAISS_DIR, exist_ok=True)

