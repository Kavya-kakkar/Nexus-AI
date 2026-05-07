from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.deps import get_current_user
from app.models import User, Chat
from app.schemas import ChatRequest, ChatResponse
from app.services.llm_service import ask_question

router = APIRouter()

@router.post("/", response_model=ChatResponse)
def chat_with_docs(
    request: ChatRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Fetch recent chat history
    history = db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.desc()).limit(4).all()
    history_formatted = []
    for h in reversed(history):
        history_formatted.append({"role": "user", "content": h.question})
        history_formatted.append({"role": "assistant", "content": h.answer})
        
    answer, sources = ask_question(request.question, current_user.id, history_formatted)
    
    # Save chat
    new_chat = Chat(
        user_id=current_user.id,
        question=request.question,
        answer=answer
    )
    db.add(new_chat)
    db.commit()
    
    return ChatResponse(answer=answer, sources=sources)
    
@router.get("/history")
def get_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Chat).filter(Chat.user_id == current_user.id).order_by(Chat.created_at.asc()).all()

@router.delete("/history")
def delete_chat_history(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    db.query(Chat).filter(Chat.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared successfully"}

