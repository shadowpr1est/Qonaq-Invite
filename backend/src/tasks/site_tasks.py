import logging
import uuid
from typing import Dict, Any, Optional
from celery import current_task
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime

from ..core.celery_app import celery_app
from ..services.site_generator import SiteGeneratorService
from ..models.sites import Site
from ..schemas.sites import SiteGenerationResponse
from ..utils.slug import generate_slug
from ..db.db import get_db_session

logger = logging.getLogger(__name__)

@celery_app.task(bind=True, name='src.tasks.site_tasks.generate_site_task')
def generate_site_task(self, user_id: str, event_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Фоновая задача для генерации сайта
    """
    try:
        # Обновляем статус задачи
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Начинаем генерацию сайта...', 'progress': 10}
        )
        
        # Создаем генератор
        generator = SiteGeneratorService()
        
        # Валидируем данные
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Валидация данных...', 'progress': 20}
        )
        
        errors = generator.validate_event_data(event_json)
        if errors:
            return {
                'status': 'error',
                'message': 'Ошибка валидации данных',
                'errors': errors
            }
        
        # Генерируем React компонент
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Генерация React компонента...', 'progress': 40}
        )
        
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        
        try:
            react_code = loop.run_until_complete(generator.generate_react_component(event_json))
            
            # Генерируем HTML
            self.update_state(
                state='PROGRESS',
                meta={'status': 'Генерация HTML...', 'progress': 60}
            )
            
            html_code = loop.run_until_complete(generator.generate_html(event_json))
        finally:
            loop.close()
        
        # Сохраняем в базу данных
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Сохранение в базу данных...', 'progress': 80}
        )
        
        # Создаем сессию базы данных
        db_session = get_db_session()
        
        try:
            # Получаем существующие slug'и
            result = db_session.execute(select(Site.slug))
            existing_slugs = [row[0] for row in result.fetchall()]
            
            # Генерируем уникальный slug
            title = event_json.get('content_details', {}).get('event_title', 'untitled')
            slug = generate_slug(title, existing_slugs)
            
            # Создаем сайт
            site = Site(
                id=uuid.uuid4(),
                user_id=uuid.UUID(user_id),
                title=title,
                slug=slug,
                meta_description=event_json.get('meta_description', ''),
                event_type=event_json.get('event_type', ''),
                theme=event_json.get('theme', 'modern'),
                site_structure={
                    "react_component_code": react_code,
                    "event_json": event_json
                },
                html_content=html_code,
                content_details=event_json,
                color_preferences=event_json.get('color_preferences', 'elegant_neutrals'),
                style_preferences=event_json.get('style_preferences'),
                target_audience=event_json.get('target_audience'),
                is_published=False,
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
                view_count=0,
                share_count=0
            )
            
            db_session.add(site)
            db_session.commit()
            db_session.refresh(site)
            
            # Обновляем HTML с правильным site_id
            event_json["id"] = str(site.id)
            
            # Создаем новый цикл событий для второго вызова
            loop2 = asyncio.new_event_loop()
            asyncio.set_event_loop(loop2)
            try:
                html_code = loop2.run_until_complete(generator.generate_html(event_json))
            finally:
                loop2.close()
                
            site.html_content = html_code
            db_session.commit()
            db_session.refresh(site)
            
            self.update_state(
                state='SUCCESS',
                meta={'status': 'Сайт успешно создан!', 'progress': 100}
            )
            
            return {
                'status': 'success',
                'site_id': str(site.id),
                'slug': site.slug,
                'title': site.title,
                'message': 'Сайт успешно создан'
            }
            
        except Exception as e:
            db_session.rollback()
            logger.error(f"Database error in generate_site_task: {e}")
            return {
                'status': 'error',
                'message': f'Ошибка базы данных: {str(e)}'
            }
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in generate_site_task: {e}")
        return {
            'status': 'error',
            'message': f'Ошибка генерации сайта: {str(e)}'
        }

@celery_app.task(bind=True, name='src.tasks.site_tasks.generate_preview_task')
def generate_preview_task(self, event_json: Dict[str, Any]) -> Dict[str, Any]:
    """
    Фоновая задача для генерации предварительного просмотра
    """
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Генерация предварительного просмотра...', 'progress': 50}
        )
        
        generator = SiteGeneratorService()
        
        # Генерируем HTML для предварительного просмотра
        import asyncio
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        try:
            html_code = loop.run_until_complete(generator.generate_html(event_json))
        finally:
            loop.close()
        
        # Сохраняем во временный файл
        filename = f"preview_{uuid.uuid4().hex[:8]}.html"
        filepath = generator.save_to_file(html_code, filename)
        
        self.update_state(
            state='SUCCESS',
            meta={'status': 'Предварительный просмотр готов!', 'progress': 100}
        )
        
        return {
            'status': 'success',
            'preview_url': f"/preview/{filename}",
            'filepath': filepath
        }
        
    except Exception as e:
        logger.error(f"Error in generate_preview_task: {e}")
        return {
            'status': 'error',
            'message': f'Ошибка генерации предварительного просмотра: {str(e)}'
        }

@celery_app.task(bind=True, name='src.tasks.site_tasks.update_site_task')
def update_site_task(self, site_id: str, update_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Фоновая задача для обновления сайта
    """
    try:
        self.update_state(
            state='PROGRESS',
            meta={'status': 'Обновление сайта...', 'progress': 50}
        )
        
        db_session = get_db_session()
        
        try:
            # Получаем сайт
            result = db_session.execute(select(Site).where(Site.id == uuid.UUID(site_id)))
            site = result.scalar_one_or_none()
            
            if not site:
                return {
                    'status': 'error',
                    'message': 'Сайт не найден'
                }
            
            # Обновляем данные
            for field, value in update_data.items():
                if hasattr(site, field):
                    setattr(site, field, value)
            
            site.updated_at = datetime.utcnow()
            db_session.commit()
            db_session.refresh(site)
            
            self.update_state(
                state='SUCCESS',
                meta={'status': 'Сайт успешно обновлен!', 'progress': 100}
            )
            
            return {
                'status': 'success',
                'site_id': str(site.id),
                'message': 'Сайт успешно обновлен'
            }
            
        except Exception as e:
            db_session.rollback()
            logger.error(f"Database error in update_site_task: {e}")
            return {
                'status': 'error',
                'message': f'Ошибка базы данных: {str(e)}'
            }
        finally:
            db_session.close()
            
    except Exception as e:
        logger.error(f"Error in update_site_task: {e}")
        return {
            'status': 'error',
            'message': f'Ошибка обновления сайта: {str(e)}'
        } 