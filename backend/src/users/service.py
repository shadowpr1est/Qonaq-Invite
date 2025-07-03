from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional
import uuid
import secrets

from src.core.security import get_password_hash, verify_password, create_token_pair
from .models import User
from .schemas import UserCreate, GoogleOAuthCreate


class UserService:
    """User service with simplified methods following best practices"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate, send_verification: bool = True) -> User:
        """Create new user with hashed password and email verification token"""
        hashed_password = get_password_hash(user_data.password)
        verification_token = secrets.token_urlsafe(32) if send_verification else None
        
        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            bio=None,
            avatar=None,
            is_email_verified=not send_verification,  # True if not sending verification
            email_verification_token=verification_token
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
            email_verification_token=None
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
        """Verify user email with verification token"""
        result = await self.db.execute(
            select(User).where(User.email_verification_token == token)
        )
        user = result.scalar_one_or_none()
        
        if user:
            user.is_email_verified = True
            user.email_verification_token = None
            await self.db.commit()
            await self.db.refresh(user)
        
        return user
    
    async def resend_verification_email(self, email: str) -> Optional[str]:
        """Generate new verification token for user"""
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