#!/usr/bin/env python3
"""
🔧 HTML Generation Test
======================

Test to verify that HTML generation works correctly with variable substitution
"""

import asyncio
import sys
import os
from pathlib import Path

# Add the src directory to the path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from services.site_generator import SiteGeneratorService, GeneratedReactSite


async def test_html_generation():
    """Test HTML generation with proper variable substitution"""
    
    print("🔧 Testing HTML Generation")
    print("=" * 50)
    
    generator = SiteGeneratorService()
    
    # Create test site data with realistic content
    site_data = GeneratedReactSite(
        title="День Рождения Алишера",
        meta_description="Празднуем 50-летний юбилей! Приглашаем всех друзей и коллег на торжественное мероприятие.",
        component_name="AlisherBirthday",
        color_palette={"primary": "blue", "secondary": "purple"},
        theme_config={},
        event_type="birthday",
        content_details={
            "event_title": "День Рождения Алишера",
            "description": "Приглашаем всех на праздник! Будет весело и интересно.",
            "event_date": "15 января 2024",
            "event_time": "18:00",
            "event_location": "Ресторан Центр",
            "organizer_name": "Алишер",
            "organizer_phone": "+7 (999) 123-45-67",
            "organizer_email": "alisher@example.com",
            "dresscode": "Смарт-кэжуал"
        }
    )
    
    print(f"🎯 Тестируем генерацию для: {site_data.title}")
    print(f"📝 Описание: {site_data.meta_description}")
    
    # Generate HTML
    print("\n🌐 Генерируем HTML...")
    html = await generator.generate_html_preview(site_data)
    
    print(f"✅ HTML сгенерирован, длина: {len(html)} символов")
    
    # Check variable substitution
    print("\n🔍 Проверка подстановки переменных:")
    checks = [
        ("День Рождения Алишера", "Заголовок"),
        ("Приглашаем всех на праздник", "Описание"),
        ("15 января 2024", "Дата"),
        ("18:00", "Время"),
        ("Ресторан Центр", "Место"),
        ("+7 (999) 123-45-67", "Телефон"),
        ("alisher@example.com", "Email"),
        ("Смарт-кэжуал", "Дресс-код"),
        ("bg-gradient-to-br from-blue-900", "Цветовая схема")
    ]
    
    all_passed = True
    for text, label in checks:
        if text in html:
            print(f"✅ {label}: найден")
        else:
            print(f"❌ {label}: НЕ найден - '{text}'")
            all_passed = False
    
    # Show HTML structure
    print("\n📄 Структура HTML:")
    lines = html.split('\n')
    for i, line in enumerate(lines[:30]):  # First 30 lines
        print(f"{i+1:2d}: {line[:100]}")
    
    if len(lines) > 30:
        print(f"... и еще {len(lines) - 30} строк")
    
    # Save to file for inspection
    output_file = Path("test_output.html")
    with open(output_file, "w", encoding="utf-8") as f:
        f.write(html)
    
    print(f"\n💾 HTML сохранен в файл: {output_file.absolute()}")
    
    if all_passed:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОШЛИ! HTML генерируется корректно.")
    else:
        print("\n⚠️ Есть проблемы с подстановкой переменных.")
    
    return html


if __name__ == "__main__":
    asyncio.run(test_html_generation()) 