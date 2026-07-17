# VendorSync 🔥

> **AI-powered Meeting Intelligence Platform for Distributor-Vendor Relationships**

Real-time transcription · Speaker identification · Pain point extraction · AI reports

---

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | 18+ |
| Python | 3.10+ |
| MongoDB | Running on `localhost:27017` |
| Chrome Browser | Required for Web Speech API |

---

## Quick Start

### 1. Clone & Configure

```bash
# Edit the root .env file:
# vendorsync/.env
GROQ_API_KEY=your_openrouter_api_key_here   # Get key at openrouter.ai (supports OpenRouter, Groq, or xAI)
```

### 2. Backend Setup

```powershell
cd vendorsync\backend
pip install -r requirements.txt
uvicorn main:socket_app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at: http://localhost:8000  
API Docs: http://localhost:8000/docs

### 3. Frontend Setup

```powershell
cd vendorsync\frontend
npm install
npm run dev
```

Frontend runs at: http://localhost:5173

---

## Features

- 🎙️ **Real-time transcription** via Web Speech API (Chrome required)
- 👥 **Multi-participant** with WebRTC video/audio
- 🤖 **AI analysis** via OpenRouter (`google/gemini-2.5-flash` by default), Groq, or xAI — pain points, sentiments, action items
- 📹 **Recording** — saves webm to MongoDB GridFS
- 📊 **5-tab reports** — Summary, Pain Points, Actions, Transcript, Recording
- 🔗 **Guest join links** — no account required for guests

---

## Tech Stack

**Frontend**: React 18 + Vite + TailwindCSS + Socket.io-client + WebRTC  
**Backend**: FastAPI + python-socketio + Motor (async MongoDB)  
**AI**: OpenRouter API (`google/gemini-2.5-flash`), Groq (`llama-3.3-70b-versatile`), or xAI (`grok-2-1212`)  
**DB**: MongoDB + GridFS for recordings

---

## Environment Variables

### `vendorsync/.env` (Backend)
```env
MONGO_URI=mongodb://localhost:27017
DB_NAME=vendorsync
JWT_SECRET=your_super_secret_key
JWT_EXPIRE_HOURS=72
GROQ_API_KEY=your_api_key_here          # Supports OpenRouter (sk-or-...), Groq, or xAI keys
FRONTEND_URL=http://localhost:5173
PORT=8000
```

### `vendorsync/frontend/.env` (Frontend)
```env
VITE_API_URL=http://localhost:8000
VITE_SOCKET_URL=http://localhost:8000
VITE_APP_NAME=VendorSync
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login → JWT |
| GET | `/api/auth/me` | Current user |
| POST | `/api/meetings` | Create meeting |
| GET | `/api/meetings` | List user's meetings |
| GET | `/api/meetings/:id` | Get meeting (public) |
| POST | `/api/meetings/:id/join` | Join as participant |
| POST | `/api/meetings/:id/end` | End & trigger AI analysis |
| GET | `/api/transcripts/:id` | Get transcript |
| GET | `/api/analysis/:id` | Get AI analysis |
| POST | `/api/analysis/:id/generate` | Generate analysis manually |
| POST | `/api/files/upload/:id` | Upload recording |
| GET | `/api/files/:fileId` | Stream recording |

---

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `join_meeting` | Client→Server | Join meeting room |
| `participant-joined` | Server→Room | Broadcast new joiner |
| `transcript_chunk` | Client→Server | Send transcript segment |
| `transcript-broadcast` | Server→Room | Broadcast segment |
| `webrtc_offer/answer/ice_candidate` | Client→Server | WebRTC signaling |
| `meeting_ended` | Server→Room | Notify all participants |

---

## Setting Up Your AI API Key

VendorSync automatically detects your AI provider based on the prefix of the API key provided in the `GROQ_API_KEY` variable:

### 1. OpenRouter (Recommended / Default)
Routes requests to OpenRouter using **`google/gemini-2.5-flash`** for fast, high-quality, and cost-effective analysis.
1. Visit [openrouter.ai](https://openrouter.ai) and sign up.
2. Go to **Keys** and create a new API Key.
3. Paste the key in `vendorsync/.env` (starts with `sk-or-`):
   ```env
   GROQ_API_KEY=sk-or-v1-your_openrouter_key_here
   ```

### 2. Groq
Routes requests to Groq using **`llama-3.3-70b-versatile`**.
1. Visit [console.groq.com](https://console.groq.com) and sign up.
2. Go to **API Keys** and create a key.
3. Paste the key in `vendorsync/.env`:
   ```env
   GROQ_API_KEY=gsk_your_groq_key_here
   ```

### 3. xAI
Routes requests to xAI using **`grok-2-1212`** (with fallback to `grok-beta`).
1. Visit [console.x.ai](https://console.x.ai) and sign up.
2. Generate an API key.
3. Paste the key in `vendorsync/.env` (starts with `xai-`):
   ```env
   GROQ_API_KEY=xai-your_xai_key_here
   ```

Without any key configured, the application automatically falls back to a built-in rule-based analysis.
