from fastapi import APIRouter, Depends, HTTPException, status, Request, Response, WebSocket, WebSocketDisconnect, Query
from fastapi.responses import HTMLResponse
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from uuid import UUID
import logging
import json
from sqlalchemy import select, func, and_, desc

from ...dependencies.auth import get_current_user, get_user_from_token
from ...users.models import User
from ...db.db import get_db
from ...schemas.sites import (
    SiteGenerationResponse, SitePreview,
    SiteUpdate, UserSitesResponse, SiteAnalyticsEvent, SiteStatistics, RSVPCreate, RSVPResponse
)
from ...services.sites_service import sites_service
from ...core.exceptions import ErrorResponse
from ...models.sites import Site

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


@router.post("/generate", response_model=SiteGenerationResponse)
async def generate_site(
    request: dict,
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
        logger.info(f"User {current_user.id} requesting React site generation for {request['event_type']}")
        
        # Создаем callback для отправки статусов через WebSocket
        async def status_callback(status: str):
            if generation_id:
                # Удаляю все вызовы send_generation_status, оставляю только обработку ошибок или логирование
                pass
        
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
            error_status = "error"
            # Удаляю все вызовы send_generation_status, оставляю только обработку ошибок или логирование
            pass
        
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


@router.get("/my-sites")
async def get_my_sites(
    skip: int = 0,
    limit: int = 100,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    try:
        # Загружаем все нужные данные сразу, пока session жива
        query = select(
            Site.id, Site.title, Site.slug, Site.meta_description, Site.event_type, Site.theme,
            Site.content_details, Site.color_preferences, Site.style_preferences, Site.target_audience,
            Site.is_published, Site.view_count, Site.share_count, Site.created_at, Site.updated_at
        ).where(Site.user_id == current_user.id).offset(skip).limit(limit).order_by(desc(Site.created_at))
        result = await db.execute(query)
        sites = result.all()

        total_result = await db.execute(select(func.count(Site.id)).where(Site.user_id == current_user.id))
        total_count = total_result.scalar() or 0

        published_result = await db.execute(
            select(func.count(Site.id)).where(and_(Site.user_id == current_user.id, Site.is_published == True))
        )
        published_count = published_result.scalar() or 0

        site_dicts = []
        for (
            id, title, slug, meta_description, event_type, theme, content_details, color_preferences,
            style_preferences, target_audience, is_published, view_count, share_count, created_at, updated_at
        ) in sites:
            site_dicts.append({
                'id': str(id),
                'title': title,
                'slug': slug,
                'meta_description': meta_description,
                'event_type': event_type,
                'theme': theme,
                'content_details': content_details,
                'color_preferences': color_preferences,
                'style_preferences': style_preferences,
                'target_audience': target_audience,
                'is_published': is_published,
                'view_count': view_count,
                'share_count': share_count,
                'created_at': created_at.isoformat() if created_at else None,
                'updated_at': updated_at.isoformat() if updated_at else None
            })

        return {
            'sites': site_dicts,
            'total_count': total_count,
            'published_count': published_count,
            'draft_count': total_count - published_count
        }
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

@router.post("/{site_id}/rsvp", response_model=RSVPResponse)
async def submit_rsvp(
    site_id: UUID,
    rsvp: RSVPCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit RSVP for a site (public, не требует авторизации)
    """
    site = await db.execute(select(Site).where(Site.id == site_id, Site.is_published == True))
    site_obj = site.scalar_one_or_none()
    if not site_obj:
        raise HTTPException(status_code=404, detail="Сайт не найден или не опубликован")
    rsvp_obj = await sites_service.create_rsvp(db, site_id, rsvp.dict())
    # --- Удаляю запись аналитики RSVP ---
    # from ...schemas.sites import SiteAnalyticsEvent
    # analytics_event = SiteAnalyticsEvent(
    #     event_type="rsvp",
    #     event_data={
    #         "response": rsvp.response,
    #         "guest_name": rsvp.guest_name,
    #         "guest_email": rsvp.guest_email,
    #         "comment": rsvp.comment
    #     },
    #     user_agent=None,
    #     referrer=None
    # )
    # await sites_service.record_analytics_event(db, site_id, analytics_event)
    # ---
    return RSVPResponse.model_validate(rsvp_obj)

@router.get("/{site_id}/rsvp", response_model=List[RSVPResponse])
async def get_rsvps(
    site_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Получить список RSVP для сайта (только владелец)
    """
    site = await db.execute(select(Site).where(Site.id == site_id, Site.user_id == current_user.id))
    site_obj = site.scalar_one_or_none()
    if not site_obj:
        raise HTTPException(status_code=404, detail="Сайт не найден или нет доступа")
    rsvps = await sites_service.get_rsvps(db, site_id)
    return [RSVPResponse.model_validate(r) for r in rsvps]

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