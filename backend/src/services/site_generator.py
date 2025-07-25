import json
import uuid
import calendar
import aiohttp
from typing import List, Dict, Any, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from babel.dates import format_date, format_datetime  # Добавлено для локализации дат
from ..core.config import settings
from ..utils.slug import generate_slug

# --- Pydantic Schemas ---
class EventData(BaseModel):
    event_type: str
    theme: Optional[str] = "modern"
    color_preferences: Optional[str] = "elegant_neutrals"
    content_details: Dict[str, Any]

# --- Constants ---
COLOR_GRADIENTS = {
    "elegant_neutrals": {
        "primary": "from-slate-600 via-gray-700 to-slate-800",
        "secondary": "from-gray-100 to-gray-200",
        "accent": "text-slate-700",
        "background": "bg-gradient-to-br from-gray-50 via-slate-50 to-gray-100"
    },
    "cool_winter": {
        "primary": "from-blue-600 via-indigo-600 to-cyan-600",
        "secondary": "from-blue-50 to-indigo-50",
        "accent": "text-blue-700",
        "background": "bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50"
    },
    "nature_inspired": {
        "primary": "from-green-600 via-emerald-600 to-teal-600",
        "secondary": "from-green-50 to-emerald-50",
        "accent": "text-green-700",
        "background": "bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50"
    },
    "romantic_pastels": {
        "primary": "from-pink-500 via-rose-500 to-red-500",
        "secondary": "from-pink-50 to-rose-50",
        "accent": "text-pink-700",
        "background": "bg-gradient-to-br from-pink-50 via-rose-50 to-red-50"
    },
    "warm_autumn": {
        "primary": "from-orange-600 via-amber-600 to-red-600",
        "secondary": "from-orange-50 to-amber-50",
        "accent": "text-orange-700",
        "background": "bg-gradient-to-br from-orange-50 via-amber-50 to-red-50"
    },
    "vibrant_celebration": {
        "primary": "from-purple-600 via-pink-600 to-red-600",
        "secondary": "from-purple-50 to-pink-50",
        "accent": "text-purple-700",
        "background": "bg-gradient-to-br from-purple-50 via-pink-50 to-red-50"
    },
    "bold_modern": {
        "primary": "from-indigo-500 via-violet-500 to-purple-700",
        "secondary": "from-indigo-50 to-violet-50",
        "accent": "text-indigo-700",
        "background": "bg-gradient-to-br from-indigo-50 via-violet-50 to-purple-50"
    },
    "spring_fresh": {
        "primary": "from-lime-600 via-green-600 to-emerald-600",
        "secondary": "from-lime-50 to-green-50",
        "accent": "text-lime-700",
        "background": "bg-gradient-to-br from-lime-50 via-green-50 to-emerald-50"
    },
    "summer_bright": {
        "primary": "from-yellow-500 via-orange-500 to-red-500",
        "secondary": "from-yellow-50 to-orange-50",
        "accent": "text-yellow-700",
        "background": "bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50"
    }
}

THEME_STYLES = {
    "modern": {
        "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20",
        "title": "text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight",
        "description": "text-xl sm:text-2xl md:text-3xl font-light leading-relaxed",
        "button": "px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-xl",
        "spacing": "p-8 sm:p-10 md:p-12"
    },
    "classic": {
        "container": "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/95 backdrop-blur-sm border-2 border-gray-200 shadow-lg",
        "title": "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-bold",
        "description": "text-lg sm:text-xl md:text-2xl font-serif leading-relaxed",
        "button": "px-6 py-3 border-2 border-gray-300 font-serif font-semibold transition-all duration-200 hover:shadow-md",
        "spacing": "p-6 sm:p-8 md:p-10"
    },
    "minimalist": {
        "container": "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/70 backdrop-blur-sm rounded-lg shadow-sm border border-gray-100",
        "title": "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light tracking-wide",
        "description": "text-base sm:text-lg md:text-xl font-light leading-relaxed",
        "button": "px-6 py-3 rounded-md font-light transition-all duration-200 hover:shadow-sm",
        "spacing": "p-6 sm:p-7 md:p-8"
    },
    "elegant": {
        "container": "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/85 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100",
        "title": "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
        "description": "text-lg sm:text-xl md:text-2xl font-medium leading-relaxed",
        "button": "px-7 py-4 rounded-2xl font-semibold transition-all duration-300 hover:shadow-lg hover:scale-105",
        "spacing": "p-8 sm:p-9 md:p-10"
    },
    "playful": {
        "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/80 backdrop-blur-sm rounded-full shadow-2xl border-4 border-white/30",
        "title": "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight",
        "description": "text-lg sm:text-xl md:text-2xl leading-relaxed",
        "button": "px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 hover:scale-110 hover:rotate-2",
        "spacing": "p-8 sm:p-10 md:p-12"
    },
    "rustic": {
        "container": "max-w-5xl mx-auto px-4 sm:px-6 lg:px-8",
        "card": "bg-white/90 backdrop-blur-sm rounded-lg shadow-lg border-2 border-amber-200",
        "title": "text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold",
        "description": "text-lg sm:text-xl md:text-2xl leading-relaxed",
        "button": "px-6 py-4 rounded-lg font-bold border-2 border-amber-300 transition-all duration-200 hover:shadow-md",
        "spacing": "p-6 sm:p-8 md:p-10"
    }
}

# --- System Prompt ---
SYSTEM_PROMPT = """You are an expert React component generator for event invitations.
Generate modern, responsive, and accessible React components using only Tailwind CSS.
Follow these strict requirements:
- Output ONLY the JSX component code, no explanations
- Use semantic HTML elements
- Implement smooth animations and transitions
- Ensure mobile-first responsive design
- Use the provided color scheme and theme consistently
- Include proper accessibility attributes
- Never include imports, exports, or function declarations
- Make components interactive and engaging"""

import os

class SiteGeneratorService:
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
        # Загружаем API ключ из settings, если не найден - из os.environ
        self.two_gis_api_key = getattr(settings, 'TWO_GIS_API_KEY', '') or os.getenv('VITE_2GIS_API_KEY', '')
    
    def _get_color_scheme(self, color_preference: str) -> Dict[str, str]:
        """Получает цветовую схему по предпочтению пользователя"""
        return COLOR_GRADIENTS.get(color_preference, COLOR_GRADIENTS["elegant_neutrals"])
    
    def _get_theme_styles(self, theme: str) -> Dict[str, str]:
        """Получает стили темы по предпочтению пользователя"""
        return THEME_STYLES.get(theme, THEME_STYLES["modern"])
    
    async def _geocode_address(self, address: str) -> Optional[Dict[str, Any]]:
        """
        Геокодирует адрес через 2GIS API
        Возвращает координаты и информацию о месте
        """
        if not self.two_gis_api_key:
            return None
        
        if not address.strip():
            return None
        
        try:
            url = f"https://catalog.api.2gis.com/3.0/items/geocode"
            params = {
                'q': address,
                'fields': 'items.point,items.name,items.full_name,items.address_name,items.type,items.purpose_name',
                'key': self.two_gis_api_key
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        
                        if data.get('result', {}).get('items'):
                            result = data['result']['items'][0]
                            return result
                        else:
                            return None
                    else:
                        return None
        except Exception as e:
            return None
    
    def _generate_map_html(self, location_data: Dict[str, Any], colors: Dict[str, str], theme_styles: Dict[str, str]) -> str:
        """
        Генерирует HTML для встраивания 2GIS карты используя новый MapGL JS API
        """
        if not location_data:
            return ""
        
        coordinates = location_data.get('point', {})
        lat = coordinates.get('lat')
        lon = coordinates.get('lon')
        
        if not lat or not lon:
            return ""
        
        location_name = location_data.get('name', 'Место проведения')
        full_address = location_data.get('full_name', '')
        
        # Получаем API ключ
        api_key = getattr(settings, "TWO_GIS_API_KEY", "")
        
        # Генерируем уникальный ID для контейнера карты (без дефисов)
        map_id = f"map{uuid.uuid4().hex[:8]}"
        
        # Создаем HTML с новым MapGL JS API
        map_html = f"""
        <div class="w-full h-80 rounded-lg overflow-hidden shadow-lg border border-gray-200 max-w-2xl mx-auto">
            <div id="{map_id}" class="w-full h-full"></div>
        </div>
        
        <script src="https://mapgl.2gis.com/api/js/v1?callback=initMap{map_id}" async defer></script>
        <script>
            function initMap{map_id}() {{
                try {{
                    const map = new mapgl.Map('{map_id}', {{
                        key: '{api_key}',
                        center: [{lon}, {lat}],
                        zoom: 16
                    }});
                    
                    const marker = new mapgl.Marker(map, {{
                        coordinates: [{lon}, {lat}]
                    }});
                    
                    map.on('error', function(e) {{
                        showFallback{map_id}();
                    }});
                }} catch (error) {{
                    showFallback{map_id}();
                }}
            }}
            
            function showFallback{map_id}() {{
                document.getElementById('{map_id}').innerHTML = 
                    '<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">' +
                    '<div class="text-center p-4">' +
                    '<div class="text-3xl mb-3">📍</div>' +
                    '<p class="font-bold text-lg text-gray-800">{location_name}</p>' +
                    '<p class="text-gray-600">{full_address}</p>' +
                    '<p class="text-sm text-gray-500 mt-2">Координаты: {lat}, {lon}</p>' +
                    '</div></div>';
            }}
        </script>
        """
        return map_html
    
    def _generate_calendar_html(self, event_date: datetime, colors: Dict[str, str]) -> str:
        """Генерирует HTML календаря с правильными цветами и русской локализацией"""
        if not event_date:
            return ""
        
        event_day = event_date.day
        # Локализуем месяц на русский
        event_month = format_date(event_date, 'LLLL', locale='ru').capitalize()
        event_year = event_date.year
        first_day = event_date.replace(day=1)
        days_in_month = calendar.monthrange(event_year, event_date.month)[1]
        starting_day_of_week = (first_day.weekday() + 1) % 7
        
        calendar_html = f"""
        <div class="text-center mb-6 max-w-sm mx-auto">
            <h4 class="text-xl font-bold {colors['accent']} mb-4">{event_month} {event_year}</h4>
            <div class="grid grid-cols-7 gap-1 mb-2 text-xs font-medium text-gray-500">
                <div class="py-2">Вс</div><div class="py-2">Пн</div><div class="py-2">Вт</div>
                <div class="py-2">Ср</div><div class="py-2">Чт</div><div class="py-2">Пт</div><div class="py-2">Сб</div>
            </div>
        """
        
        day_counter = 1
        for week in range(6):
            calendar_html += '<div class="grid grid-cols-7 gap-1 mb-1">'
            for day in range(7):
                if week == 0 and day < starting_day_of_week:
                    calendar_html += '<div class="h-10 w-10"></div>'
                elif day_counter <= days_in_month:
                    is_event_day = day_counter == event_day
                    if is_event_day:
                        calendar_html += f'<div class="h-10 w-10 flex items-center justify-center text-sm rounded-full bg-gradient-to-r {colors["primary"]} text-white font-bold shadow-lg transform scale-110 ring-2 ring-white ring-opacity-50">{day_counter}</div>'
                    else:
                        calendar_html += f'<div class="h-10 w-10 flex items-center justify-center text-sm rounded-full text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors">{day_counter}</div>'
                    day_counter += 1
                else:
                    calendar_html += '<div class="h-10 w-10"></div>'
            calendar_html += '</div>'
            if day_counter > days_in_month:
                break
        
        calendar_html += '</div>'
        return calendar_html
    
    def _generate_rsvp_section(self, data: Dict[str, Any], colors: Dict[str, str], theme_styles: Dict[str, str], site_id: str = None) -> str:
        # Автоматически включаем RSVP, если есть опции, но нет флага
        if 'rsvp_options' in data and not data.get('rsvp_enabled'):
            data['rsvp_enabled'] = True
        # Подробный лог для отладки
        if not data.get('rsvp_enabled'):
            return ""
            return ""
        rsvp_options = data.get('rsvp_options', ['Буду', 'Не смогу'])
        # Корректный site_id для endpoint
        site_id_attr = f'data-site-id="{site_id}"' if site_id else ''
        # Кнопки RSVP
        buttons_html = "<div id=\"rsvp-options\" class=\"grid gap-4 max-w-sm mx-auto\">"
        for i, option in enumerate(rsvp_options):
            button_class = f"bg-gradient-to-r {colors['primary']} text-white hover:shadow-lg" if i == 0 else f"bg-white border-2 border-gray-200 {colors['accent']} hover:bg-gray-50"
            buttons_html += f'<button type="button" class="{theme_styles["button"]} {button_class} w-full" data-rsvp-option="{option}">{option}</button>'
        buttons_html += "</div>"
        # Форма RSVP (скрыта по умолчанию)
        form_html = (
            f'<form id="rsvp-form" class="space-y-4 max-w-sm mx-auto mt-6 hidden">'
            f'<input type="hidden" name="rsvp_option" id="rsvp_option_input" />'
            f'<div>'
            f'<label for="rsvp_name" class="block text-sm font-medium mb-1">Ваше имя <span class="text-red-500">*</span></label>'
            f'<input id="rsvp_name" name="rsvp_name" type="text" required class="w-full border rounded-lg p-3" placeholder="Введите имя" />'
            f'</div>'
            f'<div>'
            f'<label for="rsvp_comment" class="block text-sm font-medium mb-1">Комментарий (необязательно)</label>'
            f'<textarea id="rsvp_comment" name="rsvp_comment" class="w-full border rounded-lg p-3" rows="2" placeholder="Пожелание или комментарий..."></textarea>'
            f'</div>'
            f'<button type="submit" class="w-full {theme_styles["button"]} bg-gradient-to-r {colors["primary"]} text-white font-semibold">Подтвердить</button>'
            f'</form>'
            f'<div id="rsvp-success" class="hidden text-center text-green-600 font-semibold mt-6">Спасибо, ваш ответ записан!</div>'
            f'<div id="rsvp-error" class="hidden text-center text-red-600 font-semibold mt-4">Ошибка при отправке RSVP. Попробуйте еще раз.</div>'
        )
        rsvp_html = (
            f'<div id="rsvp-root" {site_id_attr} class="{theme_styles["card"]} {theme_styles["spacing"]} max-w-lg mx-auto mb-8 fade-in">'
            f'<h3 class="text-2xl md:text-3xl font-bold {colors["accent"]} mb-6 text-center">Подтвердите участие</h3>'
            f'{buttons_html}'
            f'{form_html}'
            f'</div>'
            f'<script>(function() {{\n'
            f'  try {{\n'
            f'    var rsvpRoot = document.getElementById("rsvp-root");\n'
            f'    if (!rsvpRoot) throw new Error("RSVP root not found");\n'
            f'    var siteId = rsvpRoot.getAttribute("data-site-id");\n'
            f'    if (!siteId) throw new Error("siteId not found");\n'
            f'    var rsvpOptions = document.querySelectorAll("#rsvp-options button");\n'
            f'    var rsvpForm = document.getElementById("rsvp-form");\n'
            f'    var rsvpOptionInput = document.getElementById("rsvp_option_input");\n'
            f'    var rsvpSuccess = document.getElementById("rsvp-success");\n'
            f'    var rsvpError = document.getElementById("rsvp-error");\n'
            f'    rsvpOptions.forEach(function(btn) {{\n'
            f'      btn.addEventListener("click", function() {{\n'
            f'        document.getElementById("rsvp-options").classList.add("hidden");\n'
            f'        rsvpForm.classList.remove("hidden");\n'
            f'        rsvpOptionInput.value = this.getAttribute("data-rsvp-option");\n'
            f'      }});\n'
            f'    }});\n'
            f'    rsvpForm.addEventListener("submit", async function(e) {{\n'
            f'      e.preventDefault();\n'
            f'      var name = document.getElementById("rsvp_name").value.trim();\n'
            f'      var comment = document.getElementById("rsvp_comment").value.trim();\n'
            f'      var option = rsvpOptionInput.value;\n'
            f'      if (!name) {{\n'
            f'        document.getElementById("rsvp_name").focus();\n'
            f'        return;\n'
            f'      }}\n'
            f'      try {{\n'
            f'        rsvpError.classList.add("hidden");\n'
            f'        var resp = await fetch(`/sites/${{siteId}}/rsvp`, {{\n'
            f'          method: "POST",\n'
            f'          headers: {{ "Content-Type": "application/json" }},\n'
            f'          body: JSON.stringify({{ guest_name: name, response: option, comment }})\n'
            f'        }});\n'
            f'        if (!resp.ok) {{\n'
            f'          var errText = "Ошибка: " + (await resp.text());\n'
            f'          rsvpError.textContent = errText;\n'
            f'          rsvpError.classList.remove("hidden");\n'
            f'          return;\n'
            f'        }}\n'
            f'        rsvpForm.classList.add("hidden");\n'
            f'        rsvpSuccess.classList.remove("hidden");\n'
            f'        rsvpError.classList.add("hidden");\n'
            f'      }} catch (err) {{\n'
            f'        rsvpError.textContent = "Ошибка отправки RSVP: " + err.message;\n'
            f'        rsvpError.classList.remove("hidden");\n'
            f'      }}\n'
            f'    }});\n'
            f'  }} catch (err) {{\n'
            f'    var rsvpRoot = document.getElementById("rsvp-root");\n'
            f'    if (rsvpRoot) {{\n'
            f'      var errDiv = document.createElement("div");\n'
            f'      errDiv.className = "text-red-600 font-bold text-center mt-4";\n'
            f'      errDiv.textContent = "Ошибка инициализации RSVP: " + err.message;\n'
            f'      rsvpRoot.appendChild(errDiv);\n'
            f'    }}\n'
            f'  }}\n'
            f'}})();</script>'
        )

        return rsvp_html
    
    def _generate_contact_section(self, data: Dict[str, Any], colors: Dict[str, str], theme_styles: Dict[str, str]) -> str:
        """Генерирует секцию контактов"""
        if not any([data.get('contact_name'), data.get('contact_phone'), data.get('contact_email')]):
            return ""
        
        contact_items = []
        
        if data.get('contact_name'):
            contact_items.append(f'<p class="font-semibold {colors["accent"]}">{data["contact_name"]}</p>')
        
        if data.get('contact_phone'):
            contact_items.append(f"""
            <a href="tel:{data['contact_phone']}" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                {data['contact_phone']}
            </a>
            """)
        
        if data.get('contact_email'):
            contact_items.append(f"""
            <a href="mailto:{data['contact_email']}" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                {data['contact_email']}
            </a>
            """)
        
        return f"""
        <div class="{theme_styles['card']} {theme_styles['spacing']} max-w-sm mx-auto fade-in">
            <h3 class="text-xl font-bold {colors['accent']} mb-6 text-center">
                Вопросы?
            </h3>
            <div class="space-y-4 text-center">
                {''.join(contact_items)}
            </div>
        </div>
        """
    
    async def generate_react_component(self, event_json: dict) -> str:
        """Генерирует React компонент с учетом всех пользовательских предпочтений"""
        event = EventData.parse_obj(event_json)
        
        # Получаем цветовую схему и стили темы
        colors = self._get_color_scheme(event.color_preferences)
        theme_styles = self._get_theme_styles(event.theme)
        
        # Подготавливаем данные для промпта
        enhanced_data = {
            **event.content_details,
            "color_scheme": colors,
            "theme_styles": theme_styles,
            "theme": event.theme,
            "color_preferences": event.color_preferences
        }
        
        prompt = f"""
        Generate a responsive React invitation component using this data:
        
        {json.dumps(enhanced_data, ensure_ascii=False, indent=2)}
        
        Style Requirements:
        - Use theme: {event.theme}
        - Use color scheme: {event.color_preferences}
        - Primary gradient: {colors['primary']}
        - Background: {colors['background']}
        - Accent color: {colors['accent']}
        
        Component Requirements:
        - Mobile-first responsive design
        - Smooth animations and transitions
        - Interactive elements with hover effects
        - Proper accessibility attributes
        - Clean, modern layout
        - Integration of calendar, location, RSVP if provided
        - Use TwoGISMapPreview component for location display:
          <TwoGISMapPreview
            location={{`${{form.city ? form.city + ', ' : ''}}${{form.location}}`}}
            title={{form.title || "Место проведения"}}
            height="200px"
            className="rounded-lg"
          />
        
        Output only the JSX component code.
        """
        
        response = await self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7,
            max_tokens=4000
        )
        
        code = response.choices[0].message.content.strip()
        
        # Очищаем от markdown оберток
        if code.startswith("```"):
            code = code.split("\n", 1)[1].rsplit("```", 1)[0].strip()
        
        return code

    async def generate_html(self, event_json: dict) -> str:
        event = EventData.parse_obj(event_json)
        data = event.content_details
        
        # Получаем UUID сайта, если есть
        site_id = str(event_json.get('id', ''))
        
        # Получаем цветовую схему и стили темы
        colors = self._get_color_scheme(event.color_preferences)
        theme_styles = self._get_theme_styles(event.theme)
        
        # Парсим дату события
        event_date = None
        if data.get('event_date'):
            try:
                event_date = datetime.strptime(data['event_date'], '%Y-%m-%d')
            except ValueError:
                pass
        
        # Геокодируем адрес для карты
        location_data = None
        
        # Проверяем разные варианты названий полей
        city = data.get('city') or data.get('event_city')
        venue = data.get('venue_name') or data.get('location') or data.get('venue')
        
        if city and venue:
            address = f"{city}, {venue}".strip()
            if address:
                location_data = await self._geocode_address(address)
        
        # Генерируем компоненты
        calendar_html = self._generate_calendar_html(event_date, colors)
        rsvp_section = self._generate_rsvp_section(data, colors, theme_styles, site_id=site_id)
        contact_section = self._generate_contact_section(data, colors, theme_styles)
        map_section = self._generate_map_html(location_data, colors, theme_styles)
        
        # Форматируем дату и время
        formatted_date = format_date(event_date, 'EEEE, d MMMM y', locale='ru').capitalize() if event_date else ''
        formatted_time = data.get('event_time', '').split(':')[:2]
        formatted_time = ':'.join(formatted_time) if len(formatted_time) == 2 else data.get('event_time', '')
        
        # Формируем полную дату с временем
        full_datetime = f"{formatted_date}, {formatted_time}" if formatted_time else formatted_date
        
        # Создаем карточки дополнительной информации
        dress_code_card = f'''
                <!-- Dress Code Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Дресс-код</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('dress_code', 'Свободный стиль')}</p>
                </div>
                ''' if data.get('dress_code') else ''
        
        special_notes_card = f'''
                <!-- Special Notes Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Важно знать</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('special_notes', '')}</p>
                </div>
                ''' if data.get('special_notes') else ''
        
        gift_info_card = f'''
                <!-- Gift Info Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Подарки</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('gift_info', '')}</p>
                </div>
                ''' if data.get('gift_info') else ''
        
        menu_info_card = f'''
                <!-- Menu Card -->
                <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift">
                    <div class="flex items-center gap-4 mb-4">
                        <div class="w-10 h-10 icon-gradient bg-gradient-to-r {colors['primary']} rounded-xl flex items-center justify-center">
                            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                            </svg>
                        </div>
                        <h3 class="text-lg font-bold {colors['accent']}">Меню</h3>
                    </div>
                    <p class="text-gray-600 leading-relaxed">{data.get('menu_info', '')}</p>
                </div>
                ''' if data.get('menu_info') else ''
        
        # Дополнительные CSS стили для темы
        extra_styles = ""
        if event.theme == "classic":
            extra_styles += """
            .font-serif { font-family: "Playfair Display", "Georgia", serif; }
            @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&display=swap');
            """
        elif event.theme == "minimalist":
            extra_styles += """
            .font-light { font-weight: 300; }
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            * { font-family: 'Inter', sans-serif; }
            """
        elif event.theme == "elegant":
            extra_styles += """
            @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&display=swap');
            .font-elegant { font-family: 'Cormorant Garamond', serif; }
            """
        
        html = f"""<!DOCTYPE html>
<html lang='ru' class='scroll-smooth'>
<head>
    <meta charset='UTF-8'>
    <meta name='viewport' content='width=device-width, initial-scale=1.0'>
    <title>{data.get('event_title', 'Приглашение на событие')}</title>
    <script src='https://cdn.tailwindcss.com'></script>
    <script>
      // Передаем API ключ 2GIS в сгенерированный HTML
      window.TWO_GIS_API_KEY = '{getattr(settings, "TWO_GIS_API_KEY", "")}';
    </script>
    <style>
        {extra_styles}
        
        .elegant-shadow {{ 
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25), 
                       0 0 0 1px rgba(255, 255, 255, 0.1); 
        }}
        
        .text-shadow {{ 
            text-shadow: 0 4px 8px rgba(0,0,0,0.1), 
                        0 2px 4px rgba(0,0,0,0.1); 
        }}
        
        .fade-in {{ 
            animation: fadeIn 1s ease-out forwards; 
            opacity: 0;
        }}
        
        .slide-up {{ 
            animation: slideUp 0.8s ease-out forwards; 
            opacity: 0;
            transform: translateY(30px);
        }}
        
        .slide-up:nth-child(2) {{ animation-delay: 0.2s; }}
        .slide-up:nth-child(3) {{ animation-delay: 0.4s; }}
        .slide-up:nth-child(4) {{ animation-delay: 0.6s; }}
        
        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(20px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        @keyframes slideUp {{
            from {{ opacity: 0; transform: translateY(30px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}
        
        .gradient-text {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
            background-clip: text;
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
        }}
        
        .gradient-bg {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
        }}
        
        .time-badge {{
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%);
            border: 1px solid rgba(255, 255, 255, 0.3);
            backdrop-filter: blur(10px);
        }}
        
        .location-card {{
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.8) 100%);
            backdrop-filter: blur(15px);
        }}
        
        .icon-gradient {{
            background: linear-gradient(135deg, var(--tw-gradient-stops));
        }}
        
        .hover-lift {{
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }}
        
        .hover-lift:hover {{
            transform: translateY(-5px);
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.3);
        }}
        
        .pulse-gentle {{
            animation: pulseGentle 2s infinite;
        }}
        
        @keyframes pulseGentle {{
            0%, 100% {{ transform: scale(1); }}
            50% {{ transform: scale(1.05); }}
        }}
        
        .glass-effect {{
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
        
        .map-placeholder {{
            background: linear-gradient(135deg, {colors['secondary']});
            border: 2px dashed rgba(156, 163, 175, 0.3);
            position: relative;
            overflow: hidden;
        }}
        
        /* Улучшенный скролл */
        html {{
            scroll-behavior: smooth;
            scroll-padding-top: 2rem;
        }}
        
        body {{
            overflow-x: hidden;
            scroll-behavior: smooth;
        }}
        
        /* Плавный скролл для всех элементов */
        * {{
            scroll-behavior: smooth;
        }}
        
        /* Стили для скроллбара */
        ::-webkit-scrollbar {{
            width: 8px;
        }}
        
        ::-webkit-scrollbar-track {{
            background: rgba(0, 0, 0, 0.1);
            border-radius: 4px;
        }}
        
        ::-webkit-scrollbar-thumb {{
            background: linear-gradient(135deg, {colors['primary']}, {colors['secondary']});
            border-radius: 4px;
        }}
        
        ::-webkit-scrollbar-thumb:hover {{
            background: linear-gradient(135deg, {colors['secondary']}, {colors['primary']});
        }}
        
        /* Параллакс контейнер */
        .bg-parallax {{
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -1;
            pointer-events: none;
        }}
        
        .map-placeholder::before {{
            content: "📍";
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            font-size: 4rem;
            opacity: 0.2;
        }}
        
        .map-placeholder::after {{
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%);
            animation: shimmer 3s infinite;
        }}
        
        @keyframes shimmer {{
            0% {{ transform: translateX(-100%); }}
            100% {{ transform: translateX(100%); }}
        }}
        
        @media (max-width: 640px) {{
            .{theme_styles['title']} {{
                font-size: 2.5rem;
                line-height: 1.1;
            }}
            
            .{theme_styles['description']} {{
                font-size: 1.1rem;
                line-height: 1.5;
            }}
        }}
    </style>
</head>
<body class="{colors['background']} min-h-screen">
    <div class="min-h-screen py-8 sm:py-12 px-4">
        <div class="{theme_styles['container']}">
            <!-- Hero Section -->
            <div class="py-48 text-center mb-12 sm:mb-16 fade-in">
                <h1 class="{theme_styles['title']} gradient-text bg-gradient-to-r {colors['primary']} text-shadow mb-6 sm:mb-8">
                    {data.get('event_title', 'Приглашение на событие')}
                </h1>
                
                <p class="{theme_styles['description']} {colors['accent']} max-w-4xl mx-auto mb-8">
                    {data.get('description', 'Присоединяйтесь к нам на особенном празднике')}
                </p>
                
                <div class="inline-flex items-center gap-3 time-badge px-6 py-3 rounded-full glass-effect">
                    <div class="w-8 h-8 icon-gradient bg-gradient-to-r {colors['primary']} rounded-full flex items-center justify-center">
                        <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    </div>
                    <span class="text-sm sm:text-base font-medium {colors['accent']}">
                        {full_datetime}
                    </span>
                </div>
            </div>
            
            <!-- Main Content Grid -->
<div class="grid grid-cols-1 gap-8 mb-12 sm:mb-16">
  
  <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift max-w-lg mx-auto w-full">
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-2xl flex items-center justify-center pulse-gentle">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold {colors['accent']}">
        Дата события
      </h3>
    </div>
    {calendar_html}
  </div>

  <!-- Location Card -->
  <div class="{theme_styles['card']} {theme_styles['spacing']} slide-up hover-lift max-w-2xl mx-auto w-full">
    <div class="flex items-center gap-4 mb-6">
      <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-2xl flex items-center justify-center pulse-gentle">
        <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </div>
      <h3 class="text-xl sm:text-2xl font-bold {colors['accent']}">
        Место проведения
      </h3>
    </div>

    <div class="space-y-4">
      <div class="location-card p-4 rounded-2xl">
        <p class="text-lg font-semibold {colors['accent']} mb-2">
          {data.get('venue_name', data.get('location', 'Место уточняется'))}
        </p>
        {f'<p class="text-sm text-gray-600 mb-4">{data.get("city", "")}</p>' if data.get('city') else ''}
        
        {map_section if map_section else '''
        <div class="w-full h-80 rounded-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center max-w-2xl mx-auto">
          <div class="text-center">
            <div class="text-4xl mb-4">📍</div>
            <p class="text-lg font-semibold text-gray-700">Место проведения</p>
            <p class="text-sm text-gray-600">Карта будет доступна при указании адреса</p>
          </div>
        </div>
        '''}
      </div>
    </div>
  </div>
</div>


            
            <!-- Additional Info Cards -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 sm:mb-16 max-w-4xl mx-auto">
                {dress_code_card}
                {special_notes_card}
                {gift_info_card}
                {menu_info_card}
            </div>
            

            
            <!-- RSVP Section -->
            {rsvp_section}
            
            <!-- Contact Section -->
            {contact_section}
            
            <!-- Footer -->
            <div class="text-center mt-12 sm:mt-16 fade-in">
                <div class="{theme_styles['card']} {theme_styles['spacing']} max-w-lg mx-auto">
                    <div class="flex items-center justify-center gap-4 mb-6">
                        <div class="w-12 h-12 icon-gradient bg-gradient-to-r {colors['primary']} rounded-full flex items-center justify-center pulse-gentle">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                            </svg>
                        </div>
                        <h3 class="text-2xl font-bold {colors['accent']}">
                            Ждём вас!
                        </h3>
                    </div>
                    
                    <p class="text-gray-600 leading-relaxed mb-6">
                        {data.get('closing_message', 'Будем рады видеть вас на нашем празднике. Увидимся скоро!')}
                    </p>
                    
                    <div class="inline-flex items-center gap-2 text-sm text-gray-500">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        Создано с любовью
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <!-- JavaScript для интерактивности -->
    <script>
        // Плавная анимация появления элементов
        const observerOptions = {{
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        }};
        
        const observer = new IntersectionObserver((entries) => {{
            entries.forEach(entry => {{
                if (entry.isIntersecting) {{
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }}
            }});
        }}, observerOptions);
        
        // Наблюдаем за элементами с анимацией
        document.querySelectorAll('.fade-in, .slide-up').forEach(el => {{
            observer.observe(el);
        }});
        
        // Обработка RSVP кнопок
        document.querySelectorAll('button').forEach(button => {{
            button.addEventListener('click', function() {{
                // Добавляем визуальный фидбек
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {{
                    this.style.transform = 'scale(1)';
                }}, 150);
                
                // Здесь можно добавить отправку данных на сервер
            }});
        }});
        
        // Плавный скролл для всех ссылок
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {{
            anchor.addEventListener('click', function (e) {{
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {{
                    target.scrollIntoView({{
                        behavior: 'smooth',
                        block: 'start'
                    }});
                }}
            }});
        }});
        
        // Параллакс эффект только для фонового изображения (если есть)
        const backgroundImage = document.querySelector('.bg-parallax');
        if (backgroundImage) {{
            window.addEventListener('scroll', () => {{
                const scrolled = window.pageYOffset;
                const speed = scrolled * 0.3;
                backgroundImage.style.transform = `translateY(${{speed}}px)`;
            }});
        }}
        
        // Анимация hover для карточек
        document.querySelectorAll('.hover-lift').forEach(card => {{
            card.addEventListener('mouseenter', function() {{
                this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.3)';
            }});
            
            card.addEventListener('mouseleave', function() {{
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.25)';
            }});
        }});
        
        // Имитация загрузки карты
        setTimeout(() => {{
            const mapPlaceholder = document.querySelector('.map-placeholder');
            if (mapPlaceholder) {{
                mapPlaceholder.innerHTML = `
                    <div class="h-full w-full bg-gray-100 rounded-xl flex items-center justify-center">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-gradient-to-r ''' + colors['primary'] + ''' rounded-full flex items-center justify-center mx-auto mb-2">
                                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                </svg>
                            </div>
                            <p class="text-sm text-gray-600 font-medium">Место проведения</p>
                        </div>
                    </div>
                `;
            }}
        }}, 2000);
            </script>
</body>
</html>"""
        
        return html

    def save_to_file(self, html_content: str, filename: str = None) -> str:
        """Сохраняет HTML в файл и возвращает путь к нему"""
        if not filename:
            filename = f"invitation_{uuid.uuid4().hex[:8]}.html"
        
        filepath = f"generated_invitations/{filename}"
        
        # Создаем директорию если её нет
        import os
        os.makedirs("generated_invitations", exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(html_content)
        
        return filepath
    
    def generate_preview_url(self, event_json: dict) -> str:
        """Генерирует предварительный URL для просмотра приглашения"""
        html_content = self.generate_html(event_json)
        filename = f"preview_{uuid.uuid4().hex[:8]}.html"
        filepath = self.save_to_file(html_content, filename)
        
        # Возвращаем URL для предварительного просмотра
        return f"/preview/{filename}"
    
    def get_available_themes(self) -> List[str]:
        """Возвращает список доступных тем"""
        return list(THEME_STYLES.keys())
    
    def get_available_colors(self) -> List[str]:
        """Возвращает список доступных цветовых схем"""
        return list(COLOR_GRADIENTS.keys())
    
    def validate_event_data(self, event_json: dict) -> Dict[str, Any]:
        """Валидирует данные события и возвращает ошибки если есть"""
        errors = {}
        
        try:
            event = EventData.parse_obj(event_json)
        except Exception as e:
            errors['validation'] = str(e)
            return errors
        
        # Проверяем обязательные поля
        content_details = event.content_details
        
        if not content_details.get('event_title'):
            errors['event_title'] = 'Название события обязательно'
        
        if not content_details.get('event_date'):
            errors['event_date'] = 'Дата события обязательна'
        else:
            try:
                datetime.strptime(content_details['event_date'], '%Y-%m-%d')
            except ValueError:
                errors['event_date'] = 'Неверный формат даты (требуется YYYY-MM-DD)'
        
        if event.theme not in THEME_STYLES:
            errors['theme'] = f'Неизвестная тема: {event.theme}'
        
        if event.color_preferences not in COLOR_GRADIENTS:
            errors['color_preferences'] = f'Неизвестная цветовая схема: {event.color_preferences}'
        
        return errors
    
    def get_theme_preview(self, theme: str, color_scheme: str) -> Dict[str, Any]:
        """Возвращает предварительный просмотр темы и цветовой схемы"""
        if theme not in THEME_STYLES:
            theme = "modern"
        
        if color_scheme not in COLOR_GRADIENTS:
            color_scheme = "elegant_neutrals"
        
        return {
            "theme": theme,
            "color_scheme": color_scheme,
            "styles": THEME_STYLES[theme],
            "colors": COLOR_GRADIENTS[color_scheme],
            "preview_html": self._generate_theme_preview(theme, color_scheme)
        }
    
    def _generate_theme_preview(self, theme: str, color_scheme: str) -> str:
        """Генерирует HTML для предварительного просмотра темы"""
        colors = COLOR_GRADIENTS[color_scheme]
        styles = THEME_STYLES[theme]
        
        return f"""
        <div class="''' + colors['background'] + ''' p-8 rounded-lg">
            <div class="{styles['card']} {styles['spacing']} text-center">
                <h2 class="{styles['title']} bg-gradient-to-r ''' + colors['primary'] + ''' gradient-text mb-4" style="font-size: 2rem;">
                    Пример заголовка
                </h2>
                <p class="{styles['description']} ''' + colors['accent'] + ''' mb-6" style="font-size: 1rem;">
                    Это пример описания события в выбранной теме и цветовой схеме
                </p>
                <button class="{styles['button']} bg-gradient-to-r ''' + colors['primary'] + ''' text-white">
                    Кнопка действия
                </button>
            </div>
        </div>
        """
    def add_map_to_html(self, html_content: str, city: str, venue_name: str) -> str:
        """Добавляет карту 2GIS в HTML контент"""
        
        # Создаем адрес для геокодинга
        address = f"{city}, {venue_name}"
        
        # HTML для карты 2GIS
        map_html = f"""
        <!-- 2GIS Map Section -->
        <div class="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 p-8 sm:p-10 md:p-12 max-w-4xl mx-auto mb-8 fade-in">
            <h3 class="text-2xl md:text-3xl font-bold text-indigo-700 mb-6 text-center flex items-center justify-center">
                <svg class="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path>
                </svg>
                Место проведения
            </h3>
            <div class="text-center mb-6">
                <p class="text-lg text-gray-700 mb-2">{venue_name}</p>
                <p class="text-gray-600">{city}</p>
            </div>
            <div id="map" class="w-full h-64 rounded-2xl overflow-hidden shadow-lg" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="w-full h-full flex items-center justify-center">
                    <div class="text-white text-center">
                        <div class="text-4xl mb-4">🗺️</div>
                        <p class="text-lg font-semibold">Карта загружается...</p>
                        <p class="text-sm opacity-80">{address}</p>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- 2GIS Map Script -->
        <script src="https://mapgl.2gis.com/api/js"></script>
        <script>
            // 2GIS API Key
            const TWO_GIS_API_KEY = '{getattr(settings, "TWO_GIS_API_KEY", "")}';
            
            // Геокодинг адреса
            async function geocodeAddress(address) {{
                try {{
                    const response = await fetch(`https://catalog.api.2gis.com/3.0/items/geocode?q=${{encodeURIComponent(address)}}&fields=items.point,items.name,items.full_name&key=${{TWO_GIS_API_KEY}}`);
                    const data = await response.json();
                    
                    if (data.result?.items && data.result.items.length > 0) {{
                        return data.result.items[0].point;
                    }}
                }} catch (error) {{
                    console.error('Geocoding error:', error);
                }}
                return null;
            }}
            
            // Инициализация карты
            async function initMap() {{
                const address = '{address}';
                const coordinates = await geocodeAddress(address);
                
                if (coordinates) {{
                    const map = new mapgl.Map('map', {{
                        key: TWO_GIS_API_KEY,
                        center: [coordinates.lon, coordinates.lat],
                        zoom: 15
                    }});
                    
                    // Добавляем маркер
                    new mapgl.Marker(map, {{
                        coordinates: [coordinates.lon, coordinates.lat]
                    }});
                }} else {{
                    // Fallback - показываем адрес без карты
                    document.getElementById('map').innerHTML = `
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                            <div class="text-center p-6">
                                <div class="text-4xl mb-4">📍</div>
                                <p class="text-lg font-semibold text-gray-800">{venue_name}</p>
                                <p class="text-gray-600">{city}</p>
                            </div>
                        </div>
                    `;
                }}
            }}
            
            // Запускаем инициализацию карты
            document.addEventListener('DOMContentLoaded', initMap);
        </script>
        """
        
        # Находим место для вставки карты (после заголовка, перед контактами)
        if 'Место проведения' in html_content:
            # Если уже есть секция места проведения, заменяем её
            import re
            pattern = r'<div[^>]*>.*?Место проведения.*?</div>'
            html_content = re.sub(pattern, map_html, html_content, flags=re.DOTALL)
        else:
            # Ищем место для вставки (перед контактами)
            contact_pattern = r'(<div[^>]*>.*?Вопросы\?.*?</div>)'
            html_content = re.sub(contact_pattern, map_html + r'\1', html_content, flags=re.DOTALL)
        
        return html_content
    @staticmethod
    async def generate_and_save_site(db, user_id, event_json):
        """
        Генерирует production-ready React-компонент, сохраняет в базу.
        """
        import uuid
        from ..models.sites import Site
        from ..schemas.sites import SiteGenerationResponse
        from sqlalchemy import select
        from datetime import datetime
        event = EventData.parse_obj(event_json)
        # Убедимся, что event_time есть в content_details (если передано)
        if 'event_time' in event_json.get('content_details', {}):
            event.content_details['event_time'] = event_json['content_details']['event_time']
        generator = SiteGeneratorService()
        react_code = await generator.generate_react_component(event.model_dump())
        result = await db.execute(select(Site.slug))
        existing_slugs = [row[0] for row in result.fetchall()]
        title = event.content_details.get('event_title', 'untitled')
        slug = generate_slug(title, existing_slugs)
        site = Site(
            id=uuid.uuid4(),
            user_id=user_id,
            title=title,
            slug=slug,
            meta_description=event_json.get('meta_description', ''),
            event_type=event.event_type,
            theme=event.theme,
            site_structure={
                "react_component_code": react_code,
                "event_json": event.model_dump()
            },
            html_content="",  # Больше не генерируем HTML
            content_details=event.model_dump(),
            color_preferences=event.color_preferences,
            style_preferences=event_json.get('style_preferences'),
            target_audience=event_json.get('target_audience'),
            is_published=False,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
            view_count=0,
            share_count=0
        )
        db.add(site)
        await db.commit()
        await db.refresh(site)
        return SiteGenerationResponse.model_validate(site)


# Пример использования сервиса
async def example_usage():
    """Пример использования сервиса генерации приглашений"""
    
    service = SiteGeneratorService()
    
    # Пример данных события
    event_data = {
        "event_type": "wedding",
        "theme": "elegant",
        "color_preferences": "romantic_pastels",
        "content_details": {
            "event_title": "Свадьба Анны и Михаила",
            "description": "Приглашаем вас разделить с нами радость этого особенного дня",
            "event_date": "2024-06-15",
            "event_time": "16:00",
            "location": "Ресторан 'Золотая осень'",
            "location_address": "ул. Пушкина, 25, Москва",
            "dress_code": "Торжественный стиль",
            "special_notes": "Церемония начнется в 16:00, просьба не опаздывать",
            "gift_info": "Лучший подарок - ваше присутствие",
            "menu_info": "Европейская кухня, вегетарианские блюда по запросу",
            "closing_message": "С любовью и нетерпением ждём встречи с вами!",
            "rsvp_enabled": True,
            "rsvp_options": ["Буду", "Не смогу", "Уточню позже"],
            "contact_name": "Анна Петрова",
            "contact_phone": "+7 (999) 123-45-67",
            "contact_email": "anna.petrova@example.com"
        }
    }
    
    # Валидация данных
    errors = service.validate_event_data(event_data)
    if errors:

        return
    
    # Генерация HTML приглашения
    html_content = service.generate_html(event_data)
    
    # Сохранение в файл
    filepath = service.save_to_file(html_content)
    
    
    # Генерация React компонента
    react_component = await service.generate_react_component(event_data)
    
    
    # Получение превью темы
    theme_preview = service.get_theme_preview("elegant", "romantic_pastels")
    

if __name__ == "__main__":
    import asyncio
    asyncio.run(example_usage())

