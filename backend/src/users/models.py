import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Text
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
        nullable=False
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
            "bio": self.bio
        } 