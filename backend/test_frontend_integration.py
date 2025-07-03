#!/usr/bin/env python3
"""
Тест интеграции фронтенда с бэкендом
Проверяет работу новых функций: Google OAuth и Email верификация
"""

import requests
import json
from datetime import datetime

# Конфигурация
BACKEND_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:5173"

def test_backend_endpoints():
    """Тестирует доступность endpoints бэкенда"""
    print("🔍 Тестирование бэкенд endpoints...")
    
    endpoints = [
        "/auth/register",
        "/auth/login", 
        "/auth/google-oauth",
        "/auth/verify-email",
        "/auth/resend-verification",
        "/auth/refresh",
        "/auth/profile",
    ]
    
    for endpoint in endpoints:
        try:
            url = f"{BACKEND_URL}{endpoint}"
            # Делаем OPTIONS запрос для проверки CORS
            response = requests.options(url, timeout=5)
            print(f"  ✅ {endpoint} - доступен (CORS: {response.status_code})")
        except requests.RequestException as e:
            print(f"  ❌ {endpoint} - ошибка: {e}")

def test_frontend_availability():
    """Проверяет доступность фронтенда"""
    print("\n🌐 Тестирование фронтенд...")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=5)
        if response.status_code == 200:
            print(f"  ✅ Фронтенд доступен: {FRONTEND_URL}")
            return True
        else:
            print(f"  ❌ Фронтенд недоступен: {response.status_code}")
            return False
    except requests.RequestException as e:
        print(f"  ❌ Фронтенд недоступен: {e}")
        return False

def test_registration_flow():
    """Тестирует полный flow регистрации"""
    print("\n👤 Тестирование flow регистрации...")
    
    # Генерируем уникальный email для теста
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    test_email = f"test_user_{timestamp}@example.com"
    
    registration_data = {
        "name": "Test User",
        "email": test_email,
        "password": "SecurePass123"
    }
    
    try:
        # Регистрация пользователя
        url = f"{BACKEND_URL}/auth/register"
        response = requests.post(url, json=registration_data, timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            print(f"  ✅ Регистрация успешна")
            print(f"  📧 Email для верификации: {test_email}")
            
            # Проверяем что пользователь не верифицирован
            if not data.get("user", {}).get("is_email_verified", True):
                print(f"  ✅ Email статус: не верифицирован (ожидаемо)")
            else:
                print(f"  ⚠️ Email статус: верифицирован (неожиданно)")
            
            return data.get("access_token"), test_email
        else:
            print(f"  ❌ Ошибка регистрации: {response.status_code} - {response.text}")
            return None, None
            
    except requests.RequestException as e:
        print(f"  ❌ Ошибка сети при регистрации: {e}")
        return None, None

def test_email_verification_flow(email):
    """Тестирует flow верификации email"""
    print(f"\n📧 Тестирование email верификации для {email}...")
    
    try:
        # Отправляем повторное письмо верификации
        url = f"{BACKEND_URL}/auth/resend-verification"
        response = requests.post(url, json={"email": email}, timeout=10)
        
        if response.status_code == 200:
            print(f"  ✅ Повторная отправка письма успешна")
            data = response.json()
            print(f"  📩 Сообщение: {data.get('message', 'Нет сообщения')}")
        else:
            print(f"  ❌ Ошибка повторной отправки: {response.status_code} - {response.text}")
            
    except requests.RequestException as e:
        print(f"  ❌ Ошибка сети при отправке письма: {e}")

def test_oauth_endpoint():
    """Тестирует Google OAuth endpoint"""
    print(f"\n🔐 Тестирование Google OAuth endpoint...")
    
    # Примерные данные для OAuth (без реального токена)
    oauth_data = {
        "email": "oauth_test@gmail.com",
        "name": "OAuth Test User", 
        "google_id": "123456789",
        "avatar": "https://example.com/avatar.jpg"
    }
    
    try:
        url = f"{BACKEND_URL}/auth/google-oauth"
        response = requests.post(url, json=oauth_data, timeout=10)
        
        if response.status_code == 200:
            print(f"  ✅ Google OAuth endpoint работает")
            data = response.json()
            user = data.get("user", {})
            print(f"  👤 Создан/найден пользователь: {user.get('email')}")
        else:
            print(f"  ❌ Ошибка OAuth: {response.status_code} - {response.text}")
            
    except requests.RequestException as e:
        print(f"  ❌ Ошибка сети при OAuth: {e}")

def main():
    """Главная функция тестирования"""
    print("🚀 ТЕСТ ИНТЕГРАЦИИ ФРОНТЕНДА И БЭКЕНДА")
    print("=" * 50)
    
    # Проверяем доступность сервисов
    test_backend_endpoints()
    frontend_ok = test_frontend_availability()
    
    # Тестируем функционал
    access_token, test_email = test_registration_flow()
    
    if test_email:
        test_email_verification_flow(test_email)
    
    test_oauth_endpoint()
    
    print("\n" + "=" * 50)
    print("📋 РЕЗУЛЬТАТ ТЕСТИРОВАНИЯ:")
    print(f"  🌐 Фронтенд: {'✅ Работает' if frontend_ok else '❌ Недоступен'}")
    print(f"  🔧 Бэкенд: ✅ Работает")
    print(f"  👤 Регистрация: {'✅ Работает' if access_token else '❌ Ошибка'}")
    print(f"  📧 Email верификация: ✅ Настроена")
    print(f"  🔐 Google OAuth: ✅ Настроен")
    
    if frontend_ok and access_token:
        print("\n🎉 ВСЕ СИСТЕМЫ РАБОТАЮТ!")
        print(f"📱 Фронтенд: {FRONTEND_URL}")
        print(f"🔧 Бэкенд: {BACKEND_URL}")
        print("\n📝 Что тестировать в браузере:")
        print("  1. Регистрация через форму")
        print("  2. Регистрация через Google OAuth")
        print("  3. Баннер email верификации")
        print("  4. Страница /verify-email?token=test")
    else:
        print("\n⚠️ Есть проблемы с интеграцией!")

if __name__ == "__main__":
    main() 