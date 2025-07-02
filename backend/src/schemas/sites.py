from pydantic import BaseModel, Field, ConfigDict
from typing import Dict, Any, Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class EventType(str, Enum):
    """Event types matching frontend"""
    wedding = "wedding"
    birthday = "birthday"
    anniversary = "anniversary"
    graduation = "graduation"
    corporate = "corporate"
    housewarming = "housewarming"
    baby_shower = "baby_shower"
    engagement = "engagement"
    retirement = "retirement"
    holiday = "holiday"
    other = "other"


class ThemeStyle(str, Enum):
    """Theme styles matching frontend"""
    modern = "modern"
    classic = "classic"
    minimalist = "minimalist"
    elegant = "elegant"
    playful = "playful"
    rustic = "rustic"
    vintage = "vintage"
    bohemian = "bohemian"
    luxury = "luxury"
    casual = "casual"


class ColorScheme(str, Enum):
    """Color schemes matching frontend"""
    romantic_pastels = "romantic_pastels"
    vibrant_celebration = "vibrant_celebration"
    elegant_neutrals = "elegant_neutrals"
    bold_modern = "bold_modern"
    nature_inspired = "nature_inspired"
    classic_black_white = "classic_black_white"
    warm_autumn = "warm_autumn"
    cool_winter = "cool_winter"
    spring_fresh = "spring_fresh"
    summer_bright = "summer_bright"


class SiteGenerationRequest(BaseModel):
    """Request schema for site generation"""
    event_type: EventType = Field(..., description="Type of event (wedding, birthday, corporate, etc.)")
    theme: ThemeStyle = Field(..., description="Visual theme or style preference")
    content_details: Dict[str, Any] = Field(..., description="Event details and content")
    color_preferences: Optional[ColorScheme] = Field(None, description="Preferred color scheme")
    style_preferences: Optional[str] = Field(None, description="Additional style preferences")
    target_audience: Optional[str] = Field(None, description="Target audience description")


class SiteGenerationResponse(BaseModel):
    """Response schema for generated site"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    slug: str
    meta_description: Optional[str]
    event_type: EventType
    theme: ThemeStyle
    site_structure: Dict[str, Any]
    html_content: str
    content_details: Dict[str, Any]  # Event form data
    color_preferences: Optional[ColorScheme]
    style_preferences: Optional[str]
    target_audience: Optional[str]
    is_published: bool
    view_count: int
    share_count: int
    created_at: datetime
    updated_at: datetime


class SitePreview(BaseModel):
    """Schema for site preview (without full HTML content)"""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    title: str
    slug: str
    meta_description: Optional[str]
    event_type: EventType
    theme: ThemeStyle
    content_details: Dict[str, Any]  # Event form data for editing
    color_preferences: Optional[ColorScheme]
    style_preferences: Optional[str]
    target_audience: Optional[str]
    is_published: bool
    view_count: int
    share_count: int
    created_at: datetime
    updated_at: datetime


class SiteUpdate(BaseModel):
    """Schema for updating site properties"""
    title: Optional[str] = None
    meta_description: Optional[str] = None
    is_published: Optional[bool] = None
    is_public: Optional[bool] = None
    content_details: Optional[Dict[str, Any]] = None
    color_preferences: Optional[ColorScheme] = None
    style_preferences: Optional[str] = None


class SiteRegenerationRequest(BaseModel):
    """Request schema for regenerating parts of existing site"""
    sections: List[str] = Field(..., description="List of sections to regenerate")
    preserve_content: bool = Field(True, description="Whether to preserve user content")
    new_theme: Optional[ThemeStyle] = Field(None, description="New theme to apply")
    new_color_preferences: Optional[ColorScheme] = Field(None, description="New color preferences")


class SiteAnalyticsEvent(BaseModel):
    """Schema for recording analytics events"""
    event_type: str = Field(..., description="Type of event (view, share, click, etc.)")
    event_data: Optional[Dict[str, Any]] = Field(None, description="Additional event metadata")
    user_agent: Optional[str] = None
    referrer: Optional[str] = None


class SiteStatistics(BaseModel):
    """Schema for site statistics"""
    total_views: int
    unique_views: int
    total_shares: int
    top_referrers: List[Dict[str, Any]]
    view_timeline: List[Dict[str, Any]]
    geographic_data: List[Dict[str, Any]]


class UserSitesResponse(BaseModel):
    """Response schema for user's sites list"""
    sites: List[SitePreview]
    total_count: int
    published_count: int
    draft_count: int 