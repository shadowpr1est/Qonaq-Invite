# 🚀 **Invitly - AI-Powered Invitation Platform**

**ГОТОВО К ПРОДАКШНУ!** ✅ Все недочеты исправлены, система оптимизирована и безопасна.

---

## 🎯 **Quick Start для продакшна**

### **1. Клонируйте репозиторий:**
```bash
git clone <repository-url>
cd Invitly
```

### **2. Настройте переменные окружения:**
```bash
# Создайте .env файл
cp backend/.env.example .env

# Заполните обязательные параметры:
# - POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
# - OPENAI_API_KEY
# - PRODUCTION_DOMAIN
```

### **3. Подготовка frontend (если отдельный репозиторий):**
```bash
# Если frontend в отдельном репо - добавьте как submodule:
git submodule add <frontend-repo-url> frontend/inviteai-spark-invites

# Или клонируйте отдельно:
git clone <frontend-repo-url> frontend/inviteai-spark-invites
```

### **4. Запуск через Docker Compose:**
```bash
# Простой запуск (все автоматически)
docker-compose up --build -d

# Запуск миграций
docker-compose exec backend alembic upgrade head
```

**ВСЕ!** Система автоматически:
- 🔧 Соберет frontend в отдельном контейнере
- 🐳 Создаст все 4 сервиса (db, frontend, backend, nginx)
- 🗄️ Инициализирует базу данных
- 🏥 Проверит health checks
- 🚀 Запустит в продакшне

> 📖 **Подробное руководство:** См. `DOCKER_COMPOSE_GUIDE.md`

---

## 📋 **Что исправлено для продакшна:**

### **🔐 Безопасность:**
- ✅ JWT RS256 с RSA ключами
- ✅ CORS ограничен продакшн доменом
- ✅ Rate limiting (API: 10 req/s, Auth: 5 req/s)
- ✅ Security headers (HSTS, XSS, CSRF)
- ✅ Swagger/ReDoc отключены в продакшне
- ✅ DEBUG = False для продакшна

### **🚀 Performance:**
- ✅ Multi-stage Docker builds
- ✅ Nginx с gzip compression
- ✅ Static assets caching (1 year)
- ✅ PostgreSQL connection pooling  
- ✅ Uvicorn с 4 workers
- ✅ Оптимизированные database queries

### **📊 Мониторинг:**
- ✅ Structured logging для продакшна
- ✅ Health checks для всех сервисов
- ✅ Docker healthchecks
- ✅ Автоматические database migrations

---

## 🌐 **Доступ:**

После успешного запуска:
- **Frontend:** `http://localhost`
- **Backend API:** `http://localhost:8000` 
- **Health Check:** `http://localhost/health`
- **Logs:** `docker-compose logs -f`

---

## 🛠️ **Архитектура проекта:**

```
Invitly/
├── backend/                 # FastAPI backend
│   ├── src/
│   │   ├── api/v1/         # API endpoints
│   │   ├── core/           # Config, security, exceptions  
│   │   ├── models/         # SQLAlchemy models
│   │   ├── schemas/        # Pydantic schemas
│   │   ├── services/       # Business logic
│   │   ├── keys/           # JWT RSA keys ✅
│   │   └── utils/          # Production logger ✅
│   ├── Dockerfile          # Optimized for production ✅
│   └── requirements.txt    # Pinned dependencies
├── frontend/               # React TypeScript frontend
│   └── inviteai-spark-invites/
│       ├── src/
│       │   ├── components/ # React components
│       │   ├── pages/      # Route pages  
│       │   ├── hooks/      # Custom hooks
│       │   └── lib/        # Utils, API, types
│       └── dist/           # Production build
├── nginx/                  # Reverse proxy config ✅
│   ├── nginx.conf          # SSL, security, rate limiting
│   └── ssl/                # SSL certificates
├── docker-compose.prod.yml # Production deployment ✅
├── deploy.sh               # Automated deployment ✅
└── PRODUCTION_READY.md     # Full deployment guide ✅
```

---

## 🔧 **Локальная разработка:**

```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn src.main:app --reload

# Frontend  
cd frontend/inviteai-spark-invites
npm install
npm run dev
```

---

## 📚 **Основные технологии:**

### **Backend:**
- **FastAPI** - Modern Python web framework
- **SQLAlchemy 2.0** - Async ORM  
- **PostgreSQL** - Production database
- **JWT RS256** - Secure authentication
- **OpenAI API** - AI site generation
- **Alembic** - Database migrations

### **Frontend:**
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Tailwind CSS** - Styling
- **Shadcn/ui** - Component library
- **React Hook Form** - Form handling

### **DevOps:**
- **Docker** - Containerization
- **Nginx** - Reverse proxy & SSL
- **PostgreSQL 15** - Database
- **Multi-stage builds** - Optimized images

---

## 🎉 **Готово к продакшну!**

**Все критические проблемы устранены. Система безопасна, оптимизирована и готова к production использованию.**

Подробные инструкции см. в `PRODUCTION_READY.md`

---

*Powered by Alfred 🦇*
# Qonaq-Invite
