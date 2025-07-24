import os
from celery import Celery
from .config import settings

# Создаем экземпляр Celery
celery_app = Celery(
    "invitly",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=['src.tasks.site_tasks']
)

# Конфигурация Celery
celery_app.conf.update(
    # Настройки задач
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    
    # Настройки воркеров
    worker_prefetch_multiplier=1,
    worker_max_tasks_per_child=1000,
    
    # Настройки очередей
    task_routes={
        'src.tasks.site_tasks.generate_site_task': {'queue': 'site_generation'},
        'src.tasks.site_tasks.generate_preview_task': {'queue': 'preview_generation'},
    },
    
    # Настройки таймаутов
    task_soft_time_limit=300,  # 5 минут
    task_time_limit=600,        # 10 минут
    
    # Настройки повторных попыток
    task_acks_late=True,
    worker_disable_rate_limits=False,
    
    # Настройки результатов
    result_expires=3600,  # 1 час
    
    # Настройки мониторинга
    worker_send_task_events=True,
    task_send_sent_event=True,
)

# Автоматическое обнаружение задач
celery_app.autodiscover_tasks()

if __name__ == '__main__':
    celery_app.start() 