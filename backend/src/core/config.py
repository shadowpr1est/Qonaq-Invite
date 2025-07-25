from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path
from typing import List


class Settings(BaseSettings):
    """Application settings following FastAPI best practices"""
    
    model_config = SettingsConfigDict(
        env_file=[
            os.path.join(os.getcwd(), ".env"),
            str(Path(__file__).parent.parent.parent / ".env"),
            str(Path(__file__).parent.parent / ".env"),
        ],
        extra="ignore"
    )
    
    # Application
    PROJECT_NAME: str = "Invitly API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # PostgreSQL Database (из .env)
    POSTGRES_USER: str = Field(env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(env="POSTGRES_PASSWORD") 
    POSTGRES_HOST: str = Field(default="localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(default=5432, env="POSTGRES_PORT")
    POSTGRES_DB: str = Field(env="POSTGRES_DB")
    FRONTEND_URL: str = Field(env="FRONTEND_URL")
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from .env parameters"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # Redis Configuration для Celery
    REDIS_HOST: str = Field(default="localhost", env="REDIS_HOST")
    REDIS_PORT: int = Field(default=6379, env="REDIS_PORT")
    REDIS_DB: int = Field(default=0, env="REDIS_DB")
    REDIS_PASSWORD: str = Field(default="", env="REDIS_PASSWORD")
    
    @property
    def REDIS_URL(self) -> str:
        """Construct Redis URL for Celery"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    @property
    def REDIS_URL_WITH_PASSWORD(self) -> str:
        """Construct Redis URL with password for direct connections"""
        if self.REDIS_PASSWORD:
            return f"redis://:{self.REDIS_PASSWORD}@{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/{self.REDIS_DB}"
    
    # JWT Configuration (из .env)
    JWT_ALGORITHM: str = Field(default="RS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=1440, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")  # 24 часа
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=30, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")  # 30 дней
    
    # RSA Key Paths
    PRIVATE_KEY_PATH: str = Field(
        default=str(Path(__file__).parent.parent / "keys" / "private_key.pem"),
        env="PRIVATE_KEY_PATH"
    )
    PUBLIC_KEY_PATH: str = Field(
        default=str(Path(__file__).parent.parent / "keys" / "public_key.pem"),
        env="PUBLIC_KEY_PATH"
    )
    
    # CORS - Поддержка для продакшна
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "http://98.66.137.117",
        "https://98.66.137.117",
    ]
    
    # Production domain support
    PRODUCTION_DOMAIN: str = Field(default="invitlyy.live", env="PRODUCTION_DOMAIN")
    
    @property
    def effective_allowed_origins(self) -> list[str]:
        """Get effective CORS origins including production domain"""
        origins = self.CORS_ORIGINS.copy()
        if self.PRODUCTION_DOMAIN and self.ENVIRONMENT == "production":
            origins.extend([
                f"https://{self.PRODUCTION_DOMAIN}",
                f"https://www.{self.PRODUCTION_DOMAIN}",
                f"http://{self.PRODUCTION_DOMAIN}",
                f"http://www.{self.PRODUCTION_DOMAIN}"
            ])
        return origins
    
    # Security
    BCRYPT_ROUNDS: int = Field(default=12, env="BCRYPT_ROUNDS")
    
    # OpenAI Configuration
    OPENAI_API_KEY: str = Field(env="OPENAI_API_KEY")
    
    # Google OAuth
    GOOGLE_CLIENT_ID: str = Field(env="GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET: str = Field(env="GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI: str = Field(env="GOOGLE_REDIRECT_URI")
    

    
    # 2GIS API Configuration
    TWO_GIS_API_KEY: str = Field(default_factory=lambda: os.getenv('VITE_2GIS_API_KEY', ''), env='VITE_2GIS_API_KEY')
    
    @property
    def private_key(self) -> str:
        """Load RSA private key for JWT signing"""
        if not os.path.exists(self.PRIVATE_KEY_PATH):
            raise FileNotFoundError(f"Private key not found at {self.PRIVATE_KEY_PATH}")
        with open(self.PRIVATE_KEY_PATH, "r") as f:
            return f.read()
    
    @property 
    def public_key(self) -> str:
        """Load RSA public key for JWT verification"""
        if not os.path.exists(self.PUBLIC_KEY_PATH):
            raise FileNotFoundError(f"Public key not found at {self.PUBLIC_KEY_PATH}")
        with open(self.PUBLIC_KEY_PATH, "r") as f:
            return f.read()


settings = Settings()
