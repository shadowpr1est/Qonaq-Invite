#!/bin/sh

# Выход из скрипта при любой ошибке
set -e

# 1. Применяем миграции базы данных
echo "Applying database migrations..."
alembic upgrade head

# 2. Запускаем основную команду (переданную в CMD Docker-файла)
echo "Starting application..."
exec "$@" 