from sqlalchemy import Column, String, Text, DateTime, ForeignKey, JSON, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid

from ..db.db import Base


class Site(Base):
    """Generated site model"""
    __tablename__ = "sites"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Site metadata
    title = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)  # URL-friendly identifier
    meta_description = Column(Text)
    
    # Event details
    event_type = Column(String(50), nullable=False)  # wedding, birthday, etc.
    theme = Column(String(100), nullable=False)
    
    # Generated content
    site_structure = Column(JSON, nullable=False)  # Complete site structure from OpenAI
    html_content = Column(Text, nullable=False)     # Generated HTML
    content_details = Column(JSON, nullable=False)  # Event form data: title, date, venue, etc.
    
    # Configuration
    color_preferences = Column(String(255))
    style_preferences = Column(Text)
    target_audience = Column(String(255))
    
    # Status and visibility
    is_published = Column(Boolean, default=False)
    is_public = Column(Boolean, default=True)
    
    # Analytics
    view_count = Column(Integer, default=0)
    share_count = Column(Integer, default=0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    published_at = Column(DateTime, nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="sites")
    analytics = relationship("SiteAnalytics", back_populates="site", cascade="all, delete-orphan")
    rsvps = relationship("RSVP", back_populates="site", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Site(id={self.id}, title='{self.title}', user_id={self.user_id})>"


class SiteAnalytics(Base):
    """Site analytics and tracking"""
    __tablename__ = "site_analytics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    
    # Event tracking
    event_type = Column(String(50), nullable=False)  # view, share, click, etc.
    event_data = Column(JSON)  # Additional event metadata
    
    # Visitor info (anonymized)
    user_agent = Column(Text)
    ip_address = Column(String(45))  # Support IPv6
    referrer = Column(Text)
    
    # Geographic data (optional)
    country = Column(String(2))  # ISO country code
    city = Column(String(100))
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    site = relationship("Site", back_populates="analytics")
    
    def __repr__(self):
        return f"<SiteAnalytics(id={self.id}, site_id={self.site_id}, event='{self.event_type}')>" 


class RSVP(Base):
    """RSVP responses for events"""
    __tablename__ = "rsvp"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id = Column(UUID(as_uuid=True), ForeignKey("sites.id", ondelete="CASCADE"), nullable=False)
    guest_name = Column(String(255), nullable=True)
    guest_email = Column(String(255), nullable=True)
    response = Column(String(50), nullable=False)  # attending, not_attending, maybe, etc.
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    site = relationship("Site", back_populates="rsvps") 