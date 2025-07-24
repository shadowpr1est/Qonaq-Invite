# src/main.py

import logging
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler
from src.core.config import settings
from src.core.exceptions import (
    LocalizedHTTPException, ErrorCode, raise_rate_limit_exceeded,
    raise_internal_server_error
)
from src.core.rate_limiter import limiter
from src.api.v1 import auth, users, sites
from src.db.db import init_db
from src.utils.logger import setup_logging

# Импортируем Celery для инициализации
from src.core.celery_app import celery_app

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
    
    # Проверяем подключение к Redis
    try:
        from redis import Redis
        redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            decode_responses=True
        )
        redis_client.ping()
        logger.info("Redis connection established")
    except Exception as e:
        logger.warning(f"Redis connection failed: {e}")
    
    # Проверяем статус Celery
    try:
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        if stats:
            logger.info("Celery workers are running")
        else:
            logger.warning("No Celery workers detected")
    except Exception as e:
        logger.warning(f"Celery inspection failed: {e}")
    
    yield
    
    logger.info("Shutting down InvitlyAI backend...")

# Create FastAPI app with proper configuration
app = FastAPI(
    title="InvitlyAI API",
    description="AI-powered speech analysis and improvement platform",
    version="1.0.0",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    lifespan=lifespan
)

# Добавляем rate limiter в состояние приложения
app.state.limiter = limiter

# Custom exception handlers for localized errors
@app.exception_handler(LocalizedHTTPException)
async def localized_http_exception_handler(request: Request, exc: LocalizedHTTPException):
    """Handle localized HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error_code": exc.error_code.value,
            "detail": exc.localized_messages,
            "status_code": exc.status_code
        }
    )

@app.exception_handler(RateLimitExceeded)
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """Handle rate limit exceeded with localized message"""
    return JSONResponse(
        status_code=429,
        content={
            "error_code": ErrorCode.RATE_LIMIT_EXCEEDED.value,
            "detail": {
                "ru": "Превышен лимит запросов",
                "en": "Rate limit exceeded",
                "kk": "Сұраулар шегі асылды"
            },
            "status_code": 429
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle all other exceptions with localized message"""
    logger.error(f"Unhandled exception: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error_code": ErrorCode.INTERNAL_SERVER_ERROR.value,
            "detail": {
                "ru": "Внутренняя ошибка сервера",
                "en": "Internal server error",
                "kk": "Сервердің ішкі қатесі"
            },
            "status_code": 500
        }
    )

@app.middleware("http")
async def add_token_refresh_header(request: Request, call_next):
    """Добавляет заголовок для обновления токена"""
    response = await call_next(request)
    
    # Добавляем заголовок для фронтенда, чтобы он знал о возможности обновления токена
    response.headers["X-Token-Refresh-Available"] = "true"
    
    return response

# CORS configuration aligned with frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.effective_allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers are now defined inline above

# API Routes - simplified and aligned with frontend expectations
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/v1/user", tags=["Users"])
app.include_router(sites.router, prefix="/api/v1/sites", tags=["Sites"])

@app.get("/")
@limiter.limit("20/minute")  # Более мягкий лимит для корневого эндпоинта
async def root(request: Request):
    """Health check endpoint"""
    return {"message": "InvitlyAI API is running", "version": "1.0.0"}

@app.get("/debug/env")
@limiter.limit("10/minute")  # Более мягкий лимит для debug эндпоинта
async def debug_env(request: Request):
    return {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect": settings.GOOGLE_REDIRECT_URI
    }

@app.get("/health")
@limiter.limit("60/minute")  # Более мягкий лимит для health check
async def health(request: Request):
    """Detailed health check"""
    try:
        # Проверяем Redis
        from redis import Redis
        redis_client = Redis(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
            password=settings.REDIS_PASSWORD if settings.REDIS_PASSWORD else None,
            decode_responses=True
        )
        redis_status = "connected" if redis_client.ping() else "disconnected"
    except Exception as e:
        redis_status = f"error: {str(e)}"
    
    try:
        # Проверяем Celery
        inspect = celery_app.control.inspect()
        stats = inspect.stats()
        celery_status = "running" if stats else "no_workers"
    except Exception as e:
        celery_status = f"error: {str(e)}"
    
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "database": "connected",
        "redis": redis_status,
        "celery": celery_status
    }
