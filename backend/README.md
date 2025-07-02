# FluentAI Backend - Clean Authentication API

Упрощенный и элегантный backend для FluentAI, построенный по лучшим практикам FastAPI и Context7.

## 🏗️ Архитектура

Следует модульной структуре FastAPI с разделением по доменам:

```
backend/src/
├── api/v1/         # API маршруты
│   ├── auth.py     # Аутентификация
│   └── users.py    # Управление пользователями
├── core/           # Основные компоненты
│   ├── config.py   # Конфигурация
│   ├── security.py # Безопасность
│   └── exceptions.py # Обработка ошибок
├── users/          # Домен пользователей
│   ├── models.py   # SQLAlchemy модели
│   ├── schemas.py  # Pydantic схемы
│   └── service.py  # Бизнес-логика
├── dependencies/   # Зависимости FastAPI
└── db/            # База данных
```

## 🚀 API Endpoints

### Аутентификация (`/auth`)
- `POST /auth/register` - Регистрация пользователя
- `POST /auth/login` - Вход пользователя  
- `POST /auth/refresh` - Обновление токена
- `POST /auth/logout` - Выход пользователя
- `GET /auth/profile` - Профиль пользователя

### Пользователи (`/user`)
- `GET /user/profile` - Получить профиль
- `PUT /user/profile` - Обновить профиль
- `POST /user/change-password` - Сменить пароль

## 🔧 Технологии

- **FastAPI** - современный веб-фреймворк
- **SQLAlchemy** - ORM с поддержкой async
- **PostgreSQL** - база данных
- **JWT** - аутентификация
- **Pydantic** - валидация данных
- **Bcrypt** - хеширование паролей

## 📦 Установка

```bash
cd backend
pip install -r requirements.txt
```

## ⚙️ Конфигурация

Создайте `.env` файл:

```env
PROJECT_NAME="FluentAI API"
ENVIRONMENT="development"
DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/fluentai"
JWT_SECRET_KEY="your-secret-key"
ALLOWED_HOSTS="http://localhost:3000,http://localhost:5173"
```

## 🏃‍♂️ Запуск

```bash
uvicorn src.main:app --reload --host 0.0.0.0 --port 8000
```

## 📋 Особенности

- ✅ **Синхронизировано с frontend** - API endpoints соответствуют ожиданиям React приложения
- ✅ **Машинно-читаемые ошибки** - структурированные ответы для AI/фронтенда
- ✅ **Типизация везде** - полная поддержка TypeScript типов
- ✅ **Dependency Injection** - чистая архитектура зависимостей
- ✅ **Лучшие практики FastAPI** - следование Context7 рекомендациям
- ✅ **Производительность** - оптимизированные запросы и кеширование

## 🔄 Изменения

### Удалено
- Сложные речевые API (избыточные для MVP)
- Дублированные endpoints  
- Избыточные схемы и модели
- Ненужные зависимости

### Добавлено
- Чистая структура проекта
- Синхронизация с frontend типами
- Proper error handling
- Модульная конфигурация

## 📖 Документация

API документация доступна по адресу `/docs` в режиме разработки. 