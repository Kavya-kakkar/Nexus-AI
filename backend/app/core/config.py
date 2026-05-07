import os
from pathlib import Path
from pydantic_settings import BaseSettings
from dotenv import dotenv_values

env_path = Path(__file__).resolve().parent.parent.parent / ".env"
local_env = dotenv_values(env_path)
if local_env.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = local_env["OPENAI_API_KEY"]
if local_env.get("SECRET_KEY"):
    os.environ["SECRET_KEY"] = local_env["SECRET_KEY"]

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Q&A Assistant"
    SECRET_KEY: str = "supersecretkey"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    ALGORITHM: str = "HS256"
    
    DATABASE_URL: str = "sqlite:///./sql_app.db"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    GROQ_API_KEY: str = ""
    
    UPLOAD_DIR: str = "uploads"

    class Config:
        env_file = ".env"

settings = Settings()

os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
