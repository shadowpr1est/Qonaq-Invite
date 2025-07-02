# Multi-stage build для React приложения
FROM node:18-alpine AS builder

WORKDIR /app

# Копируем package.json и package-lock.json
COPY inviteai-spark-invites/package*.json ./

# Устанавливаем зависимости
RUN npm ci --silent

# Копируем исходный код
COPY inviteai-spark-invites/ ./

# Собираем приложение
RUN npm run build

# Production стадия
FROM nginx:alpine

# Копируем собранное приложение
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем nginx конфигурацию для SPA
COPY nginx-spa.conf /etc/nginx/conf.d/default.conf

# Порт 80
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 