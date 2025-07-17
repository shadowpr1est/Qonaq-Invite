import uuid
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import RedirectResponse, JSONResponse
import httpx
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.core.security import create_token_pair, get_password_hash
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


@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register a new user"""
    try:
        user_service = UserService(db)
        
        # Check if user already exists
        existing_user = await user_service.get_by_email(user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create user
        user = await user_service.create_user(user_data)
        
        # Генерируем и отправляем код верификации
        verification_code = await user_service.generate_email_verification_code(user.email)
        if verification_code:
            email_service.send_verification_email(user.email, verification_code)
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Registration failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during registration"
        )


@router.post("/login", response_model=AuthResponse)
async def login(
    credentials: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    """Login user with email and password"""
    try:
        user_service = UserService(db)
        
        # Authenticate user
        user = await user_service.authenticate(credentials.email, credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
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
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during login"
        )


@router.post("/google-oauth", response_model=AuthResponse)
async def google_oauth(
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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during Google authentication"
        )




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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during profile update"
        )


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
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error."
        ) 

@router.get("/google-login-url")
async def get_google_login_url():
    """Generate Google OAuth2 login URL for classic redirect flow"""
    # Логируем client_id и client_secret при генерации URL
    logger.info(f"[OAUTH] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
    logger.info(f"[OAUTH] GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")
    base_url = "https://accounts.google.com/o/oauth2/v2/auth"
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "consent",
    }
    url = f"{base_url}?{urllib.parse.urlencode(params)}"
    return {"url": url}

@router.get("/google/callback")
async def google_oauth_callback(code: str, db: AsyncSession = Depends(get_db)):
    """Handle Google OAuth2 redirect, exchange code for tokens, get user info, and log in/register user."""
    # Логируем client_id и client_secret при callback
    logger.info(f"[OAUTH] GOOGLE_CLIENT_ID: {settings.GOOGLE_CLIENT_ID}")
    logger.info(f"[OAUTH] GOOGLE_CLIENT_SECRET: {settings.GOOGLE_CLIENT_SECRET}")
    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }
    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=data)
        if token_resp.status_code != 200:
            return JSONResponse(status_code=400, content={"error": "Failed to get token from Google", "details": token_resp.text})
        token_data = token_resp.json()
        id_token = token_data.get("id_token")
        access_token = token_data.get("access_token")
        if not id_token:
            return JSONResponse(status_code=400, content={"error": "No id_token in response"})
        # Verify and decode id_token (JWT) with Google's public keys
        jwks_url = "https://www.googleapis.com/oauth2/v3/certs"
        jwks_resp = await client.get(jwks_url)
        jwks = jwks_resp.json()
        from jwt import PyJWKClient
        jwk_client = PyJWKClient(jwks_url)
        signing_key = jwk_client.get_signing_key_from_jwt(id_token).key
        payload = jwt.decode(id_token, signing_key, algorithms=["RS256"], audience=settings.GOOGLE_CLIENT_ID)
        email = payload.get("email")
        name = payload.get("name")
        google_id = payload.get("sub")
        avatar = payload.get("picture")
        if not email or not google_id:
            return JSONResponse(status_code=400, content={"error": "Missing email or google_id in token"})
        # Log in or register user
        user_service = UserService(db)
        user = await user_service.get_by_google_id(google_id)
        if not user:
            user = await user_service.get_by_email(email)
            if user:
                user.google_id = google_id
                user.oauth_provider = "google"
                user.is_email_verified = True
                if avatar and not user.avatar:
                    user.avatar = avatar
                await db.commit()
                await db.refresh(user)
            else:
                from src.users.schemas import GoogleOAuthCreate
                user = await user_service.create_oauth_user(GoogleOAuthCreate(email=email, name=name, google_id=google_id, avatar=avatar))
        # Generate token pair
        access_token, refresh_token = create_token_pair(user.id)
        # Set tokens as query params and redirect to frontend
        from fastapi.responses import RedirectResponse
        frontend_url = settings.FRONTEND_URL
        redirect_url = f"{frontend_url}/login?access_token={access_token}&refresh_token={refresh_token}"
        response = RedirectResponse(redirect_url)
        return response 

@router.post("/verify-email-code", response_model=UserResponse)
async def verify_email_code(
    data: EmailVerificationCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Verify email with 6-digit code"""
    user_service = UserService(db)
    user = await user_service.verify_email_with_code(data.email, data.code)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return UserResponse(
        id=str(user.id),
        email=user.email,
        name=user.name,
        avatar=user.avatar,
        bio=user.bio,
        is_email_verified=user.is_email_verified
    )

@router.post("/forgot-password-request")
async def forgot_password_request(
    data: PasswordResetCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset code to email"""
    user_service = UserService(db)
    code = await user_service.generate_password_reset_code(data.email)
    if not code:
        raise HTTPException(status_code=404, detail="User not found or already requested reset")
    email_service.send_verification_email(data.email, code)
    return {"message": "Reset code sent"}

@router.post("/reset-password-with-code")
async def reset_password_with_code(
    data: PasswordResetCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Reset password using code"""
    user_service = UserService(db)
    ok = await user_service.verify_password_reset_code(data.email, data.code, data.new_password)
    if not ok:
        raise HTTPException(status_code=400, detail="Invalid or expired code")
    return {"message": "Password reset successful"} 

@router.post("/resend-verification-code")
async def resend_verification_code(
    data: EmailVerificationCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Resend email verification code"""
    user_service = UserService(db)
    code = await user_service.generate_email_verification_code(data.email)
    if not code:
        raise HTTPException(status_code=404, detail="User not found or already verified")
    email_service.send_code_email(data.email, code, purpose='verification')
    return {"message": "Verification code resent"} 