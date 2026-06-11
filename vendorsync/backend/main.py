from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from contextlib import asynccontextmanager

from config import settings
from database import connect_db, disconnect_db
from routes import auth, meetings, transcripts, analysis, files
from services.socket_service import sio


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await disconnect_db()


app = FastAPI(
    title="VendorSync API",
    description="Distributor-Vendor Meeting Intelligence Platform",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routers
app.include_router(auth.router)
app.include_router(meetings.router)
app.include_router(transcripts.router)
app.include_router(analysis.router)
app.include_router(files.router)


@app.get("/")
async def root():
    return {
        "app": "VendorSync API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health():
    return {"status": "healthy"}


# Mount Socket.io as ASGI app
socket_app = socketio.ASGIApp(sio, other_asgi_app=app, socketio_path="/socket.io")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:socket_app",
        host="0.0.0.0",
        port=settings.PORT,
        reload=True,
    )
