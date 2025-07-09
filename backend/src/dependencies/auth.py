from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.users.models import User
from src.db.db import get_db
from src.core.security import verify_token
import logging
from uuid import UUID

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Verify and decode JWT token
        payload = verify_token(token)
        if payload is None:
            logger.warning("Invalid token provided")
            raise credentials_exception
            
        user_id = payload.get("sub")
        if user_id is None:
            logger.warning("Token missing user ID (sub)")
            raise credentials_exception
            
        # Query user from database
        stmt = select(User).where(User.id == UUID(user_id))
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.warning(f"User not found for ID: {user_id}")
            raise credentials_exception
            
        return user
        
    except ValueError:
        logger.warning("Invalid user ID format in token")
        raise credentials_exception
    except Exception as e:
        logger.error(f"Authentication error: {str(e)}")
        raise credentials_exception

async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current authenticated and active user.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="Inactive user"
        )
    return current_user

async def get_user_from_request(
    request: Request,
    db: AsyncSession = Depends(get_db)
) -> Optional[User]:
    """
    Extract user from Authorization header (optional authentication).
    Returns None if no valid token is provided.
    """
    try:
        authorization = request.headers.get("Authorization")
        if not authorization or not authorization.startswith("Bearer "):
            return None
            
        token = authorization.split(" ", 1)[1]
        return await get_current_user(token=token, db=db)
        
    except HTTPException:
        return None
    except Exception as e:
        logger.error(f"Optional auth error: {str(e)}")
        return None

async def require_admin_user(
    current_user: User = Depends(get_current_active_user)
) -> User:
    """
    Require authenticated user with admin role.
    """
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
