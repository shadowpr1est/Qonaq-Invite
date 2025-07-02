# 🚀 **PRODUCTION DEPLOYMENT GUIDE**

## **ВСЕ ГОТОВО ДЛЯ ПРОДАКШНА!** ✅

Альфред исправил все критические недочеты. Система готова к запуску.

---

## 🔧 **ЧТО БЫЛО ИСПРАВЛЕНО:**

### **Backend Исправления:**
- ✅ **DEBUG = False** для продакшна  
- ✅ **RSA ключи созданы** (`backend/src/keys/`)
- ✅ **CORS настроен** для продакшн домена
- ✅ **Типы исправлены** в auth endpoints
- ✅ **Продакшн логгер** создан
- ✅ **Dockerfile** оптимизирован  
- ✅ **Docker Compose** для продакшна

### **Frontend Исправления:**
- ✅ **Console.log** убраны из продакшна
- ✅ **API URLs** настроены через переменные
- ✅ **WebSocket errors** подавлены в продакшне
- ✅ **Production logger** добавлен

### **DevOps:**
- ✅ **Nginx конфигурация** с SSL, rate limiting, security headers
- ✅ **Автоматический деплой скрипт**
- ✅ **Health checks** для всех сервисов
- ✅ **Database migrations** автоматизированы

---

## 🚀 **БЫСТРЫЙ ЗАПУСК:**

### **1. Настройка переменных окружения:**
```bash
# Создайте .env файл в корне проекта:
cp backend/.env.example .env

# Заполните необходимые параметры:
POSTGRES_USER=your_db_user
POSTGRES_PASSWORD=secure_password_123
POSTGRES_DB=invitly_prod
OPENAI_API_KEY=sk-your-openai-key
PRODUCTION_DOMAIN=yourdomain.com
```

### **2. SSL Сертификаты:**
```bash
# Для real SSL сертификатов (Let's Encrypt):
mkdir -p nginx/ssl
# Поместите ваши cert.pem и key.pem в nginx/ssl/

# Или скрипт сгенерирует самоподписанные для тестирования
```

### **3. Запуск:**
```bash
# Дайте права на выполнение
chmod +x deploy.sh

# Запустите автоматический деплой
./deploy.sh
```

**ВСЕ! Система запустится автоматически** 🎉

---

## 🌐 **ДОСТУП К ПРИЛОЖЕНИЮ:**

- **Frontend:** `https://yourdomain.com`
- **Backend API:** `https://yourdomain.com/health`
- **Swagger Docs:** ОТКЛЮЧЕНЫ в продакшне (безопасность)

---

## 📊 **МОНИТОРИНГ:**

```bash
# Просмотр логов
docker-compose -f docker-compose.prod.yml logs -f

# Статус сервисов  
docker-compose -f docker-compose.prod.yml ps

# Перезапуск сервиса
docker-compose -f docker-compose.prod.yml restart backend
```

---

## 🔐 **БЕЗОПАСНОСТЬ:**

### **Что уже настроено:**
- ✅ **Rate limiting** (10 req/s API, 5 req/s auth)
- ✅ **HTTPS redirect** с HTTP на HTTPS
- ✅ **Security headers** (HSTS, XSS Protection, etc.)
- ✅ **CORS** ограничен продакшн доменом
- ✅ **JWT RS256** с RSA ключами
- ✅ **Пароли bcrypt** с 12 rounds
- ✅ **Swagger/ReDoc** отключены в продакшне

### **Рекомендации:**
- 🔐 Используйте **real SSL сертификаты** (Let's Encrypt)
- 🔑 Создайте **strong database пароли**
- 🚫 **Закройте порты** 5432, 8000 через firewall
- 📊 Настройте **мониторинг** (Prometheus/Grafana)

---

## 🗄️ **DATABASE:**

```bash
# Backup базы данных
docker-compose -f docker-compose.prod.yml exec db pg_dump -U $POSTGRES_USER $POSTGRES_DB > backup.sql

# Restore из backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U $POSTGRES_USER $POSTGRES_DB < backup.sql

# Запуск миграций
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 🚨 **TROUBLESHOOTING:**

### **Проблема: Backend не стартует**
```bash
# Проверьте логи
docker-compose -f docker-compose.prod.yml logs backend

# Проверьте .env файл
cat .env

# Проверьте JWT ключи
ls -la backend/src/keys/
```

### **Проблема: Frontend не загружается**
```bash
# Проверьте nginx логи
docker-compose -f docker-compose.prod.yml logs nginx

# Пересоберите frontend
cd frontend/inviteai-spark-invites && npm run build
```

### **Проблема: Database connection**
```bash
# Проверьте postgres
docker-compose -f docker-compose.prod.yml logs db

# Проверьте подключение
docker-compose -f docker-compose.prod.yml exec db psql -U $POSTGRES_USER $POSTGRES_DB
```

---

## 🔄 **UPDATES:**

```bash
# Обновление кода
git pull origin main

# Пересборка и перезапуск
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Запуск миграций
docker-compose -f docker-compose.prod.yml exec backend alembic upgrade head
```

---

## 🎯 **PERFORMANCE:**

### **Настройки уже оптимизированы:**
- ✅ **Multi-stage Docker** builds
- ✅ **Nginx gzip** compression  
- ✅ **Static assets** caching (1 year)
- ✅ **Connection pooling** для PostgreSQL
- ✅ **4 workers** для uvicorn
- ✅ **Healthchecks** для всех сервисов

### **Рекомендации:**
- 📈 Добавьте **Redis** для кеширования
- 🔄 Настройте **CDN** для статики  
- 📊 Мониторинг **APM** (New Relic, DataDog)

---

## ✅ **ГОТОВО К ПРОДАКШНУ!**

**Все критические проблемы устранены. Система безопасна, оптимизирована и готова к production использованию.**

🎉 **Успешного запуска!** 