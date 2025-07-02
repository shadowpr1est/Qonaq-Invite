#!/bin/bash

# 🚀 Invitly Production Deployment Script
# Автоматическое развертывание в продакшне

set -e  # Выход при любой ошибке

echo "🚀 Starting Invitly Production Deployment..."

# Проверка наличия .env файла
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found!"
    echo "📝 Please create .env file based on .env.example"
    exit 1
fi

# Проверка наличия SSL сертификатов
if [ ! -f "nginx/ssl/cert.pem" ] || [ ! -f "nginx/ssl/key.pem" ]; then
    echo "⚠️  Warning: SSL certificates not found in nginx/ssl/"
    echo "🔧 Generating self-signed certificates for development..."
    mkdir -p nginx/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout nginx/ssl/key.pem \
        -out nginx/ssl/cert.pem \
        -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
    echo "✅ Self-signed certificates generated"
fi

# Проверка наличия JWT ключей
if [ ! -f "backend/src/keys/private_key.pem" ] || [ ! -f "backend/src/keys/public_key.pem" ]; then
    echo "⚠️  Warning: JWT keys not found!"
    echo "🔧 JWT keys should already be generated. Please check backend/src/keys/"
    exit 1
fi

echo "📦 Building frontend..."
# Проверяем, есть ли frontend локально
if [ -d "frontend/inviteai-spark-invites" ]; then
    echo "🏗️ Building frontend from local directory..."
    cd frontend/inviteai-spark-invites
    npm ci --only=production
    npm run build
    cd ../..
else
    echo "❌ Frontend directory not found!"
    echo "💡 Options:"
    echo "   1. Git clone frontend separately: git clone <frontend-repo> frontend/inviteai-spark-invites"
    echo "   2. Setup as git submodule: git submodule add <frontend-repo> frontend/inviteai-spark-invites"
    echo "   3. Copy pre-built dist/ to frontend/dist/"
    exit 1
fi

echo "🔧 Copying frontend build to deployment directory..."
mkdir -p frontend/dist
cp -r frontend/inviteai-spark-invites/dist/* frontend/dist/

echo "🐳 Starting Docker containers..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🏥 Running health checks..."
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo "✅ Backend health check passed"
else
    echo "❌ Backend health check failed"
    echo "📋 Checking logs..."
    docker-compose -f docker-compose.prod.yml logs backend
    exit 1
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend health check passed"
else
    echo "❌ Frontend health check failed"
    echo "📋 Checking nginx logs..."
    docker-compose -f docker-compose.prod.yml logs nginx
    exit 1
fi

echo "🔄 Running database migrations..."
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head

echo "🎉 Deployment completed successfully!"
echo "🌐 Frontend: http://localhost"
echo "🔧 Backend API: http://localhost/health"
echo "📊 View logs: docker-compose -f docker-compose.prod.yml logs -f"

# Показать статус контейнеров
echo "📋 Container status:"
docker-compose -f docker-compose.prod.yml ps 