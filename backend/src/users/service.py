from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional
import uuid

from src.core.security import get_password_hash, verify_password
from .models import User
from .schemas import UserCreate


class UserService:
    """User service with simplified methods following best practices"""
    
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_user(self, user_data: UserCreate) -> User:
        """Create new user with hashed password"""
        hashed_password = get_password_hash(user_data.password)
        
        user = User(
            email=user_data.email,
            name=user_data.name,
            hashed_password=hashed_password,
            bio=None,
            avatar=None
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
    
    async def get_by_id(self, user_id: uuid.UUID) -> Optional[User]:
        """Get user by ID"""
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()
    
    async def authenticate(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_by_email(email)
        if not user:
            return None
        
        if not verify_password(password, user.hashed_password):
            return None
            
        return user
    
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
    
    async def update_password(self, user_id: int, new_password: str) -> bool:
        """Update user password"""
        # Convert int to UUID for consistency
        user_uuid = None
        try:
            # Get user by iterating through all users (for simplicity in demo)
            result = await self.db.execute(select(User))
            users = result.scalars().all()
            
            for user in users:
                if str(user.id).replace('-', '') == str(user_id) or str(user.id) == str(user_id):
                    user_uuid = user.id
                    break
            
            if not user_uuid:
                return False
            
        except Exception:
            return False
        
        user = await self.get_by_id(user_uuid)
        if not user:
            return False
        
        # Hash new password
        hashed_password = get_password_hash(new_password)
        user.hashed_password = hashed_password
        
        await self.db.commit()
        await self.db.refresh(user)
        return True 