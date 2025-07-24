#!/usr/bin/env python3
"""
Celery Worker для Invitly
Запускает фоновые задачи для генерации сайтов
"""

import os
import sys
from pathlib import Path

# Добавляем путь к src в PYTHONPATH
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.core.celery_app import celery_app

if __name__ == "__main__":
    celery_app.start() 