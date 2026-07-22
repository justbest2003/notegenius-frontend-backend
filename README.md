# NoteGenius (AI-Powered Smart Notes)

A full-stack intelligent note-taking web application powered by AI (Google Gemini) with OCR, voice-to-text, and auto-tagging capabilities. Built with React + FastAPI, authenticated via Firebase, and backed by MongoDB Atlas.

## Tech Stack

### Frontend
- **Framework:** React 19 + Vite 8
- **Styling:** Vanilla CSS
- **Routing:** React Router v7
- **HTTP Client:** Axios
- **Icons:** React Icons
- **Auth:** Firebase (Google Auth)

### Backend
- **Framework:** FastAPI + Uvicorn
- **Database:** MongoDB Atlas (Motor async driver)
- **Auth:** Firebase Admin SDK
- **AI/LLM:** Google Gemini API (`gemini-flash-lite-latest`) for summarization, auto-tagging, and OCR
- **Voice:** OpenAI Whisper (server-side) + Web Speech API (client-side)
- **Image Processing:** Pillow

## Features
- Create, edit, and manage notes with a rich editor
- AI-powered text summarization via Google Gemini
- Automatic tag generation from note content
- Image-to-text extraction (OCR) using Gemini Vision
- Voice-to-text input via Web Speech API and server-side Whisper
- Google Account Authentication
- Dashboard with usage statistics
- Responsive sidebar navigation

---

## Project Structure

```
NoteGenius/
├── frontend/                # React + Vite
│   ├── src/
│   │   ├── components/      # Sidebar, NoteCard, AISummaryPanel, ImageOCR, VoiceRecorder
│   │   ├── contexts/        # AuthContext (Firebase)
│   │   ├── pages/           # Login, Dashboard, Notes, NoteEditor
│   │   ├── services/        # API service layer
│   │   └── config/          # Firebase config
│   └── .env                 # Firebase client keys (not committed)
│
├── backend/                 # FastAPI
│   ├── routers/             # notes, users, ai endpoints
│   ├── services/            # llm_service, ocr_service, voice_service
│   ├── models/              # Pydantic models (note, user)
│   ├── database/            # MongoDB connection (Motor)
│   ├── middleware/          # Firebase auth middleware
│   ├── config.py            # Pydantic settings from .env
│   ├── main.py              # App entrypoint
│   └── .env                 # Secrets (not committed)
│
└── README.md
```

---

## Local Development Setup

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- Firebase project with Google Auth enabled
- Google Gemini API key

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # Windows PowerShell
# source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in:
#   MONGODB_URI=your_mongodb_connection_string
#   GEMINI_API_KEY=your_gemini_api_key
#   FIREBASE_CREDENTIALS_PATH=firebase-credentials.json

# Run the server
python main.py
```

Backend runs at **http://localhost:8000** — API docs at **http://localhost:8000/docs**

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your Firebase config:
#   VITE_FIREBASE_API_KEY=...
#   VITE_FIREBASE_AUTH_DOMAIN=...
#   VITE_FIREBASE_PROJECT_ID=...
#   VITE_API_URL=http://localhost:8000

# Run the dev server
npm run dev
```

Frontend runs at **http://localhost:5173**

> **Note:** Both backend and frontend must be running simultaneously for the app to work.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `MONGODB_DB_NAME` | Database name (default: `notegenius`) |
| `FIREBASE_CREDENTIALS_PATH` | Path to Firebase Admin SDK JSON |
| `GEMINI_API_KEY` | Google Gemini API key |
| `HOST` | Server host (default: `0.0.0.0`) |
| `PORT` | Server port (default: `8000`) |
| `DEBUG` | Enable hot-reload (default: `true`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |
| `VITE_API_URL` | Backend API URL (default: `http://localhost:8000`) |

---

## Development Approach
- **React + Vite:** Fast HMR and lightweight bundling for rapid frontend development.
- **FastAPI:** High-performance async Python framework with automatic OpenAPI documentation.
- **Motor (async MongoDB):** Non-blocking database operations that match FastAPI's async architecture.
- **Gemini Vision for OCR:** Leverages multimodal AI to extract text from images without traditional OCR libraries.
- **Dual Voice Input:** Client-side Web Speech API for real-time dictation, server-side Whisper for uploaded audio files.
- **Separation of Concerns:** Frontend (UI/routing/state) ↔ Backend (API/business logic/AI services) ↔ Database, with Firebase handling authentication across both layers.
