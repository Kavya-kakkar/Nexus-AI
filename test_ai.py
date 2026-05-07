import sys
import os
sys.path.append(os.path.abspath("backend"))

from app.services.llm_service import _add_to_faiss, generate_summary
from langchain_core.documents import Document as LangchainDocument

try:
    print("Testing OpenAI Summary...")
    print(generate_summary("This is a test."))
    
    print("Testing FAISS...")
    _add_to_faiss([LangchainDocument(page_content="test", metadata={"source": "test", "type": "pdf"})])
    print("FAISS success!")
except Exception as e:
    print(f"FAILED: {e}")
