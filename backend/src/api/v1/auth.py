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
from src.services.email_service import email_service
from src.users.models import User as UserModel
from src.users.schemas import UserCreate, UserLogin, UserResponse, GoogleOAuthCreate, \
    EmailVerificationConfirm, EmailVerificationRequest, ForgotPasswordRequest, ResetPasswordRequest, \
    AuthResponse, EmailVerificationCodeRequest, EmailVerificationCodeConfirm, PasswordResetCodeRequest, \
    PasswordResetCodeConfirm
from src.users.service import UserService
import logging
import urllib.parse
import jwt

# Получаем логгер стандартным способом
logger = logging.getLogger(__name__)

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
        
        # Email verification отключена: ничего не отправляем
        
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
# EMAIL VERIFICATION WITH 6-DIGIT CODES (NEW)
# ========================================================================

@router.post("/request-verification-code", response_model=dict)
async def request_verification_code(
    request: EmailVerificationCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request new 6-digit verification code"""
    try:
        user_service = UserService(db)
        
        # Generate new verification code
        new_code = await user_service.generate_email_verification_code(request.email)
        
        if not new_code:
            # Don't reveal if email exists or is already verified for security
            return {
                "message": "If the email exists and is not verified, a new verification code has been sent",
                "success": True
            }
        
        # Get user to send email
        user = await user_service.get_by_email(request.email)
        if user:
            await email_service.send_verification_code_email(
                user.email,
                user.name,
                new_code
            )
        
        return {
            "message": "If the email exists and is not verified, a new verification code has been sent",
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Request verification code failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/verify-email-code", response_model=dict)
async def verify_email_code(
    verification: EmailVerificationCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Verify user email with 6-digit code"""
    try:
        user_service = UserService(db)
        
        # Verify email with code
        user = await user_service.verify_email_with_code(verification.email, verification.code)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification code"
            )
        
        # Email verification отключена: не отправляем welcome email
        
        logger.info(f"Email verified successfully with code for user: {user.email}")
        
        return {
            "message": "Email verified successfully! Welcome to Invitly! 🎉",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification with code failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during email verification"
        )


# ========================================================================
# PASSWORD RESET WITH 6-DIGIT CODES (NEW)
# ========================================================================

@router.post("/request-password-reset-code", response_model=dict)
async def request_password_reset_code(
    request: PasswordResetCodeRequest,
    db: AsyncSession = Depends(get_db)
):
    """Request 6-digit code to reset password"""
    try:
        user_service = UserService(db)
        
        # Generate new password reset code
        new_code = await user_service.generate_password_reset_code(request.email)
        
        if new_code:
            user = await user_service.get_by_email(request.email)
            if user:
                await email_service.send_password_reset_code_email(user.email, user.name, new_code)
        
        return {
            "message": "If your email is in our database, you will receive a password reset code.",
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Request password reset code failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/reset-password-with-code", response_model=dict)
async def reset_password_with_code(
    request: PasswordResetCodeConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with 6-digit code and new password"""
    try:
        user_service = UserService(db)
        
        # Reset password with code
        success = await user_service.reset_password_with_code(request.email, request.code, request.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset code."
            )
            
        logger.info(f"Password reset successfully with code for email: {request.email}")
            
        return {
            "message": "Your password has been reset successfully. You can now log in with your new password.",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset with code failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


# ========================================================================
# LEGACY TOKEN-BASED METHODS (to be deprecated)
# ========================================================================

@router.post("/verify-email", response_model=dict)
async def verify_email(
    verification: EmailVerificationConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Verify user email with token"""
    try:
        user_service = UserService(db)
        user = await user_service.verify_email(verification.token)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        await email_service.send_welcome_email(user.email, user.name)
        
        logger.info(f"Email verified successfully for user: {user.email}")
        
        return {
            "message": "Email verified successfully! Welcome to Invitly! 🎉",
            "success": True
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Email verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error during email verification"
        )

@router.post("/resend-verification", response_model=dict)
async def resend_verification(
    request: EmailVerificationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Resend email verification token"""
    try:
        user_service = UserService(db)
        user = await user_service.get_by_email(request.email)
        
        if not user or user.is_email_verified:
            # Don't reveal if user exists or is already verified
            return {"message": "If the email exists and is not verified, a new verification link has been sent"}

        # Generate new verification token and send email
        verification_token = await user_service.generate_email_verification_token(user.email)
        await email_service.send_verification_email(user.email, user.name, verification_token)
        
        logger.info(f"Resent verification email to: {user.email}")
        
        return {"message": "If the email exists and is not verified, a new verification link has been sent"}
        
    except Exception as e:
        logger.error(f"Resend verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Send password reset email with token"""
    try:
        user_service = UserService(db)
        user = await user_service.get_by_email(request.email)
        
        if user:
            password_reset_token = await user_service.generate_password_reset_token(user.email)
            await email_service.send_password_reset_email(user.email, user.name, password_reset_token)
            logger.info(f"Password reset email sent to: {user.email}")

        return {"message": "If your email is in our database, you will receive a password reset link."}
        
    except Exception as e:
        logger.error(f"Forgot password request failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/reset-password", response_model=dict)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """Reset password with token"""
    try:
        user_service = UserService(db)
        user = await user_service.reset_password(request.token, request.new_password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired password reset token."
            )
        
        logger.info(f"Password for {user.email} has been reset successfully.")
        
        return {"message": "Your password has been reset successfully. You can now log in with your new password."}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Password reset failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
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
        # Set tokens as httpOnly cookies and redirect to frontend
        from fastapi.responses import RedirectResponse
        frontend_url = settings.FRONTEND_URL
        response = RedirectResponse(frontend_url)
        response.set_cookie(key="access_token", value=access_token, httponly=True, secure=True, samesite="lax")
        response.set_cookie(key="refresh_token", value=refresh_token, httponly=True, secure=True, samesite="lax")
        return response 