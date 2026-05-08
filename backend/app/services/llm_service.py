import os
import json
import uuid
import warnings
from typing import List, Dict, Any
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LangchainDocument
from app.core.config import settings
import pdfplumber

import imageio_ffmpeg
import shutil

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)
ffmpeg_alias = os.path.join(ffmpeg_dir, "ffmpeg.exe" if os.name == "nt" else "ffmpeg")

if not os.path.exists(ffmpeg_alias):
    try:
        shutil.copyfile(ffmpeg_exe, ffmpeg_alias)
        if os.name != "nt":
            os.chmod(ffmpeg_alias, 0o755)
    except:
        pass

os.environ["PATH"] += os.pathsep + ffmpeg_dir

import whisper

warnings.filterwarnings("ignore")

llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0, groq_api_key=settings.GROQ_API_KEY)
embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Initialize whisper lazily so it doesn't block startup too long, or initialize here
try:
    whisper_model = whisper.load_model("base")
except:
    whisper_model = None

VECTOR_STORE_PATH = "faiss_store"

def get_vector_store():
    if os.path.exists(VECTOR_STORE_PATH):
        return FAISS.load_local(VECTOR_STORE_PATH, embeddings, allow_dangerous_deserialization=True)
    return None

def save_vector_store(vector_store: FAISS):
    vector_store.save_local(VECTOR_STORE_PATH)

def process_pdf(filepath: str, document_id: int):
    text = ""
    with pdfplumber.open(filepath) as pdf:
        for i, page in enumerate(pdf.pages):
            page_text = page.extract_text()
            if page_text:
                text += f"\n[Page {i+1}]\n" + page_text
    
    # Chunking
    chunk_size = 1000
    overlap = 200
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk_text = text[i:i + chunk_size]
        chunks.append(LangchainDocument(page_content=chunk_text, metadata={"source": f"doc_{document_id}", "type": "pdf"}))
    
    _add_to_faiss(chunks)
    return text

def process_audio_video(filepath: str, document_id: int):
    global whisper_model
    if not whisper_model:
        whisper_model = whisper.load_model("base")
        
    result = whisper_model.transcribe(filepath)
    segments = result["segments"]
    text = result["text"]
    
    chunks = []
    current_chunk = ""
    start_time = 0
    
    for seg in segments:
        if not current_chunk:
            start_time = seg["start"]
        current_chunk += seg["text"] + " "
        
        if len(current_chunk) > 500:
            chunks.append(LangchainDocument(
                page_content=current_chunk.strip(),
                metadata={
                    "source": f"doc_{document_id}",
                    "type": "media",
                    "timestamp": start_time
                }
            ))
            current_chunk = ""
            
    if current_chunk:
        chunks.append(LangchainDocument(
            page_content=current_chunk.strip(),
            metadata={"source": f"doc_{document_id}", "type": "media", "timestamp": start_time}
        ))
        
    _add_to_faiss(chunks)
    return text

def _add_to_faiss(docs: List[LangchainDocument]):
    if not docs: return
    vector_store = get_vector_store()
    if vector_store:
        vector_store.add_documents(docs)
    else:
        vector_store = FAISS.from_documents(docs, embeddings)
    save_vector_store(vector_store)

def generate_summary(text: str) -> str:
    # Truncate text to avoid token limits
    truncated = text[:15000]
    prompt = f"Summarize the following content concisely:\n\n{truncated}"
    response = llm.invoke(prompt)
    return response.content

def ask_question(question: str, user_id: int, chat_history: List[Dict[str, str]] = None) -> tuple[str, List[dict]]:
    vector_store = get_vector_store()
    if not vector_store:
        return "No documents uploaded yet.", []
        
    docs = vector_store.similarity_search(question, k=5)
    
    context = ""
    sources = []
    for d in docs:
        context += f"Source: {d.metadata.get('source')} | Timestamp: {d.metadata.get('timestamp', 'N/A')} | Content: {d.page_content}\n"
        sources.append(d.metadata)
        
    prompt = f"""
    You are an AI assistant. Answer the user's question ONLY based on the provided context. 
    If the context doesn't contain the answer, say "I don't know based on the uploaded documents."
    If you use information from a media file with a timestamp, INCLUDE the timestamp in your answer like [01:23].
    
    Context:
    {context}
    
    Question: {question}
    """
    
    from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
    messages = [SystemMessage(content="You are a helpful RAG assistant.")]
    if chat_history:
        for msg in chat_history[-4:]: # Keep last 4 messages for context
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
                
    messages.append(HumanMessage(content=prompt))
    
    response = llm.invoke(messages)
    
    return response.content, sources
