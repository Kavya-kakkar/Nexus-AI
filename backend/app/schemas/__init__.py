from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str = Field(..., max_length=72)

class UserResponse(BaseModel):
    id: int
    username: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class DocumentResponse(BaseModel):
    id: int
    filename: str
    file_type: str
    summary: Optional[str] = None
    created_at: datetime
    class Config:
        from_attributes = True

class ChatRequest(BaseModel):
    question: str

class ChatResponse(BaseModel):
    answer: str
    sources: List[dict] = []
