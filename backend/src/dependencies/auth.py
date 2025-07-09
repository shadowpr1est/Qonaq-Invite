from typing import Optional
from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from src.users.models import User
from src.db.db import get_db
from src.core.security import verify_token
import logging
import jwt

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
        logger.debug(f"Attempting to validate token: {token[:30]}...")
        payload = verify_token(token)
        if payload is None:
            logger.warning("Token verification failed (payload is None).")
            raise credentials_exception
            
        user_id_from_token = payload.get("sub")
        logger.debug(f"Token subject (user_id): {user_id_from_token} (type: {type(user_id_from_token)})")
        if user_id_from_token is None:
            logger.warning("Token is missing user ID ('sub' claim).")
            raise credentials_exception

        # The 'sub' from a JWT is a string. The database model expects a UUID.
        # We must cast it to a string for the query.
        user_id = str(user_id_from_token)
            
        # Query user from database
        logger.debug(f"Querying database for user_id: {user_id}")
        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        
        if user is None:
            logger.warning(f"User not found in database for ID: {user_id}")
            raise credentials_exception
            
        logger.debug(f"Successfully authenticated user: {user.email}")
        return user
        
    except (jwt.PyJWTError, ValueError) as e:
        logger.warning(f"Token validation failed with error: {e}")
        raise credentials_exception
    except Exception as e:
        logger.error(f"An unexpected error occurred during authentication: {e}", exc_info=True)
        raise credentials_exception

async def get_user_from_token(token: str, db: AsyncSession) -> Optional[User]:
    """
    Decodes a JWT token, and retrieves a user from the database.
    This is used for authenticating WebSocket connections where the token is
    passed as a query parameter.
    Returns the user object or None if authentication fails.
    """
    if not token:
        return None
    try:
        payload = verify_token(token)
        if payload is None:
            return None
        
        user_id_from_token = payload.get("sub")
        if user_id_from_token is None:
            return None

        # The 'sub' from a JWT is a string. The database model expects a UUID.
        # We must cast it to a string for the query.
        user_id = str(user_id_from_token)

        stmt = select(User).where(User.id == user_id)
        result = await db.execute(stmt)
        user = result.scalar_one_or_none()
        return user
    except Exception as e:
        logger.error(f"Token validation failed for WebSocket: {e}")
        return None


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
