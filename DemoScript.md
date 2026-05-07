# Demo Support & Walkthrough

## Walkthrough Script

**1. Introduction**
"Hi! I'd like to demonstrate this AI-powered Document & Multimedia Q&A Web Application. The application allows users to securely register, upload complex media files, and query them using an advanced Retrieval-Augmented Generation (RAG) pipeline."

**2. Authentication & Upload**
"First, I'll log in. Once logged in, you can see the clean dashboard. I'll drag and drop an MP4 video file and a PDF document. The backend immediately queues these for asynchronous processing, which involves using OpenAI's Whisper API to extract text and timestamps, and generating vector embeddings with FAISS."

**3. Document List & Summary**
"You can see the list of uploaded documents here. As they finish processing, a concise AI-generated summary appears below each one."

**4. The Chat Interface & Timestamp Extraction**
"Now, let's ask a question about the video. For example: 'Where is pricing discussed?'
The AI searches the FAISS vector database, retrieves the most relevant chunks, and answers the question. Notice how it includes the exact timestamp, like `[02:15]`, in its answer."

**5. Smart Playback**
"This timestamp is clickable. When I click it, the video player jumps directly to the 2 minute and 15-second mark, instantly verifying the information."

## Key Points to Explain
- **Architecture**: Emphasize the modular FastAPI structure and React + Tailwind frontend.
- **RAG implementation**: Explain how audio/video is chunked into logical units, with the start time preserved in the metadata of the FAISS index.
- **Security & Performance**: Mention JWT authentication, and how the system is designed to handle multiple users.
- **Testing**: Highlight the pytest configuration and the CI/CD pipeline set up via GitHub Actions.

## Generating Live Demo URL
To generate a live demo URL quickly:
1. Run `docker-compose up -d` on an EC2 instance.
2. Setup Cloudflare Tunnels (or ngrok) to expose the local ports securely without configuring complex firewall rules.
   - Example: `ngrok http 5173`
3. Share the generated HTTPS link.
