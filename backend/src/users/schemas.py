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


class User(BaseModel):
    """Base User schema - matches frontend User interface exactly"""
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None

    class Config:
        from_attributes = True


class UserResponse(User):
    """Schema for user data response - inherits from User to ensure consistency"""
    pass


class UserProfile(User):
    """Extended user profile - matches frontend UserProfile"""
    avatar: Optional[str] = None
    bio: Optional[str] = None
    preferences: "UserPreferences"


class UserPreferences(BaseModel):
    """User preferences - matches frontend UserPreferences"""
    theme: str = Field(default="system", pattern="^(light|dark|system)$")
    language: str = Field(default="en", pattern="^(ru|en)$")
    notifications: "NotificationSettings"


class NotificationSettings(BaseModel):
    """Notification settings"""
    email: bool = True
    push: bool = True


class UserUpdate(BaseModel):
    """Schema for user update"""
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    avatar: Optional[str] = None
    bio: Optional[str] = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    """Schema for password change"""
    currentPassword: str = Field(..., description="Current password")
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
    """Standard API response wrapper - matches frontend ApiResponse"""
    data: dict
    message: str
    success: bool = True


class UserStats(BaseModel):
    """Schema for user statistics"""
    total_analyses: int = Field(..., ge=0, description="Total number of analyses")
    completed_analyses: int = Field(..., ge=0, description="Number of completed analyses")
    average_score: Optional[float] = Field(None, ge=0, le=100, description="Average overall score")
    total_practice_time: int = Field(..., ge=0, description="Total practice time in minutes")
    current_streak: int = Field(..., ge=0, description="Current practice streak in days")
    best_streak: int = Field(..., ge=0, description="Best practice streak in days")
    improvement_rate: Optional[float] = Field(None, description="Improvement rate percentage")
    join_date: datetime = Field(..., description="User registration date")


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
    token: str = Field(..., description="Password reset token")
    new_password: str = Field(..., min_length=8, description="New password") 