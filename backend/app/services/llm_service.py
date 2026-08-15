import os
import json
import uuid
import shutil
import warnings
from typing import List, Dict, Any

import pdfplumber
import imageio_ffmpeg
import whisper
from langchain_groq import ChatGroq
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document as LangchainDocument
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage

from app.core.config import settings

ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
ffmpeg_dir = os.path.dirname(ffmpeg_exe)
ffmpeg_alias = os.path.join(ffmpeg_dir, "ffmpeg.exe" if os.name == "nt" else "ffmpeg")

if not os.path.exists(ffmpeg_alias):
    try:
        shutil.copyfile(ffmpeg_exe, ffmpeg_alias)
        if os.name != "nt":
            os.chmod(ffmpeg_alias, 0o755)
    except Exception:
        pass

os.environ["PATH"] += os.pathsep + ffmpeg_dir

warnings.filterwarnings("ignore")

_llm = None
_embeddings = None
_whisper_model = None

def get_llm():
    global _llm
    if _llm is None:
        api_key = settings.GROQ_API_KEY or os.environ.get("GROQ_API_KEY", "")
        _llm = ChatGroq(model_name="llama-3.1-8b-instant", temperature=0, groq_api_key=api_key)
    return _llm

def get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    return _embeddings

def get_whisper_model():
    global _whisper_model
    if _whisper_model is None:
        try:
            _whisper_model = whisper.load_model("base")
        except Exception as e:
            print(f"Failed to load Whisper model: {e}")
            _whisper_model = None
    return _whisper_model

VECTOR_STORE_PATH = "faiss_store"

def get_vector_store():
    index_file = os.path.join(VECTOR_STORE_PATH, "index.faiss")
    if os.path.exists(index_file):
        try:
            return FAISS.load_local(VECTOR_STORE_PATH, get_embeddings(), allow_dangerous_deserialization=True)
        except Exception as e:
            print(f"Error loading vector store: {e}")
            return None
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
    if text:
        chunk_size = 1000
        overlap = 200
        chunks = []
        for i in range(0, len(text), chunk_size - overlap):
            chunk_text = text[i:i + chunk_size]
            chunks.append(LangchainDocument(page_content=chunk_text, metadata={"source": f"doc_{document_id}", "type": "pdf"}))
        
        _add_to_faiss(chunks)
    return text

def process_audio_video(filepath: str, document_id: int):
    model = get_whisper_model()
    if not model:
        raise RuntimeError("Whisper model is not available")
        
    result = model.transcribe(filepath)
    segments = result.get("segments", [])
    text = result.get("text", "")
    
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
    if not docs:
        return
    vector_store = get_vector_store()
    if vector_store:
        vector_store.add_documents(docs)
    else:
        vector_store = FAISS.from_documents(docs, get_embeddings())
    save_vector_store(vector_store)

def generate_summary(text: str) -> str:
    if not text or not text.strip():
        return "No text available to summarize."
    # Truncate text to avoid token limits
    truncated = text[:15000]
    prompt = f"Summarize the following content concisely:\n\n{truncated}"
    response = get_llm().invoke(prompt)
    return response.content

def ask_question(question: str, user_doc_ids: List[int], db_summaries: str, chat_history: List[Dict[str, str]] = None) -> tuple[str, List[dict]]:
    if not user_doc_ids:
        return "No documents uploaded yet.", []

    vector_store = get_vector_store()
    if not vector_store:
        return "No document vector store found. Please upload a document first.", []
        
    docs = vector_store.similarity_search(question, k=20)
    
    valid_sources = [f"doc_{doc_id}" for doc_id in user_doc_ids]
    filtered_docs = [d for d in docs if d.metadata.get('source') in valid_sources][:5]
    
    context = db_summaries + "\n\nRetrieved Chunks:\n"
    sources = []
    for d in filtered_docs:
        ts = d.metadata.get('timestamp')
        if ts is not None and isinstance(ts, (int, float)):
            mins = int(ts // 60)
            secs = int(ts % 60)
            formatted_ts = f"[{mins:02d}:{secs:02d}]"
        else:
            formatted_ts = "N/A"
        context += f"Source: {d.metadata.get('source')} | Timestamp: {formatted_ts} | Content: {d.page_content}\n"
        sources.append(d.metadata)
        
    prompt = f"""
    You are an AI assistant. Answer the user's question ONLY based on the provided context. 
    The context includes overarching document summaries and specific relevant chunks.
    If the context doesn't contain the answer, say "I don't know based on the uploaded documents."
    If you use information from a media file with a timestamp, INCLUDE the timestamp in your answer like [01:23].
    
    Context:
    {context}
    
    Question: {question}
    """
    
    messages = [SystemMessage(content="You are a helpful RAG assistant.")]
    if chat_history:
        for msg in chat_history[-4:]: # Keep last 4 messages for context
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            else:
                messages.append(AIMessage(content=msg["content"]))
                
    messages.append(HumanMessage(content=prompt))
    
    response = get_llm().invoke(messages)
    
    return response.content, sources
