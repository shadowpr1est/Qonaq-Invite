import re
import logging
from typing import List, Optional, Callable
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc

from ..models.sites import Site, SiteAnalytics, RSVP
from ..users.models import User
from ..schemas.sites import (
    SiteGenerationRequest, SiteGenerationResponse, SitePreview, 
    SiteUpdate, SiteStatistics, UserSitesResponse, SiteAnalyticsEvent,
    EventType, ThemeStyle, ColorScheme
)
from .site_generator import SiteGeneratorService
from ..utils.slug import generate_slug

logger = logging.getLogger(__name__)


class SitesService:
    """Service for managing user sites"""
    
    @staticmethod
    async def create_site(
        db: AsyncSession,
        user_id: UUID,
        request: dict,
        status_callback: Optional[Callable] = None
    ):
        # Используем только новую функцию генерации и сохранения
        return await SitesService.generate_and_save_site(db, user_id, request)
    
    @staticmethod
    async def get_user_sites(db: AsyncSession, user_id: UUID, skip: int = 0, limit: int = 100):
        try:
            # Загружаем все нужные данные сразу, пока session жива
            query = select(
                Site.id, Site.title, Site.slug, Site.meta_description, Site.event_type, Site.theme,
                Site.content_details, Site.color_preferences, Site.style_preferences, Site.target_audience,
                Site.is_published, Site.view_count, Site.share_count, Site.created_at, Site.updated_at
            ).where(Site.user_id == user_id).offset(skip).limit(limit).order_by(desc(Site.created_at))
            result = await db.execute(query)
            sites = result.all()
            
            total_result = await db.execute(select(func.count(Site.id)).where(Site.user_id == user_id))
            published_result = await db.execute(
                select(func.count(Site.id)).where(and_(Site.user_id == user_id, Site.is_published == True))
            )

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
                'total_count': total_result.scalar() or 0,
                'published_count': published_result.scalar() or 0,
                'draft_count': (total_result.scalar() or 0) - (published_result.scalar() or 0)
            }
        except Exception as e:
            logger.error(f"Error getting user sites: {e}")
            raise
    

    @staticmethod
    async def get_site_by_id(db: AsyncSession, site_id: UUID, user_id: Optional[UUID] = None) -> Optional[SiteGenerationResponse]:
        try:
            query = select(Site).where(Site.id == site_id)
            if user_id:
                query = query.where(Site.user_id == user_id)
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            return SiteGenerationResponse.model_validate(site) if site else None
        except Exception as e:
            logger.error(f"Error getting site: {e}")
            raise
    
    @staticmethod
    async def get_site_by_slug(db: AsyncSession, slug: str, increment_views: bool = False) -> Optional[Site]:
        try:
            query = select(Site).where(and_(Site.slug == slug, Site.is_published == True, Site.is_public == True))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            if site and increment_views:
                site.view_count += 1
                await db.commit()
                await db.refresh(site)
            return site
        except Exception as e:
            logger.error(f"Error getting site by slug: {e}")
            raise
    
    @staticmethod
    async def update_site(db: AsyncSession, site_id: UUID, user_id: UUID, update_data: SiteUpdate) -> Optional[SiteGenerationResponse]:
        try:
            query = select(Site).where(and_(Site.id == site_id, Site.user_id == user_id))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            if not site:
                return None
            
            update_dict = update_data.model_dump(exclude_unset=True)
            for field, value in update_dict.items():
                if hasattr(site, field):
                    setattr(site, field, value)
            
            if update_data.is_published and not site.published_at:
                site.published_at = datetime.utcnow()
            
            site.updated_at = datetime.utcnow()
            await db.commit()
            await db.refresh(site)
            return SiteGenerationResponse.model_validate(site)
        except Exception as e:
            await db.rollback()
            logger.error(f"Error updating site: {e}")
            raise
    
    @staticmethod
    async def delete_site(db: AsyncSession, site_id: UUID, user_id: UUID) -> bool:
        try:
            query = select(Site).where(and_(Site.id == site_id, Site.user_id == user_id))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            if not site:
                return False
            await db.delete(site)
            await db.commit()
            logger.info(f"Site {site_id} deleted")
            return True
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting site: {e}")
            raise
    
    # Удаляю всё, что связано с аналитикой (SiteAnalytics, record_analytics_event, get_site_statistics и т.д.)
    # Оставляю только работу с RSVP: create_rsvp, get_rsvps
    @staticmethod
    async def create_rsvp(db: AsyncSession, site_id: UUID, rsvp_data: dict) -> RSVP:
        rsvp = RSVP(
            site_id=site_id,
            guest_name=rsvp_data.get("guest_name"),
            guest_email=rsvp_data.get("guest_email"),
            response=rsvp_data["response"],
            comment=rsvp_data.get("comment")
        )
        db.add(rsvp)
        await db.commit()
        await db.refresh(rsvp)
        return rsvp

    @staticmethod
    async def get_rsvps(db: AsyncSession, site_id: UUID) -> list[RSVP]:
        result = await db.execute(
            select(RSVP).where(RSVP.site_id == site_id)
        )
        return result.scalars().all()

    @staticmethod
    async def generate_and_save_site(db, user_id, event_json):
        from .site_generator import SiteGeneratorService
        return await SiteGeneratorService.generate_and_save_site(db, user_id, event_json)


sites_service = SitesService() 
