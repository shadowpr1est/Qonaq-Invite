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
from ...core.exceptions import (
    raise_site_not_found, raise_site_not_published, raise_site_access_denied,
    raise_rsvp_submission_failed, raise_internal_server_error, LocalizedHTTPException
)
from ...models.sites import Site
import os
import httpx

logger = logging.getLogger(__name__)

router = APIRouter()

# Импортируем limiter из rate_limiter.py
from ...core.rate_limiter import limiter

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


@router.post("/generate", response_model=dict)
async def generate_site(
    request: dict,
    generation_id: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Generate a new React site using OpenAI with background task processing
    
    Creates a complete React landing page based on user input:
    - Event type (wedding, birthday, corporate, etc.)
    - Theme and style preferences  
    - Content details and requirements
    - Color and design preferences
    
    Returns task information for tracking progress.
    """
    try:
        logger.info(f"User {current_user.id} requesting React site generation for {request['event_type']}")
        
        # Запускаем фоновую задачу
        result = await sites_service.create_site(
            db=db,
            user_id=current_user.id,
            request=request
        )
        
        logger.info(f"Site generation task started: {result['task_id']}")
        return result
        
    except Exception as e:
        logger.error(f"Error starting site generation: {e}")
        raise_internal_server_error()


@router.get("/task/{task_id}")
async def get_task_status(
    task_id: str,
    current_user: User = Depends(get_current_user)
):
    """
    Get status of a background task
    """
    try:
        status = await sites_service.get_task_status(task_id)
        return status
    except Exception as e:
        logger.error(f"Error getting task status: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка получения статуса задачи: {str(e)}"
        )


@router.post("/preview")
async def generate_preview(
    request: dict,
    current_user: User = Depends(get_current_user)
):
    """
    Generate a preview of the site
    """
    try:
        result = await sites_service.generate_preview(request)
        return result
    except Exception as e:
        logger.error(f"Error generating preview: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Ошибка генерации предварительного просмотра: {str(e)}"
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
            raise_site_not_found()
        
        # Extract React code from site structure
        react_code = site.site_structure.get('react_component_code', '')
        
        if not react_code:
            raise_site_not_found()
        
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
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting React code: {e}")
        raise_internal_server_error()


@router.get("/my-sites")
@limiter.limit("100/minute")  # Увеличенный лимит для получения списка сайтов
async def get_my_sites(
    request: Request,
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
        raise_internal_server_error()


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
            raise_site_not_found()
        
        return site
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting site: {e}")
        raise_internal_server_error()


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
            raise_site_not_found()
        
        return site
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating site: {e}")
        raise_internal_server_error()


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
            raise_site_not_found()
        
        return {"message": "Сайт успешно удален"}
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting site: {e}")
        raise_internal_server_error()

@router.post("/{site_id}/rsvp", response_model=RSVPResponse)
async def submit_rsvp(
    site_id: UUID,
    rsvp: RSVPCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Submit RSVP for a site (public, не требует авторизации)
    """
    try:
        site = await db.execute(select(Site).where(Site.id == site_id, Site.is_published == True))
        site_obj = site.scalar_one_or_none()
        if not site_obj:
            raise_site_not_published()
        
        rsvp_obj = await sites_service.create_rsvp(db, site_id, rsvp.dict())
        return RSVPResponse.model_validate(rsvp_obj)
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"RSVP submission failed: {str(e)}")
        raise_rsvp_submission_failed()

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
        raise_site_access_denied()
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
            raise_site_not_found()
        
        # Отладочная информация
        print(f"🔍 DEBUG: site_structure = {site.site_structure}")
        print(f"📊 DEBUG: site_structure type = {type(site.site_structure)}")
        
        # Проверяем, является ли site_structure строкой JSON
        if isinstance(site.site_structure, str):
            import json
            site_structure = json.loads(site.site_structure)
        else:
            site_structure = site.site_structure
        
        site_data = site_structure.get('event_json', {})
        print(f"🔍 DEBUG: site_data = {site_data}")
        print(f"📊 DEBUG: site_data type = {type(site_data)}")
        print(f"🔑 DEBUG: site_data keys = {list(site_data.keys()) if site_data else 'None'}")
        
        try:
            # Используем site_generator для генерации React компонента
            from ..services.site_generator import SiteGeneratorService
            generator = SiteGeneratorService()
            react_component = await generator.generate_react_component(site_data)
            
            # Создаем полную HTML страницу с React
            react_page = f"""
            <!DOCTYPE html>
            <html lang="ru">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>{site.title}</title>
                <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
                <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
                <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
                <script src="https://cdn.tailwindcss.com"></script>
                <script src="https://mapgl.2gis.com/api/js/v1"></script>
            </head>
            <body>
                <div id="root"></div>
                <script type="text/babel">
                    {react_component}
                </script>
            </body>
            </html>
            """
            
            print(f"✅ DEBUG: react_page generated, length = {len(react_page)}")
            return HTMLResponse(content=react_page)
        except Exception as e:
            print(f"❌ DEBUG: Error in generate_react_component: {e}")
            import traceback
            traceback.print_exc()
            return HTMLResponse(content=f"<h1>Error: {str(e)}</h1>")
        
    except LocalizedHTTPException:
        raise
    except Exception as e:
        logger.error(f"Error viewing public site: {e}")
        raise_internal_server_error()

@router.get("/get_coordinates")
async def get_coordinates(
    city: str = Query(..., description="City name"),
    venue_name: str = Query(..., description="Venue name"),
    current_user = Depends(get_current_user)
):
    """Get coordinates for a venue using 2GIS API"""
    
    # Получаем API ключ из переменных окружения
    api_key = os.getenv("VITE_2GIS_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500, 
            detail="2GIS API key not configured"
        )
    
    # Формируем поисковый запрос
    query = f"{city}, {venue_name}".strip()
    
    try:
        # Делаем запрос к 2GIS Geocoder API
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(
                "https://catalog.api.2gis.com/3.0/items/geocode",
                params={
                    "q": query,
                    "fields": "items.point",
                    "key": api_key
                }
            )
            
            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code,
                    detail=f"2GIS API error: {response.text}"
                )
            
            data = response.json()
            
            # Проверяем наличие результатов
            if not data.get("result", {}).get("items"):
                raise HTTPException(
                    status_code=404,
                    detail=f"Location not found: {query}"
                )
            
            # Берем первый результат
            first_item = data["result"]["items"][0]
            point = first_item.get("point")
            
            if not point or "lat" not in point or "lon" not in point:
                raise HTTPException(
                    status_code=500,
                    detail="Invalid coordinates in response"
                )
            
            return {
                "lat": point["lat"],
                "lon": point["lon"],
                "address": first_item.get("full_name", query),
                "name": first_item.get("name", venue_name)
            }
            
    except httpx.TimeoutException:
        raise HTTPException(
            status_code=408,
            detail="Request to 2GIS API timed out"
        )
    except httpx.RequestError as e:
        raise HTTPException(
            status_code=502,
            detail=f"Error connecting to 2GIS API: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Unexpected error: {str(e)}"
        )