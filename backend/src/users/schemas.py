import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field, model_validator


class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    name: str


class UserCreate(UserBase):
    """Schema for user creation"""
    password: str = Field(..., min_length=8, description="User password")


class UserLogin(BaseModel):
    """Schema for user login"""
    email: EmailStr = Field(..., description="User email")
    password: str = Field(..., description="User password")


class UserResponse(UserBase):
    """Schema for user response"""
    id: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_email_verified: bool


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
    """Schema for email verification confirmation with token"""
    token: str = Field(..., description="Email verification token")


class EmailVerificationCodeRequest(BaseModel):
    """Schema for requesting 6-digit email verification code"""
    email: EmailStr = Field(..., description="User email to send code to")


class EmailVerificationCodeConfirm(BaseModel):
    """Schema for confirming 6-digit email verification code"""
    email: EmailStr = Field(..., description="User email")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")


class PasswordResetCodeRequest(BaseModel):
    """Schema for requesting 6-digit password reset code"""
    email: EmailStr = Field(..., description="User email to send reset code to")


class PasswordResetCodeConfirm(BaseModel):
    """Schema for confirming password reset with 6-digit code"""
    email: EmailStr = Field(..., description="User email")
    code: str = Field(..., min_length=6, max_length=6, description="6-digit reset code")
    new_password: str = Field(..., min_length=8, description="New password")


class AuthResponse(BaseModel):
    """Schema for authentication response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class TokenRefreshRequest(BaseModel):
    """Schema for token refresh request"""
    refresh_token: str = Field(..., description="Refresh token")


class UserUpdate(BaseModel):
    """Schema for updating user profile"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    bio: Optional[str] = Field(None, max_length=500)
    avatar: Optional[str] = Field(None, max_length=500)


class ChangePasswordRequest(BaseModel):
    """Schema for changing password"""
    currentPassword: str = Field(..., description="Current password")
    newPassword: str = Field(..., min_length=8, description="New password")


class ApiResponse(BaseModel):
    """Generic API response schema"""
    data: dict = Field(default_factory=dict)
    message: str = Field(default="Success")
    success: bool = Field(default=True)


class UserStats(BaseModel):
    """User statistics schema"""
    total_analyses: int
    completed_analyses: int
    average_score: Optional[float] = None
    total_practice_time: int
    current_streak: int
    best_streak: int
    improvement_rate: Optional[float] = None
    join_date: str


class UserRead(BaseModel):
    """Schema for reading user data"""
    id: str
    email: str
    name: str
    avatar: Optional[str] = None
    bio: Optional[str] = None
    is_active: bool
    is_email_verified: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Legacy schemas for backward compatibility
class ForgotPasswordRequest(BaseModel):
    """Schema for forgot password request (legacy)"""
    email: EmailStr = Field(..., description="User email address")


class ResetPasswordRequest(BaseModel):
    """Schema for password reset request (legacy)"""
    token: str = Field(..., description="Reset token")
    new_password: str = Field(..., min_length=8, description="New password") 