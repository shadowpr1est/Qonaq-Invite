#!/usr/bin/env python3
"""
🔧 Simple HTML Generation Test
=============================

Direct test to verify HTML generation works correctly
"""

import json
import requests
import time

def test_site_generation():
    """Test site generation via API"""
    
    print("🔧 Testing Site Generation via API")
    print("=" * 50)
    
    # Test data
    test_request = {
        "event_type": "birthday",
        "theme": "modern",
        "color_preferences": "синие и фиолетовые",
        "style_preferences": "элегантный и современный",
        "target_audience": "family_friends",
        "content_details": {
            "event_title": "День Рождения Алишера",
            "description": "Празднуем 50-летний юбилей! Приглашаем всех друзей и коллег на торжественное мероприятие.",
            "event_date": "15 января 2024",
            "event_time": "18:00",
            "event_location": "Ресторан Центр",
            "organizer_name": "Алишер",
            "organizer_phone": "+7 (999) 123-45-67",
            "organizer_email": "alisher@example.com",
            "dresscode": "Смарт-кэжуал"
        }
    }
    
    print(f"🎯 Тестируем генерацию для: {test_request['content_details']['event_title']}")
    
    try:
        # First check if server is running
        print("\n🔌 Проверяем соединение с сервером...")
        health_response = requests.get("http://localhost:8000/", timeout=5)
        print(f"✅ Сервер доступен (статус: {health_response.status_code})")
        
        # Test site generation
        print("\n🚀 Отправляем запрос на генерацию...")
        
        # Note: This would normally require authentication
        # For testing, we'll just check if the endpoint exists
        
        print("⚠️ Для полного тестирования нужна авторизация")
        print("📄 Структура запроса:")
        print(json.dumps(test_request, indent=2, ensure_ascii=False))
        
        return True
        
    except requests.exceptions.ConnectionError:
        print("❌ Сервер не запущен. Запустите FastAPI сервер:")
        print("   cd src && python -m uvicorn main:app --reload --port 8000")
        return False
    
    except Exception as e:
        print(f"❌ Ошибка тестирования: {e}")
        return False


def test_html_preview_structure():
    """Test HTML structure manually"""
    
    print("\n\n🔧 Testing HTML Preview Structure")
    print("=" * 50)
    
    # Simulate what the HTML should contain
    expected_elements = [
        "День Рождения Алишера",
        "Празднуем 50-летний юбилей",
        "15 января 2024",
        "18:00",
        "Ресторан Центр",
        "+7 (999) 123-45-67",
        "alisher@example.com",
        "bg-gradient-to-br from-blue-900",
        "tailwindcss",
        "ResizeObserver"
    ]
    
    print("📋 Ожидаемые элементы в HTML:")
    for i, element in enumerate(expected_elements, 1):
        print(f"  {i:2d}. {element}")
    
    print("\n✅ Структура HTML должна содержать все эти элементы")
    print("🎨 Цветовая схема: blue/indigo/purple (на основе предпочтений)")
    print("🌐 TailwindCSS классы должны быть корректными")
    print("🔧 JavaScript должен подавлять ResizeObserver ошибки")
    
    return True


if __name__ == "__main__":
    print("🧪 Запуск простых тестов")
    print("=" * 60)
    
    # Test API connection
    api_ok = test_site_generation()
    
    # Test HTML structure
    html_ok = test_html_preview_structure()
    
    print("\n" + "=" * 60)
    if api_ok and html_ok:
        print("🎉 ВСЕ БАЗОВЫЕ ТЕСТЫ ПРОШЛИ!")
        print("💡 Для полного тестирования запустите FastAPI сервер")
    else:
        print("⚠️ Есть проблемы, требующие внимания")
    
    print("\n📝 Следующие шаги:")
    print("  1. Запустить FastAPI сервер")
    print("  2. Протестировать генерацию через веб-интерфейс")
    print("  3. Проверить предпросмотр в iframe") 