from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
import uuid
import secrets
import random
from datetime import datetime, timedelta

from src.core.security import get_password_hash, verify_password, create_token_pair
from .models import User
from .schemas import UserCreate, GoogleOAuthCreate


class UserService:
    """User service with simplified methods following best practices"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    def _generate_6_digit_code(self) -> str:
        """Generate a 6-digit verification code"""
        return f"{random.randint(100000, 999999):06d}"
    
    async def create_user(self, user_data: UserCreate, send_verification: bool = True) -> User:
        """Create new user with hashed password and email verification token"""
        hashed_password = get_password_hash(user_data.password)
        verification_token = secrets.token_urlsafe(32) if send_verification else None
        
        # Generate 6-digit code with 15-minute expiration
        verification_code = self._generate_6_digit_code() if send_verification else None
        code_expires_at = datetime.utcnow() + timedelta(minutes=15) if send_verification else None
        
        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            bio=None,
            avatar=None,
            is_email_verified=not send_verification,  # True if not sending verification
            email_verification_token=verification_token,
            email_verification_code=verification_code,
            email_verification_code_expires_at=code_expires_at
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def create_oauth_user(self, oauth_data: GoogleOAuthCreate) -> User:
        """Create new user from OAuth provider"""
        user = User(
            email=oauth_data.email,
            name=oauth_data.name,
            google_id=oauth_data.google_id,
            oauth_provider="google",
            avatar=oauth_data.avatar,
            bio=None,
            hashed_password=None,  # No password for OAuth users
            is_email_verified=True,  # Google emails are pre-verified
            email_verification_token=None,
            email_verification_code=None,
            email_verification_code_expires_at=None
        )
        
        self.db.add(user)
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def get_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        result = await self.db.execute(
            select(User).where(User.email == email)
        )
        return result.scalar_one_or_none()
    
    async def get_by_google_id(self, google_id: str) -> Optional[User]:
        """Get user by Google ID"""
        result = await self.db.execute(
            select(User).where(User.google_id == google_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_by_email(email)
        if not user or not user.hashed_password:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
            
        return user
    
    async def verify_email(self, token: str) -> Optional[User]:
        """Verify user email with verification token (legacy method)"""
        result = await self.db.execute(
            select(User).where(User.email_verification_token == token)
        )
        user = result.scalar_one_or_none()
        
        if user:
            user.is_email_verified = True
            user.email_verification_token = None
            user.email_verification_code = None
            user.email_verification_code_expires_at = None
            await self.db.commit()
            await self.db.refresh(user)
        
        return user
    
    async def verify_email_with_code(self, email: str, code: str) -> Optional[User]:
        """Verify user email with 6-digit code"""
        user = await self.get_by_email(email)
        if not user:
            return None
        
        # Check if code is valid and not expired
        if (user.email_verification_code != code or 
            not user.email_verification_code_expires_at or
            datetime.utcnow() > user.email_verification_code_expires_at):
            return None
        
        # Mark email as verified and clear verification fields
        user.is_email_verified = True
        user.email_verification_token = None
        user.email_verification_code = None
        user.email_verification_code_expires_at = None
        await self.db.commit()
        await self.db.refresh(user)
        
        return user
    
    async def generate_email_verification_code(self, email: str) -> Optional[str]:
        """Generate new 6-digit verification code for user"""
        user = await self.get_by_email(email)
        if not user or user.is_email_verified:
            return None
        
        new_code = self._generate_6_digit_code()
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        user.email_verification_code = new_code
        user.email_verification_code_expires_at = expires_at
        await self.db.commit()
        
        return new_code
    
    async def generate_password_reset_code(self, email: str) -> Optional[str]:
        """Generate 6-digit password reset code"""
        user = await self.get_by_email(email)
        if not user:
            return None
        
        reset_code = self._generate_6_digit_code()
        expires_at = datetime.utcnow() + timedelta(minutes=15)
        
        user.password_reset_code = reset_code
        user.password_reset_code_expires_at = expires_at
        await self.db.commit()
        
        return reset_code
    
    async def verify_password_reset_code(self, email: str, code: str, new_password: str) -> bool:
        """Verify password reset code and update password"""
        user = await self.get_by_email(email)
        if not user:
            return False
        
        # Check if code is valid and not expired
        if (user.password_reset_code != code or 
            not user.password_reset_code_expires_at or
            datetime.utcnow() > user.password_reset_code_expires_at):
            return False
        
        # Update password and clear reset fields
        user.hashed_password = get_password_hash(new_password)
        user.password_reset_code = None
        user.password_reset_code_expires_at = None
        await self.db.commit()
        
        return True
    
    async def resend_verification_email(self, email: str) -> Optional[str]:
        """Generate new verification token for user (legacy method)"""
        user = await self.get_by_email(email)
        if not user or user.is_email_verified:
            return None
        
        new_token = secrets.token_urlsafe(32)
        user.email_verification_token = new_token
        await self.db.commit()
        
        return new_token
    
    async def update_password(self, user_id: uuid.UUID, new_password: str) -> bool:
        """Update user password"""
        try:
            hashed_password = get_password_hash(new_password)
            await self.db.execute(
                update(User)
                .where(User.id == user_id)
                .values(hashed_password=hashed_password)
            )
            await self.db.commit()
            return True
        except Exception:
            await self.db.rollback()
            return False
    
    async def update_user(self, user_id: uuid.UUID, **kwargs) -> Optional[User]:
        """Update user fields"""
        user = await self.get_by_id(user_id)
        if not user:
            return None
        
        for key, value in kwargs.items():
            if hasattr(user, key):
                setattr(user, key, value)
        
        await self.db.commit()
        await self.db.refresh(user)
        return user
    
    async def delete_user(self, user_id: uuid.UUID) -> bool:
        """Delete user by ID"""
        user = await self.get_by_id(user_id)
        
        if not user:
            return False
        
        await self.db.delete(user)
        await self.db.commit()
        return True 