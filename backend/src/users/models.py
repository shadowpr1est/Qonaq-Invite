import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from src.db.db import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(
        UUID(as_uuid=True), 
        primary_key=True, 
        default=uuid.uuid4
    )
    email = Column(
        String(255), 
        unique=True, 
        index=True, 
        nullable=False
    )
    name = Column(
        String(100),
        nullable=False
    )
    hashed_password = Column(
        String(255), 
        nullable=True  # Allow null for OAuth users
    )
    avatar = Column(
        String(500),
        nullable=True
    )
    bio = Column(
        Text,
        nullable=True
    )
    is_active = Column(
        Boolean, 
        default=True, 
        nullable=False
    )
    is_admin = Column(
        Boolean,
        default=False,
        nullable=False
    )
    # Email verification fields
    is_email_verified = Column(
        Boolean,
        default=False,
        nullable=False
    )
    email_verification_token = Column(
        String(255),
        nullable=True
    )
    # 6-digit email verification code
    email_verification_code = Column(
        String(6),
        nullable=True
    )
    email_verification_code_expires_at = Column(
        DateTime,
        nullable=True
    )
    # Password reset fields
    password_reset_code = Column(
        String(6),
        nullable=True
    )
    password_reset_code_expires_at = Column(
        DateTime,
        nullable=True
    )
    # OAuth fields
    google_id = Column(
        String(255),
        nullable=True,
        unique=True
    )
    oauth_provider = Column(
        String(50),
        nullable=True
    )
    created_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        nullable=False
    )
    updated_at = Column(
        DateTime, 
        default=datetime.utcnow, 
        onupdate=datetime.utcnow, 
        nullable=False
    )
    
    # Relationships
    sites = relationship("Site", back_populates="user", cascade="all, delete-orphan")
    
    def to_dict(self):
        """Convert model to dictionary matching frontend User interface exactly"""
        return {
            "id": str(self.id),
            "email": self.email,
            "name": self.name,
            "avatar": self.avatar,
            "bio": self.bio,
            "is_email_verified": self.is_email_verified
        } 