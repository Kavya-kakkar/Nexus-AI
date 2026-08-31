import os
import shutil
import warnings
from typing import List, Dict, Any, Optional, Tuple

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
        _llm = ChatGroq(model_name="openai/gpt-oss-20b", temperature=0, groq_api_key=api_key)
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

VECTOR_STORE_PATH = settings.FAISS_DIR

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

from langchain_text_splitters import RecursiveCharacterTextSplitter

def process_pdf(filepath: str, document_id: int):
    full_text = ""
    chunks = []
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=700,
        chunk_overlap=120,
        separators=["\n\n", "\n", ". ", " ", ""]
    )
    
    with pdfplumber.open(filepath) as pdf:
        for i, page in enumerate(pdf.pages):
            page_num = i + 1
            page_text = page.extract_text()
            if page_text and page_text.strip():
                full_text += f"\n[Page {page_num}]\n" + page_text
                page_chunks = text_splitter.split_text(page_text.strip())
                for chunk in page_chunks:
                    chunks.append(LangchainDocument(
                        page_content=f"[Page {page_num}] {chunk}",
                        metadata={"source": f"doc_{document_id}", "type": "pdf", "page": page_num}
                    ))
    
    if chunks:
        _add_to_faiss(chunks)
    return full_text

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
            start_time = seg.get("start", 0)
        current_chunk += seg.get("text", "") + " "
        
        if len(current_chunk) > 400:
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
    try:
        truncated = text[:15000]
        prompt = f"Summarize the following content concisely and highlight the key points:\n\n{truncated}"
        response = get_llm().invoke(prompt)
        return str(response.content)
    except Exception as e:
        print(f"Error generating summary: {e}")
        return "Summary could not be generated at this time."

def ask_question(
    question: str, 
    user_doc_ids: List[int], 
    db_summaries: str, 
    chat_history: Optional[List[Dict[str, str]]] = None
) -> Tuple[str, List[Dict[str, Any]]]:
    if not user_doc_ids:
        return "No documents uploaded yet.", []

    vector_store = get_vector_store()
    if not vector_store:
        return "No document vector store found. Please upload a document first.", []
        
    try:
        # Retrieve candidate chunks with sufficient depth across multi-doc index
        docs = vector_store.similarity_search(question, k=100)
        
        valid_sources = {f"doc_{doc_id}" for doc_id in user_doc_ids}
        filtered_docs = [d for d in docs if d.metadata.get('source') in valid_sources][:8]
        
        context = db_summaries + "\n\nRelevant Document Excerpts:\n"
        sources: List[Dict[str, Any]] = []
        for d in filtered_docs:
            ts = d.metadata.get('timestamp')
            if ts is not None and isinstance(ts, (int, float)):
                mins = int(ts // 60)
                secs = int(ts % 60)
                formatted_ts = f"[{mins:02d}:{secs:02d}]"
            else:
                formatted_ts = "N/A"
            
            page_info = f" | Page {d.metadata.get('page')}" if d.metadata.get('page') else ""
            ts_info = f" | Timestamp: {formatted_ts}" if formatted_ts != "N/A" else ""
            context += f"--- Source: {d.metadata.get('source')}{page_info}{ts_info} ---\n{d.page_content}\n\n"
            sources.append(d.metadata)
            
        prompt = f"""
        You are an intelligent AI document assistant. Answer the user's question accurately and thoroughly based on the provided context.
        
        Instructions:
        - Base your answer directly on the facts present in the excerpts and summaries below.
        - Be clear, structured, and informative.
        - If the document contains relevant information, synthesize it into a complete and helpful answer.
        - If the user asks about something mentioned in a media file with timestamps, include the timestamp like [01:23].
        - Only if the context contains absolutely no relevant information to the question, state: "I don't have enough information in the uploaded documents to answer that."
        
        Context:
        {context}
        
        User Question: {question}
        """
        
        messages: List[Any] = [SystemMessage(content="You are an expert AI assistant that provides accurate, factual, and helpful answers based on uploaded documents.")]
        if chat_history:
            for msg in chat_history[-4:]: # Keep last 4 messages for conversational context
                if msg["role"] == "user":
                    messages.append(HumanMessage(content=msg["content"]))
                else:
                    messages.append(AIMessage(content=msg["content"]))
                    
        messages.append(HumanMessage(content=prompt))
        
        response = get_llm().invoke(messages)
        return str(response.content), sources
    except Exception as e:
        print(f"Error querying LLM: {e}")
        return "An error occurred while generating the answer. Please check your Groq API key and network connection.", []

