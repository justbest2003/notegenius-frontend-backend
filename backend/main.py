import sys
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import settings
from database.mongodb import mongodb
from middleware.firebase_auth import init_firebase
from routers import notes, users, ai


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events"""
    # Startup
    print("Starting NoteGenius Backend...")
    init_firebase()
    await mongodb.connect()
    print("Server is ready!")
    print(f"API Docs: http://localhost:{settings.PORT}/docs")
    yield
    # Shutdown
    await mongodb.close()
    print("👋 Server stopped")


app = FastAPI(
    title="NoteGenius API",
    description="API สำหรับแอปจดบันทึกอัจฉริยะด้วย AI",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(notes.router)
app.include_router(users.router)
app.include_router(ai.router)


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "app": "NoteGenius API",
        "version": "1.0.0",
        "status": "running",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    """Health check with DB status"""
    db_connected = mongodb.db is not None
    return {
        "status": "healthy" if db_connected else "degraded",
        "database": "connected" if db_connected else "disconnected",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
    )
