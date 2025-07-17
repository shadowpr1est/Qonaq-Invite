# Локальное развертывание проекта Invitly

Это руководство поможет вам быстро настроить и запустить проект Invitly на вашем локальном компьютере с помощью Docker.

## Предварительные требования

- **Docker**: [Установите Docker](https://docs.docker.com/get-docker/)
- **Docker Compose**: Обычно устанавливается вместе с Docker.

## Шаг 1: Создание файла переменных окружения

В корневой папке проекта создайте файл с именем `.env` и скопируйте в него следующее содержимое. Этот файл содержит все необходимые настройки для локального запуска.

```env
# PostgreSQL Database Settings
POSTGRES_USER=invitly_user
POSTGRES_PASSWORD=invitly_password
POSTGRES_DB=invitly_db

# Backend Settings
# IMPORTANT: For local development, keep ENVIRONMENT as 'development'
ENVIRONMENT=development
DEBUG=true

# OpenAI API Key (Required for site generation)
# Get your key from https://platform.openai.com/api-keys
OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE

# Domain and Nginx Settings
# For local access, use localhost. For production, use your domain.
PRODUCTION_DOMAIN=localhost
SERVER_NAME=localhost
```

**Важно:**
- Замените `YOUR_OPENAI_API_KEY_HERE` на ваш реальный ключ от OpenAI.

## Шаг 2: Сборка и запуск контейнеров

Откройте терминал в корневой папке проекта и выполните следующую команду:

```bash
docker-compose up --build
```

Эта команда скачает необходимые образы, соберет контейнеры для бэкенда и фронтенда и запустит все сервисы. Первый запуск может занять несколько минут.

## Шаг 3: Доступ к приложению

После успешного запуска всех контейнеров вы сможете получить доступ к приложению в вашем браузере:

- **Frontend**: [http://localhost](http://localhost) (или [http://localhost:80](http://localhost:80))
- **Backend API (документация)**: [http://localhost:8000/docs](http://localhost:8000/docs)

## Управление контейнерами

### Просмотр логов

Чтобы посмотреть логи конкретного сервиса (например, бэкенда), откройте новый терминал и выполните:

```bash
# Показать логи бэкенда в реальном времени
docker-compose logs -f backend

# Показать логи фронтенда
docker-compose logs -f frontend
```

Это особенно полезно для отладки. После наших последних изменений в логах бэкенда вы увидите подробные `DEBUG` сообщения.

### Остановка проекта

Чтобы остановить все запущенные контейнеры, нажмите `Ctrl + C` в терминале, где вы запускали `docker-compose up`. Затем выполните команду:

```bash
docker-compose down
```

Эта команда остановит и удалит контейнеры, но сохранит данные базы данных в volume.

### Полная очистка

Чтобы остановить контейнеры и удалить все данные (включая базу данных), используйте:

```bash
docker-compose down -v
``` 