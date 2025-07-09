from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
import logging
import json

from ...dependencies.auth import get_current_user, get_user_from_token
from ...users.models import User
from ...db.db import get_db
from ...schemas.sites import (
    SiteGenerationRequest, SiteGenerationResponse, SitePreview,
    SiteUpdate, UserSitesResponse, SiteAnalyticsEvent, SiteStatistics
)
from ...services.sites_service import sites_service
from ...services.site_generator import GenerationStatus
from ...core.exceptions import ErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter()

# Хранилище активных WebSocket соединений
active_connections: dict[str, WebSocket] = {}

@router.websocket("/generation-status/{generation_id}")
async def websocket_generation_status(
    websocket: WebSocket,
    generation_id: str,
    token: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db)
):
    """
    WebSocket endpoint для получения real-time статусов генерации сайта.
    Аутентификация происходит по токену в query параметрах.
    """
    if not token:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Missing auth token")
        return

    user = await get_user_from_token(token, db)
    if not user:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION, reason="Invalid auth token")
        return

    await websocket.accept()
    active_connections[generation_id] = websocket
    
    try:
        while True:
            # Ждем сообщения от клиента (ping для поддержания соединения)
            await websocket.receive_text()
            await websocket.send_text(json.dumps({"type": "pong"}))
    except WebSocketDisconnect:
        if generation_id in active_connections:
            del active_connections[generation_id]
        logger.info(f"WebSocket for user {user.id} disconnected for generation {generation_id}")

async def send_generation_status(generation_id: str, status: GenerationStatus):
    """Отправка статуса генерации через WebSocket"""
    if generation_id in active_connections:
        websocket = active_connections[generation_id]
        try:
            await websocket.send_text(json.dumps({
                "type": "status_update",
                "data": status.dict()
            }))
        except Exception as e:
            logger.error(f"Error sending status via WebSocket: {e}")
            # Удаляем неактивное соединение
            if generation_id in active_connections:
                del active_connections[generation_id]

@router.post("/generate", response_model=SiteGenerationResponse)
async def generate_site(
    request: SiteGenerationRequest,
    generation_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new React site using OpenAI with real-time status updates
    
    Creates a complete React landing page based on user input:
    - Event type (wedding, birthday, corporate, etc.)
    - Theme and style preferences  
    - Content details and requirements
    - Color and design preferences
    
    Supports real-time status updates via WebSocket if generation_id is provided.
    
    Returns the generated site with React component structure and TypeScript code.
    """
    try:
        logger.info(f"User {current_user.id} requesting React site generation for {request.event_type}")
        
        # Создаем callback для отправки статусов через WebSocket
        async def status_callback(status: GenerationStatus):
            if generation_id:
                await send_generation_status(generation_id, status)
        
        site = await sites_service.create_site(
            db=db,
            user_id=current_user.id,
            request=request,
            status_callback=status_callback
        )
        
        logger.info(f"React site generated successfully: {site.id}")
        return site
        
    except Exception as e:
        logger.error(f"Error generating React site: {e}")
        # Отправляем ошибку через WebSocket
        if generation_id:
            error_status = GenerationStatus(
                step="error",
                progress=0,
                message=f"Ошибка генерации: {str(e)}",
                estimated_time=0
            )
            await send_generation_status(generation_id, error_status)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка генерации React сайта: {str(e)}"
        )


@router.get("/{site_id}/react-code")
async def get_site_react_code(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get React component code for specific site
    
    Returns the TypeScript React component code that can be:
    - Copied and used in a React project
    - Downloaded as a .tsx file
    - Used for preview in code editor
    
    Only accessible by the site owner.
    """
    try:
        site = await sites_service.get_site_by_id(
            db=db,
            site_id=site_id,
            user_id=current_user.id
        )
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Сайт не найден"
            )
        
        # Extract React code from site structure
        react_code = site.site_structure.get('react_component_code', '')
        
        if not react_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="React код не найден для этого сайта"
            )
        
        # Get component name for filename
        component_name = site.site_structure.get('component_name', site.title.replace(' ', ''))
        
        # Return React component code with proper headers
        return Response(
            content=react_code,
            media_type="text/plain",
            headers={
                "Content-Disposition": f"attachment; filename=\"{component_name}.tsx\"",
                "X-Component-Name": site.title,
                "X-Component-Type": "React TypeScript"
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting React code: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения React кода"
        )


@router.get("/my-sites", response_model=UserSitesResponse)
async def get_my_sites(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get all sites created by the current user
    
    Returns a paginated list of user's sites with:
    - Site previews (without full HTML content)
    - Total, published, and draft counts
    - Creation and update timestamps
    """
    try:
        sites = await sites_service.get_user_sites(
            db=db,
            user_id=current_user.id,
            skip=skip,
            limit=limit
        )
        
        return sites
        
    except Exception as e:
        logger.error(f"Error getting user sites: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения списка сайтов"
        )


@router.get("/{site_id}", response_model=SiteGenerationResponse)
async def get_site(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Get specific site by ID
    
    Returns full site data including HTML content.
    Only accessible by the site owner.
    """
    try:
        site = await sites_service.get_site_by_id(
            db=db,
            site_id=site_id,
            user_id=current_user.id
        )
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Сайт не найден"
            )
        
        return site
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting site: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка получения сайта"
        )


@router.put("/{site_id}", response_model=SiteGenerationResponse)
async def update_site(
    site_id: UUID,
    update_data: SiteUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Update site properties
    
    Allows updating:
    - Title and meta description
    - Publication status
    - Visibility settings
    - Content details and preferences
    """
    try:
        site = await sites_service.update_site(
            db=db,
            site_id=site_id,
            user_id=current_user.id,
            update_data=update_data
        )
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Сайт не найден"
            )
        
        return site
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating site: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка обновления сайта"
        )


@router.delete("/{site_id}")
async def delete_site(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete site permanently
    
    Removes site and all associated analytics data.
    This action cannot be undone.
    """
    try:
        success = await sites_service.delete_site(
            db=db,
            site_id=site_id,
            user_id=current_user.id
        )
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Сайт не найден"
            )
        
        return {"message": "Сайт успешно удален"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка удаления сайта"
        )

@router.get("/public/{slug}", response_class=HTMLResponse)
async def view_public_site(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    View published site by slug
    
    Public endpoint for viewing published sites.
    Automatically tracks page views and analytics.
    """
    try:
        site = await sites_service.get_site_by_slug(
            db=db,
            slug=slug,
            increment_views=True
        )
        
        if not site:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Страница не найдена"
            )
        
        return HTMLResponse(content=site.html_content)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error viewing public site: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Ошибка загрузки страницы"
        )