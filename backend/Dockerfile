# Multi-stage build для оптимизации размера образа
FROM python:3.11-slim as builder

# Установка системных зависимостей
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Создание виртуального окружения
RUN python -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Копирование и установка зависимостей
COPY requirements.txt .
# RUN pip install --no-cache-dir --upgrade pip && \
RUN pip install --no-cache-dir -r requirements.txt

# Production stage
FROM python:3.11-slim

# Установка только runtime зависимостей
RUN apt-get update && apt-get install -y \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Копирование виртуального окружения
COPY --from=builder /opt/venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"

# Создание пользователя приложения
RUN useradd --create-home --shell /bin/bash app
USER app
WORKDIR /home/app

# Копирование кода приложения
COPY --chown=app:app . .

# Создание директории для ключей если их нет
RUN mkdir -p src/keys

# Переменные окружения для продакшна
ENV PYTHONPATH=/home/app
ENV PYTHONUNBUFFERED=1
ENV ENVIRONMENT=production
ENV DEBUG=false

# Healthcheck
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')" || exit 1

# Expose port
EXPOSE 8000

# Запуск приложения
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"] 