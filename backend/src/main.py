# src/main.py

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from src.core.config import settings
from src.core.exceptions import setup_exception_handlers
from src.api.v1 import auth, users, sites
from src.db.db import init_db
from src.utils.logger import setup_logging

# Настраиваем логирование при старте
setup_logging()

# Получаем логгер после настройки
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    logger.info("Starting InvitlyAI backend...")
    
    # Initialize database
    await init_db()
    logger.info("Database initialized")
    
    yield
    
    logger.info("Shutting down FluentAI backend...")

# Create FastAPI app with proper configuration
app = FastAPI(
    title="InvitlyAI API",
    description="AI-powered speech analysis and improvement platform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# CORS configuration aligned with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.effective_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
setup_exception_handlers(app)

# API Routes - simplified and aligned with frontend expectations
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/user", tags=["Users"])
app.include_router(sites.router, prefix="/sites", tags=["Sites"])

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "InvitlyAI API is running", "version": "1.0.0"}
@app.get("/debug/env")
async def debug_env():
    return {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect": settings.GOOGLE_REDIRECT_URI
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected"
    }
