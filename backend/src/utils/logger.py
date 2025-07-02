import logging
import sys
from typing import Any
from src.core.config import settings

# Настройка логирования для продакшна
def setup_logger(name: str) -> logging.Logger:
    """
    Создает настроенный логгер для продакшна
    В development режиме выводит в консоль
    В production режиме логирует только errors и warnings
    """
    logger = logging.getLogger(name)
    
    if not logger.handlers:
        # Определяем уровень логирования
        if settings.ENVIRONMENT == "development":
            log_level = logging.DEBUG if settings.DEBUG else logging.INFO
        else:
            log_level = logging.WARNING
        
        logger.setLevel(log_level)
        
        # Создаем handler
        handler = logging.StreamHandler(sys.stdout)
        handler.setLevel(log_level)
        
        # Форматирование
        if settings.ENVIRONMENT == "production":
            # Структурированные логи для продакшна
            formatter = logging.Formatter(
                '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}'
            )
        else:
            # Читаемые логи для разработки
            formatter = logging.Formatter(
                '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
            )
        
        handler.setFormatter(formatter)
        logger.addHandler(handler)
    
    return logger

# Глобальный логгер для приложения
app_logger = setup_logger("invitly")

def log_info(message: str, **kwargs: Any) -> None:
    """Логирование информационных сообщений"""
    if kwargs:
        message = f"{message} - {kwargs}"
    app_logger.info(message)

def log_error(message: str, error: Exception = None, **kwargs: Any) -> None:
    """Логирование ошибок"""
    if error:
        message = f"{message}: {str(error)}"
    if kwargs:
        message = f"{message} - {kwargs}"
    app_logger.error(message)

def log_warning(message: str, **kwargs: Any) -> None:
    """Логирование предупреждений"""
    if kwargs:
        message = f"{message} - {kwargs}"
    app_logger.warning(message)

def log_debug(message: str, **kwargs: Any) -> None:
    """Логирование отладочной информации (только в development)"""
    if kwargs:
        message = f"{message} - {kwargs}"
    app_logger.debug(message) 