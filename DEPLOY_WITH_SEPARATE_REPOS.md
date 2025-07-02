# 🚀 **Деплой с отдельными репозиториями**

## 📋 **Проблема:** Frontend и Backend в разных репозиториях

Когда frontend находится в отдельном репозитории, основной проект его не видит.

---

## ✅ **Решение 1: Git Submodules (Рекомендуется)**

### На локальной машине:
```bash
# Настройка submodule
cd Invitly
git submodule add <URL_FRONTEND_REPO> frontend/inviteai-spark-invites
git add .gitmodules frontend/
git commit -m "Add frontend as submodule"
git push
```

### На сервере:
```bash
# Клонирование с submodules
git clone --recursive <URL_MAIN_REPO>
cd Invitly

# Или обновление существующего репо
git pull
git submodule update --init --recursive

# Деплой
./deploy.sh
```

---

## ⚡ **Решение 2: Ручное клонирование**

### На сервере:
```bash
# 1. Клонируем основной репо
git clone <URL_MAIN_REPO>
cd Invitly

# 2. Клонируем frontend отдельно
git clone <URL_FRONTEND_REPO> frontend/inviteai-spark-invites

# 3. Деплой
./deploy.sh
```

---

## 🔄 **Решение 3: Pre-built деплой**

### На локальной машине:
```bash
cd frontend/inviteai-spark-invites
npm run build

# Копируем собранный frontend
cp -r dist/ ../../dist-for-deploy/
```

### На сервере:
```bash
# Клонируем основной репо
git clone <URL_MAIN_REPO>
cd Invitly

# Копируем pre-built frontend
mkdir -p frontend/dist
# Загружаем dist-for-deploy и копируем в frontend/dist/

# Изменяем deploy.sh чтобы пропустить сборку
# Комментируем строки сборки frontend или используем готовую сборку

./deploy.sh
```

---

## 🛠️ **Автоматизация: CI/CD**

### GitHub Actions пример:
```yaml
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          submodules: recursive  # Важно!
      
      - name: Build and Deploy
        run: ./deploy.sh
```

---

## 📊 **Сравнение решений:**

| Метод | Плюсы | Минусы |
|-------|-------|--------|
| **Submodules** | ✅ Версионность<br>✅ Автоматизация<br>✅ Чистота | ⚠️ Сложность настройки |
| **Ручное клонирование** | ✅ Простота<br>✅ Гибкость | ❌ Ручная работа<br>❌ Нет версионности |
| **Pre-built** | ✅ Быстрый деплой<br>✅ Независимость | ❌ Ручная сборка<br>❌ Нет автоматизации |

---

## 🎯 **Рекомендация:**

**Используйте Git Submodules** - это правильный способ управления вложенными репозиториями в Git. 