from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, BackgroundTasks
from sqlalchemy.orm import Session
from app.db.session import get_db, SessionLocal
from app.api.deps import get_current_user
from app.models import User, Document
from app.schemas import DocumentResponse
from app.services import llm_service
from app.core.config import settings
import os
import shutil

router = APIRouter()

def process_file_background(filepath: str, document_id: int, file_type: str):
    db = SessionLocal()
    try:
        if file_type == "pdf":
            text = llm_service.process_pdf(filepath, document_id)
        else:
            # For mp3, wav, mp4, mkv
            text = llm_service.process_audio_video(filepath, document_id)
            
        summary = llm_service.generate_summary(text)
        
        doc = db.query(Document).filter(Document.id == document_id).first()
        if doc:
            doc.summary = summary
            db.commit()
    except Exception as e:
        print(f"Error processing file: {e}")
    finally:
        db.close()

@router.post("/upload", response_model=DocumentResponse)
def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ext = file.filename.split(".")[-1].lower()
    if ext not in ["pdf", "mp3", "wav", "mp4", "mkv"]:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    filepath = os.path.join(settings.UPLOAD_DIR, f"{current_user.id}_{file.filename}")
    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    file_type = "pdf" if ext == "pdf" else "media"
    
    new_doc = Document(
        filename=file.filename,
        file_type=file_type,
        filepath=filepath,
        owner_id=current_user.id
    )
    db.add(new_doc)
    db.commit()
    db.refresh(new_doc)
    
    background_tasks.add_task(process_file_background, filepath, new_doc.id, file_type)
    
    return new_doc

@router.get("/", response_model=list[DocumentResponse])
def list_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).filter(Document.owner_id == current_user.id).all()

from fastapi.responses import FileResponse

@router.get("/media/{document_id}")
def get_media(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    if not os.path.exists(doc.filepath):
        raise HTTPException(status_code=404, detail="File not found on server")
    return FileResponse(doc.filepath)

@router.delete("/{document_id}")
def delete_document(
    document_id: int, 
    db: Session = Depends(get_db), 
    current_user: User = Depends(get_current_user)
):
    doc = db.query(Document).filter(Document.id == document_id, Document.owner_id == current_user.id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
        
    if os.path.exists(doc.filepath):
        try:
            os.remove(doc.filepath)
        except:
            pass
            
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted"}
