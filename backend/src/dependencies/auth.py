from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import uuid

from src.core.security import verify_token
from src.db.db import get_db
from src.users.service import UserService
from src.users.models import User

# OAuth2 Bearer scheme for JWT tokens
security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token
    
    Args:
        credentials: HTTP Bearer credentials containing JWT token
        db: Database session
        
    Returns:
        Current authenticated user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from credentials
        token = credentials.credentials
        
        # Verify and decode JWT token
        payload = verify_token(token)
        if payload is None:
            raise credentials_exception
            
        # Extract user ID from token subject
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
        # Check token type
        token_type = payload.get("type")
        if token_type != "access":
            raise credentials_exception
            
    except Exception:
        raise credentials_exception
    
    # Get user from database
    user_service = UserService(db)
    user = await user_service.get_by_id(uuid.UUID(user_id))
    if user is None:
        raise credentials_exception
        
    return user

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user (non-disabled)
    
    Args:
        current_user: Current authenticated user
        
    Returns:
        Current active user
        
    Raises:
        HTTPException: If user is disabled
    """
    if hasattr(current_user, 'is_active') and not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

def get_optional_current_user():
    """
    Optional authentication dependency that doesn't raise errors
    Returns None if no valid token is provided
    """
    async def _get_optional_user(
        credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
        db: AsyncSession = Depends(get_db)
    ) -> Optional[User]:
        if not credentials:
            return None
            
        try:
            token = credentials.credentials
            payload = verify_token(token)
            if payload is None:
                return None
                
            user_id = payload.get("sub")
            if user_id is None:
                return None
                
            token_type = payload.get("type")
            if token_type != "access":
                return None
                
            user_service = UserService(db)
            user = await user_service.get_by_id(uuid.UUID(user_id))
            return user
            
        except Exception:
            return None
    
    return _get_optional_user 