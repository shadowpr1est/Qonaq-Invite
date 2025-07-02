import re
import logging
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from sqlalchemy.orm import selectinload

from ..models.sites import Site, SiteAnalytics
from ..users.models import User
from ..schemas.sites import (
    SiteGenerationRequest, SiteGenerationResponse, SitePreview, 
    SiteUpdate, SiteStatistics, UserSitesResponse, SiteAnalyticsEvent
)
from .site_generator import site_generator, SiteGenerationRequest as GeneratorRequest, StatusCallback

logger = logging.getLogger(__name__)


class SitesService:
    """Service for managing user sites"""
    
    @staticmethod
    def _generate_slug(title: str, existing_slugs: List[str] = None) -> str:
        """Generate URL-friendly slug from title"""
        # Convert to lowercase and replace spaces/special chars
        slug = re.sub(r'[^\w\s-]', '', title.lower())
        slug = re.sub(r'[-\s]+', '-', slug)
        slug = slug.strip('-')
        
        # Ensure uniqueness
        if existing_slugs:
            original_slug = slug
            counter = 1
            while slug in existing_slugs:
                slug = f"{original_slug}-{counter}"
                counter += 1
        
        return slug
    
    @staticmethod
    async def create_site(
        db: AsyncSession,
        user_id: UUID,
        request: SiteGenerationRequest,
        status_callback: StatusCallback = None
    ) -> SiteGenerationResponse:
        """Generate and save new site with real-time status updates"""
        try:
            logger.info(f"Creating site for user {user_id}")
            
            # Convert request to generator format
            generator_request = GeneratorRequest(
                event_type=request.event_type,
                theme=request.theme,
                content_details=request.content_details,
                color_preferences=request.color_preferences,
                style_preferences=request.style_preferences,
                target_audience=request.target_audience
            )
            
            # Generate React site structure with OpenAI and status updates
            logger.info("Generating React site structure with OpenAI")
            react_site_structure = await site_generator.generate_react_site_structure(
                generator_request, 
                status_callback
            )
            
            # Generate React component code
            logger.info("Generating React component code")
            react_content = await site_generator.generate_react_page(react_site_structure)
            
            # Generate HTML preview for iframe display
            logger.info("Generating HTML preview for iframe display")
            html_preview = await site_generator.generate_html_preview(react_site_structure)
            
            # Get existing slugs to ensure uniqueness
            result = await db.execute(select(Site.slug))
            existing_slugs = [row[0] for row in result.fetchall()]
            
            # Create slug from generated title
            slug = SitesService._generate_slug(react_site_structure.title, existing_slugs)
            
            # Create site record with React data and HTML preview
            site_structure_data = react_site_structure.model_dump()
            site_structure_data['react_component_code'] = react_content  # Store React code in structure
            
            site = Site(
                user_id=user_id,
                title=react_site_structure.title,
                slug=slug,
                meta_description=react_site_structure.meta_description,
                event_type=request.event_type,
                theme=request.theme,
                site_structure=site_structure_data,
                html_content=html_preview,  # HTML preview for iframe display
                content_details=request.content_details,  # Store original form data
                color_preferences=request.color_preferences,
                style_preferences=request.style_preferences,
                target_audience=request.target_audience,
                is_published=False  # Draft by default
            )
            
            db.add(site)
            await db.commit()
            await db.refresh(site)
            
            logger.info(f"Site created successfully with ID: {site.id}")
            return SiteGenerationResponse.model_validate(site)
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error creating site: {e}")
            raise
    
    @staticmethod
    async def get_user_sites(
        db: AsyncSession,
        user_id: UUID,
        skip: int = 0,
        limit: int = 100
    ) -> UserSitesResponse:
        """Get all sites for a user"""
        try:
            # Get sites with pagination
            query = select(Site).where(Site.user_id == user_id).offset(skip).limit(limit).order_by(desc(Site.created_at))
            result = await db.execute(query)
            sites = result.scalars().all()
            
            # Get counts
            total_query = select(func.count(Site.id)).where(Site.user_id == user_id)
            published_query = select(func.count(Site.id)).where(
                and_(Site.user_id == user_id, Site.is_published == True)
            )
            
            total_result = await db.execute(total_query)
            published_result = await db.execute(published_query)
            
            total_count = total_result.scalar() or 0
            published_count = published_result.scalar() or 0
            draft_count = total_count - published_count
            
            site_previews = [SitePreview.model_validate(site) for site in sites]
            
            return UserSitesResponse(
                sites=site_previews,
                total_count=total_count,
                published_count=published_count,
                draft_count=draft_count
            )
            
        except Exception as e:
            logger.error(f"Error getting user sites: {e}")
            raise
    
    @staticmethod
    async def get_site_by_id(
        db: AsyncSession,
        site_id: UUID,
        user_id: Optional[UUID] = None
    ) -> Optional[SiteGenerationResponse]:
        """Get site by ID"""
        try:
            query = select(Site).where(Site.id == site_id)
            if user_id:
                query = query.where(Site.user_id == user_id)
            
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            
            if site:
                return SiteGenerationResponse.model_validate(site)
            return None
            
        except Exception as e:
            logger.error(f"Error getting site: {e}")
            raise
    
    @staticmethod
    async def get_site_by_slug(
        db: AsyncSession,
        slug: str,
        increment_views: bool = False
    ) -> Optional[Site]:
        """Get site by slug for public viewing"""
        try:
            query = select(Site).where(
                and_(Site.slug == slug, Site.is_published == True, Site.is_public == True)
            )
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
    async def update_site(
        db: AsyncSession,
        site_id: UUID,
        user_id: UUID,
        update_data: SiteUpdate
    ) -> Optional[SiteGenerationResponse]:
        """Update site"""
        try:
            query = select(Site).where(and_(Site.id == site_id, Site.user_id == user_id))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            
            if not site:
                return None
            
            # Update fields
            update_dict = update_data.model_dump(exclude_unset=True)
            for field, value in update_dict.items():
                if hasattr(site, field):
                    setattr(site, field, value)
            
            # If publishing for first time, set published_at
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
    async def delete_site(
        db: AsyncSession,
        site_id: UUID,
        user_id: UUID
    ) -> bool:
        """Delete site"""
        try:
            query = select(Site).where(and_(Site.id == site_id, Site.user_id == user_id))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            
            if not site:
                return False
            
            await db.delete(site)
            await db.commit()
            
            logger.info(f"Site {site_id} deleted successfully")
            return True
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error deleting site: {e}")
            raise
    
    @staticmethod
    async def record_analytics_event(
        db: AsyncSession,
        site_id: UUID,
        event: SiteAnalyticsEvent,
        ip_address: Optional[str] = None
    ) -> None:
        """Record analytics event"""
        try:
            analytics = SiteAnalytics(
                site_id=site_id,
                event_type=event.event_type,
                event_data=event.event_data,
                user_agent=event.user_agent,
                ip_address=ip_address,
                referrer=event.referrer
            )
            
            db.add(analytics)
            await db.commit()
            
        except Exception as e:
            await db.rollback()
            logger.error(f"Error recording analytics event: {e}")
            # Don't raise - analytics shouldn't break main functionality
    
    @staticmethod
    async def get_site_statistics(
        db: AsyncSession,
        site_id: UUID,
        user_id: UUID
    ) -> Optional[SiteStatistics]:
        """Get site analytics statistics"""
        try:
            # Verify ownership
            query = select(Site).where(and_(Site.id == site_id, Site.user_id == user_id))
            result = await db.execute(query)
            site = result.scalar_one_or_none()
            
            if not site:
                return None
            
            # Get analytics data
            analytics_query = select(SiteAnalytics).where(SiteAnalytics.site_id == site_id)
            analytics_result = await db.execute(analytics_query)
            analytics = analytics_result.scalars().all()
            
            # Calculate statistics
            total_views = len([a for a in analytics if a.event_type == 'view'])
            unique_views = len(set(a.ip_address for a in analytics if a.event_type == 'view' and a.ip_address))
            total_shares = len([a for a in analytics if a.event_type == 'share'])
            
            # TODO: Implement more detailed analytics
            return SiteStatistics(
                total_views=total_views,
                unique_views=unique_views,
                total_shares=total_shares,
                top_referrers=[],
                view_timeline=[],
                geographic_data=[]
            )
            
        except Exception as e:
            logger.error(f"Error getting site statistics: {e}")
            raise


# Global service instance
sites_service = SitesService() 