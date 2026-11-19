import asyncio
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.database.session import SessionLocal
from backend.app.database.init_db import init_db
from backend.app.services.sync_service import SyncService
from backend.app.api.api_v1 import api_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # 1. Initialize database and seed records
    db = SessionLocal()
    try:
        init_db(db)
        # 2. Perform restart recovery & compare against last snapshot
        SyncService.perform_startup_recovery(db)
    finally:
        db.close()

    # 3. Start background Packet Tracer synchronization worker (non-blocking loop)
    sync_task = asyncio.create_task(SyncService.start_background_sync(interval_seconds=3.0))

    yield

    # 4. Graceful shutdown
    SyncService.stop_background_sync()
    sync_task.cancel()
    try:
        await sync_task
    except asyncio.CancelledError:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Enterprise Network Management & Monitoring for Smart Multi-Speciality Hospital Network",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API v1 router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "system": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
        "api_v1": settings.API_V1_STR,
        "status": "operational",
        "websocket": "/api/v1/ws"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
