import logging
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from src.core.config import settings

logger = logging.getLogger(__name__)

# Base для моделей
Base = declarative_base()

# Async engine для FastAPI
async_engine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Sync engine для Celery
sync_engine = create_engine(
    settings.DATABASE_URL.replace('+asyncpg', '+psycopg2'),
    echo=settings.DEBUG,
    pool_pre_ping=True,
    pool_recycle=300,
)

# Async session factory
AsyncSessionLocal = async_sessionmaker(
    async_engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Sync session factory для Celery
SyncSessionLocal = sessionmaker(
    bind=sync_engine,
    expire_on_commit=False
)

async def init_db():
    """Инициализация базы данных"""
    try:
        # Проверяем подключение
        async with async_engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: None)
        logger.info("Database connection established")
    except Exception as e:
        logger.error(f"Database initialization failed: {e}")
        raise

async def get_db() -> AsyncSession:
    """Dependency для получения async сессии базы данных"""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        except Exception as e:
            await session.rollback()
            logger.error(f"Database session error: {e}")
            raise
        finally:
            await session.close()

def get_db_session():
    """Функция для получения sync сессии базы данных (для Celery)"""
    return SyncSessionLocal()

