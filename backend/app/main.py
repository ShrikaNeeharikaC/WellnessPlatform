from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.database.session import engine, Base

# Register all models with SQLAlchemy before create_all
import app.models  # noqa: F401

from app.api.v1.router import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Creates refresh_tokens table (not in SQL migration files).
    # All other tables already exist from 01_schema.sql — create_all is safe to run.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Wellness Platform REST API",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health", tags=["Health"])
def health_check():
    return {"status": "ok", "version": settings.APP_VERSION, "app": settings.APP_NAME}
