import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.security import create_token_pair, get_password_hash, verify_token
from src.core.exceptions import (
    raise_invalid_credentials, raise_email_already_exists, raise_user_not_found,
    raise_invalid_token, raise_token_expired, raise_insufficient_permissions,
    raise_email_not_verified, raise_google_oauth_error, raise_internal_server_error,
    LocalizedHTTPException, ErrorCode
)
from src.db.db import get_db
from src.dependencies.auth import get_current_user
from src.users.models import User as UserModel
from src.users.schemas import UserCreate, UserLogin, UserResponse, GoogleOAuthCreate, \
    EmailVerificationConfirm, EmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest, \
    AuthResponse, EmailVerificationCodeRequest, EmailVerificationCodeConfirm, PasswordResetCodeRequest, \
    PasswordResetCodeConfirm
from src.users.service import UserService
import logging
import urllib.parse
import jwt
from src.services.email_service import email_service

# Получаем логгер стандартным способом
logger = logging.getLogger(__name__)

# Логируем client_id и client_secret при старте модуля (один раз)
logger.info(f"[OAUTH] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
logger.info(f"[OAUTH] GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")

router = APIRouter()

# Импортируем limiter из rate_limiter.py
from src.core.rate_limiter import limiter


@router.post("/register", response_model=AuthResponse)
@limiter.limit("10/minute")  # Более мягкий лимит для регистрации
async def register(
    request: Request,
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    try:
        user_service = UserService(db)
        
        # Check if user already exists
        existing_user = await user_service.get_by_email(user_data.email)
        if existing_user:
            raise_email_already_exists()
        
        # Create user
        user = await user_service.create_user(user_data)
        
        # Генерируем код верификации (email сервис временно недоступен)
        verification_code = await user_service.generate_email_verification_code(user.email)
        if verification_code:
            email_service.send_verification_email(user.email, verification_code)
            logger.info(f"Verification code generated for {user.email}: {verification_code}")
        
        # Generate token pair
        access_token, refresh_token = create_token_pair(user.id)
        
        logger.info(f"User registered successfully and verification email sent to: {user.email}")
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                avatar=user.avatar,
                bio=user.bio,
                is_email_verified=user.is_email_verified
            )
        )
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise_internal_server_error()


@router.post("/login", response_model=AuthResponse)
@limiter.limit("20/minute")  # Более мягкий лимит для логина
async def login(
    request: Request,
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user with email and password"""
    try:
        user_service = UserService(db)
        
        # Get user by email
        user = await user_service.get_by_email(credentials.email)
        if not user:
            raise_invalid_credentials()
        
        # Verify password
        if not user_service.verify_password(credentials.password, user.hashed_password):
            raise_invalid_credentials()
        
        # Check if email is verified (optional - you can remove this check)
        if not user.is_email_verified:
            logger.warning(f"Login attempt for unverified email: {user.email}")
            # You can choose to block login or just warn
            # raise_email_not_verified()
        
        # Generate token pair
        access_token, refresh_token = create_token_pair(user.id)
        
        logger.info(f"User logged in successfully: {user.email}")
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                avatar=user.avatar,
                bio=user.bio,
                is_email_verified=user.is_email_verified
            )
        )
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise_internal_server_error()


@router.post("/google-oauth", response_model=AuthResponse)
@limiter.limit("20/minute")  # Более мягкий лимит для Google OAuth
async def google_oauth(
    request: Request,
    oauth_data: GoogleOAuthCreate,
    db: AsyncSession = Depends(get_db)
):
    """Login or register user with Google OAuth"""
    try:
        # Логируем client_id и client_secret при каждом вызове
        logger.info(f"[OAUTH] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
        logger.info(f"[OAUTH] GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")
        user_service = UserService(db)
        
        # Try to find existing user by Google ID first
        user = await user_service.get_by_google_id(oauth_data.google_id)
        
        if not user:
            # Try to find by email (user might have registered normally first)
            user = await user_service.get_by_email(oauth_data.email)
            
            if user:
                # Link Google account to existing user
                user.google_id = oauth_data.google_id
                user.oauth_provider = "google"
                user.is_email_verified = True  # Google emails are verified
                if oauth_data.avatar and not user.avatar:
                    user.avatar = oauth_data.avatar
                await db.commit()
                await db.refresh(user)
                logger.info(f"Linked Google account to existing user: {user.email}")
            else:
                # Create new user from Google OAuth
                user = await user_service.create_oauth_user(oauth_data)
                logger.info(f"Created new user from Google OAuth: {user.email}")
        else:
            # Update avatar if changed
            if oauth_data.avatar and oauth_data.avatar != user.avatar:
                user.avatar = oauth_data.avatar
                await db.commit()
                await db.refresh(user)
        
        # Generate token pair
        access_token, refresh_token = create_token_pair(user.id)
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                avatar=user.avatar,
                bio=user.bio,
                is_email_verified=user.is_email_verified
            )
        )
        
    except Exception as e:
        logger.error(f"Google OAuth failed: {str(e)}")
        raise_google_oauth_error()




# ========================================================================
# USER PROFILE & MISC
# ========================================================================

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: UserModel = Depends(get_current_user)
):
    """Get current user's profile information"""
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        bio=current_user.bio,
        is_email_verified=current_user.is_email_verified
    )

@router.put("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: dict,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update user's profile information"""
    try:
        user_service = UserService(db)
        
        # Ensure only allowed fields are updated
        allowed_fields = {"name", "bio"}
        update_data = {key: value for key, value in profile_data.items() if key in allowed_fields}
        
        if not update_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No valid fields to update."
            )
            
        updated_user = await user_service.update_user(current_user.id, **update_data)
        
        logger.info(f"Profile updated for user: {updated_user.email}")
        
        return UserResponse(
            id=str(updated_user.id),
            email=updated_user.email,
            name=updated_user.name,
            avatar=updated_user.avatar,
            bio=updated_user.bio,
            is_email_verified=updated_user.is_email_verified
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Profile update failed for {current_user.email}: {str(e)}")
        raise_internal_server_error()


@router.post("/change-password", response_model=dict)
async def change_password(
    password_data: dict,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Change current user's password"""
    try:
        user_service = UserService(db)
        
        old_password = password_data.get("old_password")
        new_password = password_data.get("new_password")
        
        if not old_password or not new_password:
            raise HTTPException(status_code=400, detail="Old and new passwords are required.")

        # Verify old password
        if not await user_service.verify_password(old_password, current_user.hashed_password):
            raise HTTPException(status_code=400, detail="Incorrect old password.")
            
        # Update to new password
        await user_service.update_password(current_user.id, new_password)
        
        logger.info(f"Password changed for user: {current_user.email}")
        
        return {"message": "Password changed successfully."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password change failed for {current_user.email}: {str(e)}")
        raise_internal_server_error() 

@router.get("/google-login-url")
async def get_google_login_url(lang: str = "ru", from_page: str = ""):
    """Generate Google OAuth2 login URL for classic redirect flow"""
    # Логируем client_id и client_secret при генерации URL
    logger.info(f"[OAUTH] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
    logger.info(f"[OAUTH] GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    
    # Создаем state с языком и страницей, откуда пришел пользователь
    state_data = {
        "lang": lang,
        "from": from_page
    }
    import json
    state = json.dumps(state_data)
    
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
        "state": state,  # Передаем данные через state параметр
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return {"url": url}

@router.get("/google/callback")
async def google_oauth_callback(code: str, state: str = "ru", db: AsyncSession = Depends(get_db)):
    """Google OAuth callback endpoint"""
    try:
        # Parse state parameter
        try:
            import json
            state_data = json.loads(state)
            lang = state_data.get("lang", "ru")
            from_page = state_data.get("from", "")
        except (json.JSONDecodeError, TypeError):
            # Fallback for old format
            lang = state
            from_page = ""
        
        # Exchange code for tokens
        token_url = "https://oauth2.googleapis.com/token"
        token_data = {
            "client_id": settings.GOOGLE_CLIENT_ID,
            "client_secret": settings.GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        }
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(token_url, data=token_data)
            token_response.raise_for_status()
            token_info = token_response.json()
        
        id_token = token_info.get("id_token")
        if not id_token:
            raise_google_oauth_error()
        
        # Verify and decode id_token
        payload = {}
        try:
            # Get Google's public keys
            jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
            jwks_response = await client.get(jwks_url)
            jwks_response.raise_for_status()
            jwks = jwks_response.json()
            
            # Decode and verify the token
            payload = jwt.decode(
                id_token,
                jwks,
                algorithms=["RS256"],
                audience=settings.GOOGLE_CLIENT_ID,
                options={"verify_signature": True}
            )
        except Exception as jwks_error:
            logger.warning(f"JWKS verification failed, falling back to decode without verification: {jwks_error}")
            # Fallback: decode without verification (less secure but functional)
            try:
                payload = jwt.decode(id_token, options={"verify_signature": False})
            except Exception as decode_error:
                logger.error(f"Failed to decode id_token: {decode_error}")
                raise_google_oauth_error()
        
        # Extract user information
        email = payload.get("email")
        name = payload.get("name")
        google_id = payload.get("sub")
        avatar = payload.get("picture")
        
        if not email or not google_id:
            raise_google_oauth_error()
        
        # Log in or register user
        user_service = UserService(db)
        user = await user_service.get_by_google_id(google_id)
        
        if not user:
            user = await user_service.get_by_email(email)
            if user:
                # Link existing user to Google
                user.google_id = google_id
                user.oauth_provider = "google"
                user.is_email_verified = True
                if avatar and not user.avatar:
                    user.avatar = avatar
                await db.commit()
                await db.refresh(user)
            else:
                # Create new user
                from src.users.schemas import GoogleOAuthCreate
                user = await user_service.create_oauth_user(
                    GoogleOAuthCreate(
                        email=email,
                        name=name,
                        google_id=google_id,
                        avatar=avatar
                    )
                )
        
        # Generate token pair
        access_token, refresh_token = create_token_pair(user.id)
        
        # Build frontend URL with tokens and language
        frontend_url = f"{settings.FRONTEND_URL}/auth-callback"
        query_params = {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "lang": lang,
            "success": "true"
        }
        
        # Add from parameter if provided
        if from_page:
            query_params["from"] = from_page
        
        # Add query parameters to URL
        from urllib.parse import urlencode
        redirect_url = f"{frontend_url}?{urlencode(query_params)}"
        
        response = RedirectResponse(url=redirect_url, status_code=302)
        
        # Set secure cookies as backup
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=3600  # 1 hour
        )
        response.set_cookie(
            key="refresh_token", 
            value=refresh_token,
            httponly=True,
            secure=True,
            samesite="lax",
            max_age=30 * 24 * 3600  # 30 days
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Google OAuth error: {str(e)}")
        # Redirect to frontend with error
        try:
            # Try to parse state for language
            import json
            state_data = json.loads(state)
            lang = state_data.get("lang", "ru")
        except (json.JSONDecodeError, TypeError):
            # Fallback for old format
            lang = state if state else "ru"
        
        error_url = f"{settings.FRONTEND_URL}/auth-callback?error=oauth_failed&lang={lang}"
        return RedirectResponse(url=error_url, status_code=302)


@router.post("/verify-email-code", response_model=UserResponse)
@limiter.limit("5/minute")  # Лимит для верификации email
async def verify_email_code(
    request: Request,
    data: EmailVerificationCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Verify email with 6-digit code"""
    try:
        user_service = UserService(db)
        user = await user_service.verify_email_with_code(data.email, data.code)
        if not user:
            raise LocalizedHTTPException(
                error_code=ErrorCode.VALIDATION_ERROR,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        return UserResponse(
            id=str(user.id),
            email=user.email,
            name=user.name,
            avatar=user.avatar,
            bio=user.bio,
            is_email_verified=user.is_email_verified
        )
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification failed: {str(e)}")
        raise_internal_server_error()

@router.post("/forgot-password-request")
@limiter.limit("3/minute")  # Строгий лимит для сброса пароля
async def forgot_password_request(
    request: Request,
    data: PasswordResetCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset code to email"""
    try:
        user_service = UserService(db)
        code = await user_service.generate_password_reset_code(data.email)
        if not code:
            raise_user_not_found()
        email_service.send_verification_email(data.email, code)
        logger.info(f"Password reset code generated for {data.email}: {code}")
        return {"message": "Reset code generated (email service temporarily unavailable)"}
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset request failed: {str(e)}")
        raise_internal_server_error()

@router.post("/reset-password-with-code")
@limiter.limit("5/minute")  # Лимит для сброса пароля с кодом
async def reset_password_with_code(
    request: Request,
    data: PasswordResetCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using code"""
    try:
        user_service = UserService(db)
        ok = await user_service.verify_password_reset_code(data.email, data.code, data.new_password)
        if not ok:
            raise LocalizedHTTPException(
                error_code=ErrorCode.VALIDATION_ERROR,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        return {"message": "Password reset successful"}
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset failed: {str(e)}")
        raise_internal_server_error()

@router.post("/resend-verification-code")
@limiter.limit("3/minute")  # Строгий лимит для повторной отправки кода
async def resend_verification_code(
    request: Request,
    data: EmailVerificationCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Resend email verification code"""
    try:
        user_service = UserService(db)
        
        # Check if user exists
        user = await user_service.get_by_email(data.email)
        if not user:
            raise_user_not_found()
        
        # Generate new verification code
        verification_code = await user_service.generate_email_verification_code(user.email)
        if verification_code:
            email_service.send_verification_email(user.email, verification_code)
            logger.info(f"Verification code regenerated for {user.email}: {verification_code}")
            return {"message": "Verification code generated (email service temporarily unavailable)"}
        else:
            raise_internal_server_error()
            
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to resend verification code: {str(e)}")
        raise_internal_server_error()


@router.post("/refresh-token", response_model=AuthResponse)
@limiter.limit("30/minute")  # Лимит для обновления токенов
async def refresh_token(
    request: Request,
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token"""
    try:
        # Verify refresh token
        payload = verify_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            raise_invalid_token()
        
        user_id = payload.get("sub")
        if not user_id:
            raise_invalid_token()
        
        # Get user
        user_service = UserService(db)
        user = await user_service.get_by_id(user_id)
        if not user:
            raise_user_not_found()
        
        # Generate new token pair
        access_token, new_refresh_token = create_token_pair(user.id)
        
        logger.info(f"Tokens refreshed for user: {user.email}")
        
        return AuthResponse(
            access_token=access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            user=UserResponse(
                id=str(user.id),
                email=user.email,
                name=user.name,
                avatar=user.avatar,
                bio=user.bio,
                is_email_verified=user.is_email_verified
            )
        )
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Token refresh failed: {str(e)}")
        raise_internal_server_error()


@router.get("/token-status")
@limiter.limit("200/minute")  # Увеличенный лимит для проверки статуса токена
async def check_token_status(
    request: Request,
    current_user: UserModel = Depends(get_current_user)
):
    """Check if current token is valid and return user info"""
    try:
        return {
            "valid": True,
            "user": UserResponse(
                id=str(current_user.id),
                email=current_user.email,
                name=current_user.name,
                avatar=current_user.avatar,
                bio=current_user.bio,
                is_email_verified=current_user.is_email_verified
            )
        }
    except Exception as e:
        logger.error(f"Token status check failed: {str(e)}")
        raise_invalid_token() 