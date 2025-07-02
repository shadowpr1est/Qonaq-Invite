import uuid
from fastapi import Depends, Request
from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi_users.db import SQLAlchemyUserDatabase
from src.users.models import User
from src.db.db import get_async_session
from sqlalchemy.ext.asyncio import AsyncSession
from src.core.config import settings

async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = str(settings.JWT_PRIVATE_KEY_PATH)
    verification_token_secret = str(settings.JWT_PRIVATE_KEY_PATH)

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db) 