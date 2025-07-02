#!/usr/bin/env python3
"""
🔧 HTML Preview Generation Fix Test
==================================

Test to verify that our fixes produce proper HTML previews for iframe display
instead of raw React code.

ПРОБЛЕМА: Iframe показывал React код как text
РЕШЕНИЕ: Раздельная генерация HTML превью и React кода
"""

import asyncio
import sys
import os
from pathlib import Path

# Add src directory to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

from services.site_generator import SiteGeneratorService, GeneratedReactSite


async def test_html_preview_generation():
    """Test HTML preview generation vs React code generation"""
    
    print("🔧 Testing HTML Preview Generation Fix")
    print("=" * 50)
    
    generator = SiteGeneratorService()
    
    # Create test site data
    site_data = GeneratedReactSite(
        title="50 лет Алишер",
        meta_description="Празднуем юбилей! Приглашаем всех друзей и коллег на торжественное мероприятие.",
        component_name="AlisherBirthday",
        event_type="birthday",
        color_palette=["blue", "indigo", "purple"],
        theme_config={
            "primary": "blue-600",
            "secondary": "indigo-500",
            "accent": "purple-400"
        },
        animations=["bounce", "fade-in", "scale"],
        dependencies=["@types/react", "tailwindcss"]
    )
    
    print(f"\n🎯 Тестируем генерацию для: {site_data.title}")
    print(f"📝 Описание: {site_data.meta_description}")
    print(f"🎨 Цветовая схема: {', '.join(site_data.color_palette)}")
    
    # Test React code generation
    print("\n⚛️ Генерируем React компонент...")
    react_code = await generator.generate_react_page(site_data)
    
    # Test HTML preview generation
    print("🌐 Генерируем HTML превью...")
    html_preview = await generator.generate_html_preview(site_data)
    
    # Analyze results
    print("\n📊 РЕЗУЛЬТАТЫ АНАЛИЗА:")
    print("=" * 30)
    
    # React code analysis
    react_imports = "import React" in react_code
    react_interfaces = "interface" in react_code
    react_hooks = "useState" in react_code and "useCallback" in react_code
    react_export = f"export default {site_data.component_name}" in react_code
    
    print(f"⚛️ REACT КОД ({len(react_code)} символов):")
    print(f"   ✅ React импорты: {react_imports}")
    print(f"   ✅ TypeScript интерфейсы: {react_interfaces}")
    print(f"   ✅ React хуки: {react_hooks}")
    print(f"   ✅ Правильный экспорт: {react_export}")
    
    # HTML preview analysis
    html_doctype = "<!DOCTYPE html>" in html_preview
    html_tailwind = "tailwindcss.com" in html_preview
    html_title = site_data.title in html_preview
    html_description = site_data.meta_description in html_preview
    html_animations = "animate-" in html_preview
    html_gradients = "gradient" in html_preview
    html_interactive = "onclick" in html_preview or "onsubmit" in html_preview
    
    print(f"\n🌐 HTML ПРЕВЬЮ ({len(html_preview)} символов):")
    print(f"   ✅ Валидный HTML: {html_doctype}")
    print(f"   ✅ Tailwind CSS: {html_tailwind}")
    print(f"   ✅ Правильный заголовок: {html_title}")
    print(f"   ✅ Описание: {html_description}")
    print(f"   ✅ Анимации: {html_animations}")
    print(f"   ✅ Градиенты: {html_gradients}")
    print(f"   ✅ Интерактивность: {html_interactive}")
    
    # Check content differences
    is_react_in_html = "import React" in html_preview
    is_html_in_react = "<!DOCTYPE" in react_code
    
    print(f"\n🔍 ПРОВЕРКА РАЗДЕЛЕНИЯ:")
    print(f"   ❌ React код в HTML: {is_react_in_html}")
    print(f"   ❌ HTML код в React: {is_html_in_react}")
    
    # Save files for inspection
    output_dir = Path("preview_fix_test_output")
    output_dir.mkdir(exist_ok=True)
    
    # Save React code
    react_file = output_dir / f"{site_data.component_name}.tsx"
    with open(react_file, 'w', encoding='utf-8') as f:
        f.write(react_code)
    
    # Save HTML preview
    html_file = output_dir / f"{site_data.component_name}_preview.html"
    with open(html_file, 'w', encoding='utf-8') as f:
        f.write(html_preview)
    
    print(f"\n💾 ФАЙЛЫ СОХРАНЕНЫ:")
    print(f"   📄 React: {react_file}")
    print(f"   🌐 HTML: {html_file}")
    
    # Overall assessment
    react_quality = all([react_imports, react_interfaces, react_hooks, react_export])
    html_quality = all([html_doctype, html_tailwind, html_title, html_description])
    content_separation = not is_react_in_html and not is_html_in_react
    
    if react_quality and html_quality and content_separation:
        print("\n🎉 ВСЕ ТЕСТЫ ПРОЙДЕНЫ!")
        print("✅ React компонент корректен")
        print("✅ HTML превью корректен") 
        print("✅ Контент разделен правильно")
        print("\n🚀 ПРОБЛЕМА С IFRAME ИСПРАВЛЕНА!")
    else:
        print("\n⚠️ НАЙДЕНЫ ПРОБЛЕМЫ:")
        if not react_quality:
            print("❌ Проблемы с React компонентом")
        if not html_quality:
            print("❌ Проблемы с HTML превью")
        if not content_separation:
            print("❌ Контент не разделен корректно")


async def test_color_palette_handling():
    """Test color palette extraction for HTML generation"""
    
    print("\n🎨 Testing Color Palette Handling")
    print("=" * 40)
    
    generator = SiteGeneratorService()
    
    test_cases = [
        {
            "name": "Список цветов",
            "palette": ["rose", "pink", "purple"],
            "expected_primary": "rose",
            "expected_secondary": "pink"
        },
        {
            "name": "Словарь цветов",
            "palette": {"primary": "emerald", "secondary": "teal", "accent": "cyan"},
            "expected_primary": "emerald", 
            "expected_secondary": "teal"
        },
        {
            "name": "Пустая палитра",
            "palette": [],
            "expected_primary": "purple",
            "expected_secondary": "pink"
        }
    ]
    
    for case in test_cases:
        site_data = GeneratedReactSite(
            title="Тест цветов",
            meta_description="Тестируем обработку цветовых палитр",
            component_name="ColorTest",
            event_type="test",
            color_palette=case["palette"],
            theme_config={},
            animations=[],
            dependencies=[]
        )
        
        html_preview = await generator.generate_html_preview(site_data)
        
        primary_found = case["expected_primary"] in html_preview
        secondary_found = case["expected_secondary"] in html_preview
        
        print(f"\n{case['name']}:")
        print(f"   Палитра: {case['palette']}")
        print(f"   ✅ Primary ({case['expected_primary']}): {primary_found}")
        print(f"   ✅ Secondary ({case['expected_secondary']}): {secondary_found}")


if __name__ == "__main__":
    print("🔧 HTML PREVIEW GENERATION FIX TEST")
    print("Тестируем исправления для корректного отображения в iframe")
    
    asyncio.run(test_html_preview_generation())
    asyncio.run(test_color_palette_handling())
    
    print("\n" + "="*60)
    print("📋 ЗАКЛЮЧЕНИЕ:")
    print("Теперь система генерирует:")
    print("• React код - для скачивания разработчиками")
    print("• HTML превью - для отображения в iframe")
    print("• Раздельное хранение контента")
    print("="*60) 