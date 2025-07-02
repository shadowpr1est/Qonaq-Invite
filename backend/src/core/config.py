from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
import os
from pathlib import Path


class Settings(BaseSettings):
    """Application settings following FastAPI best practices"""
    
    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore"
    )
    
    # Application
    PROJECT_NAME: str = "Invitly API"
    VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="production", env="ENVIRONMENT")
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # PostgreSQL Database (из .env)
    POSTGRES_USER: str = Field(env="POSTGRES_USER")
    POSTGRES_PASSWORD: str = Field(env="POSTGRES_PASSWORD") 
    POSTGRES_HOST: str = Field(default="localhost", env="POSTGRES_HOST")
    POSTGRES_PORT: int = Field(default=5432, env="POSTGRES_PORT")
    POSTGRES_DB: str = Field(env="POSTGRES_DB")
    
    @property
    def DATABASE_URL(self) -> str:
        """Construct database URL from .env parameters"""
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"
    
    # JWT Configuration (из .env)
    JWT_ALGORITHM: str = Field(default="RS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="JWT_ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="JWT_REFRESH_TOKEN_EXPIRE_DAYS")
    
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
    ALLOWED_ORIGINS: list[str] = Field(
        default=[
            "http://localhost:3000", 
            "http://localhost:5173", 
            "http://localhost:8080",
            "http://127.0.0.1:8080"
        ],
        env="ALLOWED_ORIGINS"
    )
    
    # Production domain support
    PRODUCTION_DOMAIN: str = Field(default="", env="PRODUCTION_DOMAIN")
    
    @property
    def effective_allowed_origins(self) -> list[str]:
        """Get effective CORS origins including production domain"""
        origins = self.ALLOWED_ORIGINS.copy()
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
