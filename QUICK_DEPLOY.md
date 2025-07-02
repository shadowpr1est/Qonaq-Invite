# ⚡ **Быстрый деплой с защитой от DDoS**

## 🚀 **За 5 минут:**

### **1. Клонирование:**
```bash
git clone <your-repo-url>
cd Invitly
```

### **2. Настройка .env:**
```bash
nano .env
```

```env
SERVER_NAME=192.168.1.100           # Замените на IP вашего сервера
POSTGRES_USER=invitly_user
POSTGRES_PASSWORD=super_secure_2024
POSTGRES_DB=invitly_prod
OPENAI_API_KEY=sk-your-openai-key
PRODUCTION_DOMAIN=192.168.1.100
```

### **3. Запуск:**
```bash
docker-compose up --build -d
docker-compose exec backend alembic upgrade head
```

### **4. Проверка:**
```bash
curl http://your-server-ip/health
docker-compose ps
```

---

## 🔒 **Автоматическая защита:**

- ✅ **DDoS protection** активирована
- ✅ **Rate limiting** настроен  
- ✅ **Brute force protection** включена
- ✅ **SQL injection блокировка** работает

## 📊 **Мониторинг атак:**
```bash
# Смотреть заблокированные запросы
docker-compose logs nginx | grep -E "(429|403)"

# Real-time мониторинг
docker-compose logs -f nginx
```

**Готово! Ваш сервер защищен!** 🛡️ 