from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .routers import (
    auth_router,
    users_router,
    projects_router,
    tasks_router,
    meetings_router,
    capacity_router,
    events_router,
    chat_router,
)

app = FastAPI(
    title="NexusAI Enterprise Hub API",
    description="Backend API for NexusAI - Enterprise project management with dual AI agent architecture",
    version="1.0.0",
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(projects_router)
app.include_router(tasks_router)
app.include_router(meetings_router)
app.include_router(capacity_router)
app.include_router(events_router)
app.include_router(chat_router)


@app.get("/")
async def root():
    return {
        "message": "NexusAI Enterprise Hub API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
