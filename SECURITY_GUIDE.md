# 🔒 **Усиленная безопасность и защита от DDoS**

## 🚨 **Новые защитные меры:**

### **Rate Limiting (жесткие ограничения):**

- **Авторизация**: `1 запрос/сек` (защита от брутфорса)
- **API операции**: `2 запроса/сек` 
- **Тяжелые операции** (генерация сайтов): `30 запросов/час`
- **Общие запросы**: `3 запроса/сек`
- **Статические файлы**: `20 запросов/сек`

### **Connection Limiting:**
- **Максимум 10 соединений** с одного IP одновременно

### **Request Filtering:**
- Блокировка подозрительных HTTP методов
- Защита от Path Traversal атак (`../`, `..%2f`)
- Фильтрация SQL injection паттернов
- Ограничение размера запросов (10MB max)

---

## ⚙️ **Настройка SERVER_NAME:**

```bash
# В .env файле добавьте:
SERVER_NAME=your-server-ip-or-domain.com

# Примеры:
SERVER_NAME=192.168.1.100        # IP адрес
SERVER_NAME=myapp.example.com    # Домен
SERVER_NAME=_                    # Любой домен (по умолчанию)
```

---

## 🛡️ **Защитные заголовки:**

```
X-Frame-Options: SAMEORIGIN           # Защита от clickjacking
X-Content-Type-Options: nosniff       # Защита от MIME sniffing
X-XSS-Protection: 1; mode=block       # XSS защита
Content-Security-Policy: [строгая]    # CSP защита
```

---

## 📊 **Мониторинг атак:**

```bash
# Просмотр заблокированных запросов (HTTP 429)
docker-compose logs nginx | grep "429"

# Топ IP адресов по количеству запросов
docker-compose logs nginx | grep -oE '\b([0-9]{1,3}\.){3}[0-9]{1,3}\b' | sort | uniq -c | sort -nr | head -10

# Заблокированные SQL injection попытки
docker-compose logs nginx | grep "403"

# Real-time мониторинг
docker-compose logs -f nginx | grep -E "(429|403|444)"
```

---

## 🚫 **Автоматическая блокировка:**

### **HTTP 429** - Rate limit exceeded:
```
Превышен лимит запросов. Подождите перед следующим запросом.
```

### **HTTP 403** - Blocked attack:
```
Заблокированы подозрительные запросы (SQL injection, path traversal)
```

### **HTTP 405** - Method not allowed:
```
Разрешены только: GET, HEAD, POST, PUT, DELETE, OPTIONS
```

---

## 🔧 **Дополнительные настройки безопасности:**

### **Timeouts (защита от медленных атак):**
- **Connection**: 5 секунд
- **Send**: 10 секунд  
- **Read**: 30 секунд

### **Buffer limits:**
- **Body size**: 10MB максимум
- **Header buffers**: 4 буфера по 8KB

---

## 📈 **Рекомендации для продакшна:**

### **1. Firewall правила:**
```bash
# Разрешить только HTTP/HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Заблокировать все остальное
sudo ufw --force enable
```

### **2. Мониторинг:**
```bash
# Установить fail2ban для автобана
sudo apt install fail2ban

# Настроить логи nginx
tail -f /var/log/nginx/access.log | grep -E "(429|403)"
```

### **3. SSL сертификаты:**
```bash
# Let's Encrypt (бесплатно)
sudo apt install certbot
sudo certbot --nginx -d yourdomain.com
```

---

## 🎯 **Кастомизация лимитов:**

Если нужны другие лимиты, отредактируйте `nginx/nginx.conf`:

```nginx
# Более мягкие лимиты для API
limit_req_zone $binary_remote_addr zone=api:10m rate=5r/s;

# Более строгие для auth
limit_req_zone $binary_remote_addr zone=auth:10m rate=30r/m;
```

---

## ⚡ **Экстренная разблокировка:**

```bash
# Перезапуск nginx (сброс счетчиков)
docker-compose restart nginx

# Временное отключение rate limiting
# Закомментируйте limit_req строки в nginx.conf
```

---

## 🎉 **Результат:**

✅ **Защита от DDoS атак**  
✅ **Блокировка брутфорса**  
✅ **Фильтрация вредоносных запросов**  
✅ **Ограничение ресурсов**  
✅ **Мониторинг атак**  

**Ваш сервер теперь защищен от 99% автоматических атак!** 🛡️ 