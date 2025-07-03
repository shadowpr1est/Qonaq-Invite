import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator


class UserCreate(BaseModel):
    """Schema for user registration - matches frontend"""
    name: str = Field(..., min_length=2, max_length=100, description="Full name")
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")


class UserLogin(BaseModel):
    """Schema for user login - matches frontend LoginCredentials"""
    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., description="User password")
    remember: Optional[bool] = Field(default=False, description="Remember me option")


class GoogleOAuthCreate(BaseModel):
    """Schema for Google OAuth user creation"""
    email: EmailStr = Field(..., description="User email from Google")
    name: str = Field(..., description="User name from Google")
    google_id: str = Field(..., description="Google user ID")
    avatar: Optional[str] = Field(None, description="Avatar URL from Google")


class EmailVerificationRequest(BaseModel):
    """Schema for email verification request"""
    email: EmailStr = Field(..., description="User email to verify")


class EmailVerificationConfirm(BaseModel):
    """Schema for email verification confirmation"""
    token: str = Field(..., description="Email verification token")


class User(BaseModel):
    """Base User schema - matches frontend User interface exactly"""
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_email_verified: Optional[bool] = None

    class Config:
        from_attributes = True


class UserResponse(User):
    """User response schema with all safe fields"""
    pass


class UserProfile(UserResponse):
    """Complete user profile with stats"""
    stats: "UserStats"
    settings: "UserSettings"


class UserPreferences(BaseModel):
    """User preferences - matches frontend UserPreferences"""
    theme: str = Field(default="system", pattern="^(light|dark|system)$")
    language: str = Field(default="en", pattern="^(ru|en)$")
    notifications: "NotificationSettings"


class NotificationSettings(BaseModel):
    """Notification settings"""
    email: bool = True
    push: bool = True


class UserSettings(BaseModel):
    """User settings schema"""
    notifications: NotificationSettings = NotificationSettings()
    theme: str = Field(default="light", pattern="^(light|dark)$")
    language: str = Field(default="ru", pattern="^(en|ru)$")


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    name: Optional[str] = Field(None, min_length=2, max_length=100, description="Full name")
    bio: Optional[str] = Field(None, max_length=500, description="User bio")
    avatar: Optional[str] = Field(None, description="Avatar URL")


class ChangePasswordRequest(BaseModel):
    """Schema for password change request"""
    currentPassword: str = Field(..., min_length=6, description="Current password")
    newPassword: str = Field(..., min_length=8, description="New password")


class AuthResponse(BaseModel):
    """Authentication response - matches frontend expectations"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class Token(BaseModel):
    """JWT token response schema"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class ApiResponse(BaseModel):
    """Generic API response"""
    data: dict = {}
    message: str = ""
    success: bool = True


class UserStats(BaseModel):
    """User statistics schema"""
    total_sites: int = 0
    total_views: int = 0
    total_interactions: int = 0
    most_popular_theme: Optional[str] = None


class TokenData(BaseModel):
    """Token payload data"""
    user_id: Optional[str] = None
    exp: Optional[int] = None
    iat: Optional[int] = None
    jti: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request"""
    email: EmailStr = Field(..., description="User email address")


class ResetPasswordRequest(BaseModel):
    """Schema for password reset request"""
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password") 