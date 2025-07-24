"""
User Profile and Management API
Unified user profile management with proper error handling
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from src.db.db import get_db
from src.dependencies.auth import get_current_user
from src.users.models import User as UserModel
from src.users.schemas import UserResponse, UserUpdate, ChangePasswordRequest, ApiResponse, UserStats
from src.core.exceptions import LocalizedHTTPException, ErrorCode, raise_internal_server_error
from src.core.security import verify_password, get_password_hash

import random
import logging
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: UserModel = Depends(get_current_user)
):
    """
    Get current user profile - matches frontend User interface
    """
    return UserResponse(
        id=str(current_user.id),
        email=current_user.email,
        name=current_user.name,
        avatar=current_user.avatar,
        bio=current_user.bio
    )


@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    profile_data: UserUpdate,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update user profile information
    
    Only updates fields that are provided in the request
    """
    try:
        # Update only provided fields
        if profile_data.name is not None:
            current_user.name = profile_data.name
        if profile_data.avatar is not None:
            current_user.avatar = profile_data.avatar
        if profile_data.bio is not None:
            current_user.bio = profile_data.bio
        
        current_user.updated_at = datetime.utcnow()
        
        await db.commit()
        await db.refresh(current_user)
        
        logger.info(f"Profile updated for user {current_user.id}")
        return UserResponse(
            id=str(current_user.id),
            email=current_user.email,
            name=current_user.name,
            avatar=current_user.avatar,
            bio=current_user.bio
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to update profile for user {current_user.id}: {str(e)}")
        raise_internal_server_error()


@router.post("/change-password", response_model=ApiResponse)
async def change_password(
    password_data: ChangePasswordRequest,
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Change user password
    
    Requires current password verification for security
    """
    try:
        # Verify current password
        if not verify_password(password_data.currentPassword, current_user.hashed_password):
            raise LocalizedHTTPException(
                error_code=ErrorCode.INVALID_PASSWORD,
                status_code=status.HTTP_400_BAD_REQUEST
            )
        
        # Update password
        current_user.hashed_password = get_password_hash(password_data.newPassword)
        current_user.updated_at = datetime.utcnow()
        
        await db.commit()
        
        logger.info(f"Password changed for user {current_user.id}")
        return ApiResponse(
            data={},
            message="Password updated successfully",
            success=True
        )
        
    except Exception as e:
        await db.rollback()
        logger.error(f"Failed to change password for user {current_user.id}: {str(e)}")
        raise_internal_server_error()


@router.get("/stats", response_model=UserStats)
async def get_user_stats(
    current_user: UserModel = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get user statistics and analytics
    
    Returns comprehensive user statistics including:
    - Analysis counts and scores
    - Practice streaks and time
    - Improvement metrics
    """
    try:
        # In production, query real analysis data from database
        # For now, generate realistic mock data based on user activity
        
        # Mock data with some variety based on user ID
        user_seed = hash(str(current_user.id)) % 1000
        random.seed(user_seed)
        
        total_analyses = random.randint(5, 50)
        completed_analyses = int(total_analyses * random.uniform(0.7, 0.95))
        average_score = random.uniform(65, 92) if completed_analyses > 0 else None
        
        days_since_join = (datetime.utcnow() - current_user.created_at).days
        max_streak = min(days_since_join, random.randint(1, 30))
        current_streak = random.randint(0, max_streak)
        
        total_practice_time = completed_analyses * random.randint(2, 8)
        improvement_rate = random.uniform(5, 25) if completed_analyses > 3 else None
        
        stats = UserStats(
            total_analyses=total_analyses,
            completed_analyses=completed_analyses,
            average_score=round(average_score, 1) if average_score else None,
            total_practice_time=total_practice_time,
            current_streak=current_streak,
            best_streak=max_streak,
            improvement_rate=round(improvement_rate, 1) if improvement_rate else None,
            join_date=current_user.created_at
        )
        
        logger.info(f"Stats retrieved for user {current_user.id}")
        return stats
        
    except Exception as e:
        logger.error(f"Failed to get stats for user {current_user.id}: {str(e)}")
        raise_internal_server_error() 