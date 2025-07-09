import logging
import sys
from logging.config import dictConfig

# Явная конфигурация для уровня DEBUG
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "default": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        },
    },
    "handlers": {
        "default": {
            "formatter": "default",
            "class": "logging.StreamHandler",
            "stream": "ext://sys.stdout",
        },
    },
    "root": {
        "level": "DEBUG",
        "handlers": ["default"],
    },
}

def setup_logging():
    """
    Применяет конфигурацию логирования ко всему приложению.
    """
    dictConfig(LOGGING_CONFIG) 