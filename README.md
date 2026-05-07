# Nexus AI: AI-Powered Document & Multimedia Q&A

Nexus AI is a full-stack application that enables users to upload PDF documents, audio, and video files, and seamlessly ask questions against their content. It leverages state-of-the-art Large Language Models (LLMs) and embeddings to provide highly contextual, time-stamped answers.

## 🚀 Features
- **Multi-Format Support**: Upload PDF (`.pdf`), Audio (`.mp3`, `.wav`), and Video (`.mp4`, `.mkv`).
- **Local AI Pipelines**:
  - Transcribes audio/video completely locally using **OpenAI Whisper**.
  - Generates fast document embeddings using **HuggingFace MiniLM**.
  - Employs **FAISS** for rapid local vector and semantic search.
- **Intelligent Q&A Chatbot**: Powered by LangChain and Groq API (Llama 3).
- **Time-Stamped Citations**: Chatbot highlights exact timestamps from media that you can click to jump straight to that moment in the video/audio player.
- **Real-time AI Summaries**: Automatically generates summaries of all uploaded content in the background.

## 🏗 Architecture
- **Backend**: Python 3.11, FastAPI, SQLAlchemy, LangChain, FAISS.
- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion.
- **Database**: SQLite (RDBMS).

## 🛠 Prerequisites
- **Python 3.11+**
- **Node.js 18+**
- **Docker** & **Docker Compose** (For containerized deployment)

## 💻 Local Setup Instructions

### 1. Backend Setup
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file inside `backend/` and add your Groq API key:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   SECRET_KEY=super_secure_secret_string
   DATABASE_URL=sqlite:///./sql_app.db
   ```
5. Start the backend server:
   ```bash
   uvicorn app.main:app --reload
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open `http://localhost:5173` in your browser.

## 🐳 Running with Docker Compose
You can launch the entire stack via Docker:
```bash
docker-compose up --build -d
```
- The frontend will be available at `http://localhost:5173`
- The backend API will be available at `http://localhost:8000`

## 🧪 Testing
The backend features an automated testing suite using `pytest` and `httpx`.
To run tests and view coverage:
```bash
cd backend
venv\Scripts\activate
pip install pytest-cov httpx
pytest --cov=app --cov-report=term
```

## 📖 API Documentation
Once the backend is running, FastAPI automatically generates interactive documentation:
- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

### Core API Endpoints
- `POST /api/auth/register` - Create a new user account
- `POST /api/auth/login` - Authenticate and receive a JWT token
- `POST /api/documents/upload` - Upload a PDF, audio, or video file
- `GET /api/documents/` - List all uploaded documents and summaries
- `DELETE /api/documents/{id}` - Delete a document
- `GET /api/media/{id}` - Stream media files for playback
- `POST /api/chat/` - Ask a question to the AI chatbot
- `GET /api/chat/history` - Retrieve chat history
