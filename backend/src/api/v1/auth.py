from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
import logging
from uuid import UUID

from src.core.security import create_token_pair, verify_token
from src.db.db import get_db
from src.users.service import UserService
from src.users.schemas import (
    UserCreate, UserResponse, AuthResponse, 
    ForgotPasswordRequest, ResetPasswordRequest, UserLogin,
    GoogleOAuthCreate, EmailVerificationRequest, EmailVerificationConfirm
)
from src.dependencies.auth import get_current_user
from src.users.models import User as UserModel
from src.services.email_service import email_service

router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/register", response_model=AuthResponse)
async def register(
    user_data: UserCreate,
    db: AsyncSession = Depends(get_db)
):
    """Register new user and send verification email"""
    try:
        logger.info(f"Registration attempt for email: {user_data.email}")
        user_service = UserService(db)
        
        # Check if user already exists
        existing_user = await user_service.get_by_email(user_data.email)
        if existing_user:
            logger.warning(f"User already exists: {user_data.email}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create new user with email verification
        logger.info(f"Creating new user: {user_data.email}")
        user = await user_service.create_user(user_data, send_verification=True)
        logger.info(f"User created successfully: {user.id}")
        
        # Send verification email
        if user.email_verification_token:
            await email_service.send_verification_email(
                user.email, 
                user.name, 
                user.email_verification_token
            )
        
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
    """Login user and return tokens"""
    user_service = UserService(db)
    
    # Authenticate user
    user = await user_service.authenticate(
        email=credentials.email,
        password=credentials.password
    )
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
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


@router.post("/verify-email", response_model=dict)
async def verify_email(
    verification: EmailVerificationConfirm,
    db: AsyncSession = Depends(get_db)
):
    """Verify user email with token"""
    try:
        user_service = UserService(db)
        
        # Verify email with token
        user = await user_service.verify_email(verification.token)
        
        if not user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired verification token"
            )
        
        # Send welcome email
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
    """Resend email verification"""
    try:
        user_service = UserService(db)
        
        # Generate new verification token
        new_token = await user_service.resend_verification_email(request.email)
        
        if not new_token:
            # Don't reveal if email exists or is already verified for security
            return {
                "message": "If the email exists and is not verified, a new verification email has been sent",
                "success": True
            }
        
        # Get user to send email
        user = await user_service.get_by_email(request.email)
        if user:
            await email_service.send_verification_email(
                user.email,
                user.name,
                new_token
            )
        
        return {
            "message": "If the email exists and is not verified, a new verification email has been sent",
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Resend verification failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/refresh", response_model=dict)
async def refresh_token(
    refresh_token: str,
    db: AsyncSession = Depends(get_db)
):
    """Refresh access token using refresh token"""
    # Verify refresh token
    payload = verify_token(refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    
    # Check token type
    token_type = payload.get("type")
    if token_type != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type"
        )
    
    # Get user ID from token
    user_id = payload.get("sub")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Verify user still exists
    user_service = UserService(db)
    user = await user_service.get_by_id(UUID(user_id))
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    # Generate new token pair
    new_access_token, new_refresh_token = create_token_pair(user.id)
    
    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


@router.post("/logout", response_model=dict)
async def logout():
    """
    Logout user - client-side token removal
    """
    return {
        "message": "Successfully logged out",
        "success": True
    }


@router.get("/profile", response_model=UserResponse)
async def get_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get current user profile - matches frontend expectations
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        bio=current_user.bio,
        is_email_verified=current_user.is_email_verified
    )


@router.post("/forgot-password", response_model=dict)
async def forgot_password(
    request: ForgotPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Send password reset email
    """
    try:
        user_service = UserService(db)
        
        # Check if user exists
        user = await user_service.get_by_email(request.email)
        
        # Always return success for security (don't reveal if email exists)
        # In production, you would send actual email here
        logger.info(f"Password reset requested for email: {request.email}")
        
        if user:
            # Generate reset token (in production, store this in database with expiration)
            reset_token = create_token_pair(user.id)[0]  # Use access token as reset token
            
            # Here you would send email with reset link
            # For now, just log it
            logger.info(f"Reset token for {request.email}: {reset_token}")
            
        return {
            "message": "If the email exists, password reset instructions have been sent",
            "success": True
        }
        
    except Exception as e:
        logger.error(f"Forgot password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        )


@router.post("/reset-password", response_model=dict)
async def reset_password(
    request: ResetPasswordRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Reset password using token
    """
    try:
        # Verify reset token
        payload = verify_token(request.token)
        if payload is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid or expired reset token"
            )
        
        # Get user ID from token
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid token payload"
            )
        
        user_service = UserService(db)
        
        # Update user password - fix UUID conversion
        success = await user_service.update_password(UUID(user_id), request.new_password)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Failed to update password"
            )
        
        return {
            "message": "Password has been reset successfully",
            "success": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Reset password error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Internal server error"
        ) 