import json
import logging
from typing import Dict, Any, Optional, List, Callable
from datetime import datetime

from openai import AsyncOpenAI
from pydantic import BaseModel, Field

from ..core.config import settings

logger = logging.getLogger(__name__)

# Type alias для callback функции обновления статуса (согласно FastAPI best practices)
StatusCallback = Callable[[str, int, str, Optional[int]], None]


class GenerationStatus(BaseModel):
    """Статус генерации сайта - структурированный ответ для API"""
    step: str = Field(..., description="Текущий этап")
    progress: int = Field(..., description="Прогресс в процентах 0-100") 
    message: str = Field(..., description="Сообщение о текущем действии")
    estimated_time: Optional[int] = Field(None, description="Оставшееся время в секундах")


class GeneratedReactSite(BaseModel):
    """Structured output for generated React site - optimized for modern React development"""
    title: str = Field(..., description="Site title")
    meta_description: str = Field(..., description="Meta description for SEO")
    component_name: str = Field(..., description="Main React component name")
    hero_section: Optional[Dict[str, Any]] = Field(default=None, description="Hero section content and props")
    about_section: Optional[Dict[str, Any]] = Field(default=None, description="About section content and props")
    features_section: Optional[Dict[str, Any]] = Field(default=None, description="Features/services section")
    gallery_section: Optional[Dict[str, Any]] = Field(default=None, description="Gallery/showcase section")
    contact_section: Optional[Dict[str, Any]] = Field(default=None, description="Contact form section")
    footer_section: Optional[Dict[str, Any]] = Field(default=None, description="Footer content")
    color_palette: Dict[str, str] = Field(..., description="Tailwind color palette")
    theme_config: Dict[str, Any] = Field(..., description="Theme configuration for Tailwind")
    animations: List[str] = Field(default_factory=list, description="Animation classes and effects")
    custom_hooks: Optional[List[str]] = Field(default=None, description="Custom React hooks needed")
    dependencies: List[str] = Field(default_factory=list, description="Required npm dependencies")
    # User preferences for smart styling
    event_type: Optional[str] = Field(default=None, description="Event type from user")
    color_preferences: Optional[str] = Field(default=None, description="User color preferences")
    style_preferences: Optional[str] = Field(default=None, description="User style preferences")
    theme: Optional[str] = Field(default=None, description="Theme style preference")
    # CRITICAL: User content data
    content_details: Optional[Dict[str, Any]] = Field(default=None, description="User event details and content")


class SiteGenerationRequest(BaseModel):
    """Input parameters for site generation"""
    event_type: str = Field(..., description="Type of event (wedding, birthday, etc.)")
    theme: str = Field(..., description="Visual theme or style")
    color_preferences: Optional[str] = Field(None, description="Preferred colors")
    content_details: Dict[str, Any] = Field(..., description="Event details and content")
    style_preferences: Optional[str] = Field(None, description="Additional style preferences")
    target_audience: Optional[str] = Field(None, description="Target audience description")


class SiteGeneratorService:
    """OpenAI-powered React site generation service with Tailwind CSS expertise"""
    
    def __init__(self):
        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = "gpt-4o"
    
    async def generate_react_site_structure(
        self, 
        request: SiteGenerationRequest, 
        status_callback: StatusCallback = None
    ) -> GeneratedReactSite:
        """Generate complete React site structure using OpenAI - FIXED VERSION"""
        try:
            logger.info(f"🚀 Starting OpenAI generation for event: {request.event_type}, theme: {request.theme}")
            logger.info(f"🎨 Color preferences: {request.color_preferences}")
            logger.info(f"🎭 Style preferences: {request.style_preferences}")
            
            system_prompt = self._create_react_system_prompt()
            user_prompt = self._create_react_user_prompt(request)
            
            # Test OpenAI connection first
            try:
                logger.info("🔌 Testing OpenAI API connection...")
                
                # FIXED: Use regular chat completion instead of beta structured outputs
                response = await self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    temperature=0.8,  # Higher creativity
                    max_tokens=2000
                )
                
                logger.info("✅ OpenAI API responded successfully!")
                
                # Parse the response manually (more reliable than structured outputs)
                content = response.choices[0].message.content
                logger.info(f"📝 Generated content length: {len(content)} chars")
                
                # Extract structured data from GPT response
                result = self._parse_gpt_response_to_structure(content, request)
                
                # Add user preferences and content to the result
                result.event_type = request.event_type
                result.color_preferences = request.color_preferences
                result.style_preferences = request.style_preferences
                result.theme = request.theme
                result.content_details = request.content_details
                
                # Override title and description with user data if provided
                if request.content_details.get('event_title'):
                    result.title = request.content_details['event_title']
                if request.content_details.get('description'):
                    result.meta_description = request.content_details['description']
                
                logger.info(f"🎉 SUCCESS: Generated site '{result.title}' with {result.event_type} theme")
                return result
                
            except Exception as openai_error:
                logger.error(f"❌ OpenAI API FAILED: {type(openai_error).__name__}: {openai_error}")
                logger.error(f"🔍 API Key present: {'sk-' in str(settings.OPENAI_API_KEY)}")
                
                # Only fallback if necessary, but log it clearly
                logger.warning("⚠️ FALLING BACK to static template due to OpenAI failure")
                return self._create_react_fallback_structure(request)
                
        except Exception as e:
            logger.error(f"💥 CRITICAL ERROR in site generation: {e}")
            raise

    def _parse_gpt_response_to_structure(self, content: str, request: SiteGenerationRequest) -> GeneratedReactSite:
        """Parse GPT response into structured format - more reliable than structured outputs"""
        try:
            # Try to extract JSON if GPT provided it
            import json
            import re
            
            # Look for JSON in the response
            json_match = re.search(r'\{.*\}', content, re.DOTALL)
            if json_match:
                try:
                    parsed_json = json.loads(json_match.group())
                    logger.info("📋 Successfully parsed JSON from GPT response")
                    
                    # Create structure from parsed JSON
                    return GeneratedReactSite(
                        title=parsed_json.get('title', request.content_details.get('event_title', 'Особенное событие')),
                        meta_description=parsed_json.get('meta_description', request.content_details.get('description', 'Приглашаем вас на незабываемое мероприятие')),
                        component_name=parsed_json.get('component_name', f"{request.event_type.title()}Landing"),
                        hero_section=parsed_json.get('hero_section', {}),
                        about_section=parsed_json.get('about_section', {}),
                        features_section=parsed_json.get('features_section', {}),
                        contact_section=parsed_json.get('contact_section', {}),
                        footer_section=parsed_json.get('footer_section', {}),
                        color_palette=parsed_json.get('color_palette', self._get_smart_colors(request)),
                        theme_config=parsed_json.get('theme_config', {}),
                        animations=parsed_json.get('animations', ['hover:scale-105', 'transition-all']),
                        dependencies=parsed_json.get('dependencies', ['react', '@types/react', 'tailwindcss']),
                        event_type=request.event_type,
                        color_preferences=request.color_preferences,
                        style_preferences=request.style_preferences,
                        content_details=request.content_details
                    )
                except json.JSONDecodeError:
                    logger.warning("📋 GPT response not valid JSON, using smart extraction")
            
            # Smart extraction from text if no JSON
            title = self._extract_title_from_text(content, request)
            description = self._extract_description_from_text(content, request)
            
            logger.info(f"🧠 Smart extracted - Title: {title}, Description: {description[:50]}...")
            
            return GeneratedReactSite(
                title=title,
                meta_description=description,
                component_name=f"{request.event_type.title()}Landing",
                hero_section={
                    "title": title,
                    "subtitle": description,
                    "cta_text": "Узнать подробности",
                    "background_type": "gradient_mesh"
                },
                about_section={
                    "title": "О событии",
                    "content": description
                },
                color_palette=self._get_smart_colors(request),
                theme_config=self._get_theme_config(request),
                animations=['hover:scale-105', 'transition-all', 'animate-pulse-soft'],
                dependencies=['react', '@types/react', 'tailwindcss'],
                event_type=request.event_type,
                color_preferences=request.color_preferences,
                style_preferences=request.style_preferences,
                theme=request.theme,
                content_details=request.content_details
            )
            
        except Exception as e:
            logger.error(f"❌ Error parsing GPT response: {e}")
            return self._create_react_fallback_structure(request)

    def _extract_title_from_text(self, content: str, request: SiteGenerationRequest) -> str:
        """Extract title from GPT text response"""
        # Try to find title in content
        import re
        
        # Look for title patterns
        title_patterns = [
            r'title["\s]*:?["\s]*(.*?)["\\n]',
            r'Название["\s]*:?["\s]*(.*?)["\\n]', 
            r'заголовок["\s]*:?["\s]*(.*?)["\\n]',
            r'^#\s*(.*?)$',
            r'^\*\*(.*?)\*\*'
        ]
        
        for pattern in title_patterns:
            match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)
            if match and match.group(1).strip():
                title = match.group(1).strip().strip('"').strip("'")
                if len(title) > 3 and len(title) < 100:
                    return title
        
        # Fallback to request data
        return request.content_details.get('event_title', f"Особенное {request.event_type}")

    def _extract_description_from_text(self, content: str, request: SiteGenerationRequest) -> str:
        """Extract description from GPT text response"""
        import re
        
        # Look for description patterns
        desc_patterns = [
            r'description["\s]*:?["\s]*(.*?)["\\n]',
            r'описание["\s]*:?["\s]*(.*?)["\\n]',
            r'meta_description["\s]*:?["\s]*(.*?)["\\n]'
        ]
        
        for pattern in desc_patterns:
            match = re.search(pattern, content, re.IGNORECASE | re.MULTILINE)
            if match and match.group(1).strip():
                desc = match.group(1).strip().strip('"').strip("'")
                if len(desc) > 10 and len(desc) < 200:
                    return desc
        
        # Use first meaningful paragraph as description
        lines = content.split('\n')
        for line in lines:
            line = line.strip()
            if len(line) > 20 and len(line) < 200 and not line.startswith('#'):
                return line
        
        # Fallback
        return request.content_details.get('description', 'Приглашаем вас на незабываемое мероприятие!')

    def _get_smart_colors(self, request: SiteGenerationRequest) -> Dict[str, str]:
        """Get smart color palette based on user preferences"""
        # Normalize preferences
        enum_to_phrase = {
            # Matches значения из фронта
            'romantic_pastels': 'романтичные пастельные тона розовый голубой лавандовый',
            'vibrant_celebration': 'яркие праздничные цвета красный бирюзовый синий',
            'elegant_neutrals': 'элегантные нейтральные бежевый песочный коричневый золотистый',
            'bold_modern': 'смелые современные темно-синий красный оранжевый',
            'nature_inspired': 'природные зеленый оранжевый фиолетовый',
            'classic_black_white': 'классический черно-белый серый',
        }

        color_pref_raw = request.color_preferences or ''
        if color_pref_raw in enum_to_phrase:
            color_pref_raw = enum_to_phrase[color_pref_raw]

        theme_raw = request.theme or ''
        theme_to_phrase = {
            'modern': 'современный минималистичный',
            'classic': 'классический элегантный',
            'elegant': 'элегантный роскошный',
            'playful': 'игривый яркий',
            'rustic': 'рустик природный',
            'vintage': 'винтажный ретро',
        }
        if theme_raw in theme_to_phrase:
            theme_raw = theme_to_phrase[theme_raw]

        color_prefs = color_pref_raw.lower()
        theme = theme_raw.lower()
        event_type = request.event_type
        
        # Умное определение цветов на основе детальных предпочтений
        if any(word in color_prefs for word in ['элегантные', 'нейтральные', 'бежевый', 'песочный', 'коричневый', 'золотистый']):
            return {'primary': 'amber', 'secondary': 'orange', 'accent': 'yellow'}
        elif any(word in color_prefs for word in ['романтичные', 'пастельные', 'розовый', 'голубой', 'лавандовый']):
            return {'primary': 'rose', 'secondary': 'pink', 'accent': 'purple'}
        elif any(word in color_prefs for word in ['яркие', 'праздничные', 'красный', 'бирюзовый']):
            return {'primary': 'red', 'secondary': 'teal', 'accent': 'blue'}
        elif any(word in color_prefs for word in ['смелые', 'современные', 'темно-синий']):
            return {'primary': 'slate', 'secondary': 'blue', 'accent': 'orange'}
        elif any(word in color_prefs for word in ['природные', 'зеленый']):
            return {'primary': 'emerald', 'secondary': 'teal', 'accent': 'cyan'}
        elif any(word in color_prefs for word in ['классический', 'черно-белый', 'серый']):
            return {'primary': 'slate', 'secondary': 'gray', 'accent': 'zinc'}
        
        # Умное определение по теме
        if any(word in theme for word in ['винтажный', 'ретро', 'ностальгия']):
            return {'primary': 'amber', 'secondary': 'orange', 'accent': 'red'}
        elif any(word in theme for word in ['элегантный', 'роскошный', 'изысканность']):
            return {'primary': 'purple', 'secondary': 'indigo', 'accent': 'pink'}
        elif any(word in theme for word in ['классический', 'традиции']):
            return {'primary': 'slate', 'secondary': 'gray', 'accent': 'blue'}
        elif any(word in theme for word in ['игривый', 'яркий', 'веселье']):
            return {'primary': 'pink', 'secondary': 'purple', 'accent': 'blue'}
        elif any(word in theme for word in ['рустик', 'природный', 'естественность']):
            return {'primary': 'emerald', 'secondary': 'teal', 'accent': 'cyan'}
        elif any(word in theme for word in ['современный', 'минималистичный']):
            return {'primary': 'blue', 'secondary': 'indigo', 'accent': 'purple'}
        
        # Базовое определение по цветам (английский/русский)
        if any(word in color_prefs for word in ['rose', 'розов', 'pink', 'красн']):
            return {'primary': 'rose', 'secondary': 'pink', 'accent': 'purple'}
        elif any(word in color_prefs for word in ['blue', 'син', 'голуб', 'indigo']):
            return {'primary': 'blue', 'secondary': 'indigo', 'accent': 'purple'}
        elif any(word in color_prefs for word in ['green', 'зелен', 'emerald']):
            return {'primary': 'emerald', 'secondary': 'teal', 'accent': 'cyan'}
        elif any(word in color_prefs for word in ['yellow', 'желт', 'amber', 'золот']):
            return {'primary': 'amber', 'secondary': 'orange', 'accent': 'red'}
        elif any(word in color_prefs for word in ['purple', 'фиолет', 'violet']):
            return {'primary': 'purple', 'secondary': 'indigo', 'accent': 'pink'}
        
        # Default по типу события
        event_colors = {
            'wedding': {'primary': 'rose', 'secondary': 'pink', 'accent': 'purple'},
            'birthday': {'primary': 'blue', 'secondary': 'indigo', 'accent': 'purple'},
            'corporate': {'primary': 'slate', 'secondary': 'gray', 'accent': 'zinc'},
            'anniversary': {'primary': 'emerald', 'secondary': 'teal', 'accent': 'cyan'},
            'graduation': {'primary': 'amber', 'secondary': 'orange', 'accent': 'red'}
        }
        
        return event_colors.get(event_type, {'primary': 'blue', 'secondary': 'indigo', 'accent': 'purple'})

    def _get_theme_config(self, request: SiteGenerationRequest) -> Dict[str, Any]:
        """Get theme configuration based on preferences"""
        return {
            "extend": {
                "animation": {
                    "float": "float 6s ease-in-out infinite",
                    "glow": "glow 3s ease-in-out infinite alternate",
                    "gradient": "gradient 15s ease infinite"
                },
                "keyframes": {
                    "float": {
                        "0%, 100%": {"transform": "translateY(0px)"},
                        "50%": {"transform": "translateY(-20px)"}
                    },
                    "glow": {
                        "0%": {"opacity": "0.5"},
                        "100%": {"opacity": "1"}
                    }
                }
            }
        }

    async def generate_react_page(self, site_data: GeneratedReactSite) -> str:
        """Generate professional React component with v0.dev-inspired prompting"""
        try:
            # V0.dev inspired system prompt with thinking blocks
            system_prompt = """<Thinking>
You are a world-class React/TypeScript architect inspired by v0.dev, bolt.new, and Loveable.
Your mission: Generate production-ready React components that are visually stunning and technically perfect.

Key principles from successful AI tools:
1. V0.dev: MDX format with structured thinking, TypeScript-first approach
2. Bolt.new: Full-stack integration capabilities  
3. GrapesJS: Visual component modularity
4. Deco.cx: Modern React patterns with Tailwind mastery
5. ReactFlow: Node-based thinking for component relationships

Output format: Pure TypeScript React component, ready to copy-paste
</Thinking>

🎯 CRITICAL MISSION: Create a VISUALLY STUNNING React landing page

🔥 MANDATORY TECHNICAL REQUIREMENTS:

⚛️ REACT ARCHITECTURE:
✅ Functional components with TypeScript interfaces
✅ useState, useCallback, useEffect hooks
✅ Proper event handling with type safety
✅ Component composition patterns

🎨 ADVANCED TAILWIND TECHNIQUES:
✅ Glass morphism: backdrop-blur-xl, bg-white/10
✅ Gradient mastery: bg-gradient-to-br, bg-gradient-conic
✅ Animation excellence: hover:scale-105, transition-all duration-300
✅ Typography hierarchy: text-6xl, tracking-tight, font-extrabold

💎 VISUAL EXCELLENCE:
✅ Hero section with animated gradients
✅ Features grid with hover effects  
✅ Contact form with validation
✅ Responsive design (mobile-first)
✅ Accessibility (WCAG compliant)

🚀 MODERN PATTERNS:
✅ Controlled form components
✅ Loading states and error handling
✅ Micro-interactions on hover
✅ Semantic HTML structure

RETURN ONLY THE COMPLETE .TSX FILE - NO EXPLANATIONS!"""

            # Enhanced user prompt with structured data
            user_prompt = f"""Create a {site_data.event_type} landing page with these specifications:

**Site Data:**
- Title: {site_data.title}
- Description: {site_data.meta_description}
- Component Name: {site_data.component_name}
- Color Palette: {site_data.color_palette}
- Animations: {site_data.animations}

**Sections Required:**
- Hero: Eye-catching header with call-to-action
- About: Compelling description
- Features: Key highlights (3-4 items)
- Contact: Working form with validation
- Footer: Clean and professional

**Technical Specs:**
- TypeScript interfaces for all props
- Modern React hooks (useState, useCallback)
- Tailwind CSS with glass morphism effects
- Responsive design for all devices
- Form validation and submission handling

Generate a complete, production-ready React component that embodies the {site_data.event_type} theme with the specified color palette."""

            # Enhanced API call with better error handling
            try:
                response = await self.client.chat.completions.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt}
                    ],
                    max_tokens=4000,
                    temperature=0.7
                )
                
                react_code = response.choices[0].message.content.strip()
                
                # Clean and validate the generated code
                if "```tsx" in react_code:
                    react_code = react_code.split("```tsx")[1].split("```")[0].strip()
                elif "```typescript" in react_code:
                    react_code = react_code.split("```typescript")[1].split("```")[0].strip()
                elif "```" in react_code:
                    react_code = react_code.split("```")[1].split("```")[0].strip()
                
                # Ensure proper imports and exports
                if not react_code.startswith("import"):
                    react_code = f"import React, {{ useState, useCallback }} from 'react';\n\n{react_code}"
                
                if not f"export default {site_data.component_name}" in react_code:
                    react_code += f"\n\nexport default {site_data.component_name};"
                
                # Подставляем динамические цвета из palette
                react_code = (
                    react_code
                    .replace("PRIMARY_DARK", f"{primary}-900")
                    .replace("SECONDARY_DARK", f"{secondary}-900")
                    .replace("PRIMARY", primary)
                    .replace("SECONDARY", secondary)
                )
                
                return react_code
                
            except Exception as api_error:
                # Используем fallback при ошибке API
                return self._create_v0_inspired_fallback(site_data)
                
        except Exception as e:
            # Используем fallback при любой ошибке генерации
            return self._create_v0_inspired_fallback(site_data)

    async def generate_html_preview(self, site_data: GeneratedReactSite) -> str:
        """Generate HTML preview with smart color detection and user-selected styles"""
        try:
            # Extract user data from site_data.content_details (user form input)
            content_details = getattr(site_data, 'content_details', {}) or {}
            color_preferences = getattr(site_data, 'color_preferences', '') or ''
            theme = getattr(site_data, 'theme', '') or ''
            event_type = getattr(site_data, 'event_type', 'birthday')
            
            # Extract real user content - USE FORM DATA FIRST, then fallback to site_data
            event_title = content_details.get('event_title') or site_data.title or 'Ваше событие'
            event_date = content_details.get('event_date') or 'Дата уточняется'
            event_time = content_details.get('event_time') or 'Время уточняется'  
            event_location = content_details.get('venue_name') or 'Место уточняется'
            venue_address = content_details.get('venue_address', '')
            event_description = content_details.get('description') or 'Добро пожаловать на наше событие!'
            organizer_name = content_details.get('contact_name') or 'Организатор'
            organizer_phone = content_details.get('contact_phone') or '+7 (999) 000-00-00'
            organizer_email = content_details.get('contact_email') or 'contact@event.com'
            template_id = content_details.get('template_id', '')
            decorative_elements = content_details.get('decorative_elements', '')
            
            # Log user data extraction for debugging
            logger.info(f"🎯 USER DATA EXTRACTED:")
            logger.info(f"  Event Title: {event_title}")
            logger.info(f"  Event Date: {event_date}")
            logger.info(f"  Event Time: {event_time}")
            logger.info(f"  Venue: {event_location}")
            logger.info(f"  Description: {event_description[:50]}...")
            logger.info(f"  Contact: {organizer_name}")
            logger.info(f"  Color Prefs: {color_preferences}")
            logger.info(f"  Theme: {theme}")
            
            # Smart color scheme detection based on user preferences
            def get_smart_color_scheme(color_preferences: str, theme: str, event_type: str) -> str:
                if not color_preferences and not theme:
                    return event_type
                
                color_prefs_lower = (color_preferences or '').lower()
                theme_lower = (theme or '').lower()
                
                # Детальное определение по предпочтениям
                if any(word in color_prefs_lower for word in ['элегантные', 'нейтральные', 'бежевый', 'песочный', 'коричневый', 'золотистый']):
                    return 'vintage'  # Винтажная золотистая схема
                if any(word in color_prefs_lower for word in ['романтичные', 'пастельные', 'розовый', 'голубой', 'лавандовый']):
                    return 'wedding'
                if any(word in color_prefs_lower for word in ['яркие', 'праздничные', 'красный', 'бирюзовый']):
                    return 'celebration'  # Яркая праздничная схема
                if any(word in color_prefs_lower for word in ['смелые', 'современные', 'темно-синий']):
                    return 'corporate'
                if any(word in color_prefs_lower for word in ['природные', 'зеленый']):
                    return 'anniversary'
                if any(word in color_prefs_lower for word in ['классический', 'черно-белый', 'серый']):
                    return 'corporate'
                
                # Определение по теме
                if any(word in theme_lower for word in ['винтажный', 'ретро', 'ностальгия']):
                    return 'vintage'
                if any(word in theme_lower for word in ['элегантный', 'роскошный', 'изысканность']):
                    return 'elegant'
                if any(word in theme_lower for word in ['классический', 'традиции']):
                    return 'corporate'
                if any(word in theme_lower for word in ['игривый', 'яркий', 'веселье']):
                    return 'celebration'
                if any(word in theme_lower for word in ['рустик', 'природный', 'естественность']):
                    return 'anniversary'
                if any(word in theme_lower for word in ['современный', 'минималистичный']):
                    return 'birthday'
                
                # Базовое определение по цветам
                if any(word in color_prefs_lower for word in ['rose', 'розов', 'pink', 'красн']):
                    return 'wedding'
                if any(word in color_prefs_lower for word in ['blue', 'син', 'голуб', 'indigo', 'фиолет']):
                    return 'birthday'
                if any(word in color_prefs_lower for word in ['emerald', 'зелен', 'teal', 'cyan']):
                    return 'anniversary'
                if any(word in color_prefs_lower for word in ['amber', 'желт', 'золот', 'orange', 'оранж']):
                    return 'graduation'
                if any(word in color_prefs_lower for word in ['slate', 'сер', 'gray', 'серый']):
                    return 'corporate'
                
                return event_type
            
            # Determine actual color scheme
            actual_color_scheme = get_smart_color_scheme(color_preferences, theme, event_type)
            
            # Enhanced color palettes matching frontend logic
            color_palettes = {
                'vintage': {
                    'primary': 'amber', 'secondary': 'orange', 'accent': 'red',
                    'gradient': 'from-amber-50 via-orange-50 to-red-50',
                    'hero_gradient': 'from-amber-900 via-orange-900 to-red-900',
                    'text_gradient': 'from-white via-amber-200 to-orange-200',
                    'glass_tint': 'amber'
                },
                'elegant': {
                    'primary': 'purple', 'secondary': 'indigo', 'accent': 'pink',
                    'gradient': 'from-purple-50 via-indigo-50 to-pink-50',
                    'hero_gradient': 'from-purple-900 via-indigo-900 to-pink-900',
                    'text_gradient': 'from-white via-purple-200 to-pink-200',
                    'glass_tint': 'purple'
                },
                'celebration': {
                    'primary': 'red', 'secondary': 'teal', 'accent': 'blue',
                    'gradient': 'from-red-50 via-teal-50 to-blue-50',
                    'hero_gradient': 'from-red-900 via-teal-900 to-blue-900',
                    'text_gradient': 'from-white via-red-200 to-blue-200',
                    'glass_tint': 'red'
                },
                'wedding': {
                    'primary': 'rose', 'secondary': 'pink', 'accent': 'purple',
                    'gradient': 'from-rose-50 via-pink-50 to-purple-50',
                    'hero_gradient': 'from-rose-900 via-pink-900 to-purple-900',
                    'text_gradient': 'from-white via-rose-200 to-purple-200',
                    'glass_tint': 'rose'
                },
                'birthday': {
                    'primary': 'blue', 'secondary': 'indigo', 'accent': 'purple',
                    'gradient': 'from-blue-50 via-indigo-50 to-purple-50',
                    'hero_gradient': 'from-blue-900 via-indigo-900 to-purple-900',
                    'text_gradient': 'from-white via-blue-200 to-indigo-200',
                    'glass_tint': 'blue'
                },
                'corporate': {
                    'primary': 'slate', 'secondary': 'gray', 'accent': 'zinc',
                    'gradient': 'from-slate-50 via-gray-50 to-zinc-50',
                    'hero_gradient': 'from-slate-900 via-gray-900 to-zinc-900',
                    'text_gradient': 'from-white via-slate-200 to-gray-200',
                    'glass_tint': 'slate'
                },
                'anniversary': {
                    'primary': 'emerald', 'secondary': 'teal', 'accent': 'cyan',
                    'gradient': 'from-emerald-50 via-teal-50 to-cyan-50',
                    'hero_gradient': 'from-emerald-900 via-teal-900 to-cyan-900',
                    'text_gradient': 'from-white via-emerald-200 to-teal-200',
                    'glass_tint': 'emerald'
                },
                'graduation': {
                    'primary': 'amber', 'secondary': 'orange', 'accent': 'red',
                    'gradient': 'from-amber-50 via-orange-50 to-red-50',
                    'hero_gradient': 'from-amber-900 via-orange-900 to-red-900',
                    'text_gradient': 'from-white via-amber-200 to-orange-200',
                    'glass_tint': 'amber'
                },
                'housewarming': {
                    'primary': 'emerald', 'secondary': 'green', 'accent': 'teal',
                    'gradient': 'from-emerald-50 via-green-50 to-teal-50',
                    'hero_gradient': 'from-emerald-900 via-green-900 to-teal-900',
                    'text_gradient': 'from-white via-emerald-200 to-green-200',
                    'glass_tint': 'emerald'
                }
            }
            
            # Попробуем использовать palette из site_data (пришёл из _get_smart_colors)
            site_palette = getattr(site_data, 'color_palette', {}) or {}

            if {'primary', 'secondary'}.issubset(site_palette.keys()):
                primary = site_palette['primary']
                secondary = site_palette['secondary']
                palette = {
                    'primary': primary,
                    'secondary': secondary,
                    'hero': f"from-{primary}-900 via-{secondary}-900 to-{primary}-900"
                }
            else:
                # Статическое резервное соответствие
                color_palettes = {
                    'wedding': {'primary': 'rose', 'secondary': 'pink', 'hero': 'from-rose-900 via-pink-900 to-purple-900'},
                    'birthday': {'primary': 'blue', 'secondary': 'indigo', 'hero': 'from-blue-900 via-indigo-900 to-purple-900'},
                    'corporate': {'primary': 'slate', 'secondary': 'gray', 'hero': 'from-slate-900 via-gray-900 to-zinc-900'},
                    'anniversary': {'primary': 'emerald', 'secondary': 'teal', 'hero': 'from-emerald-900 via-teal-900 to-cyan-900'},
                    'graduation': {'primary': 'amber', 'secondary': 'orange', 'hero': 'from-amber-900 via-orange-900 to-red-900'}
                }
                palette = color_palettes.get(actual_color_scheme, color_palettes['birthday'])
            
            # Generate HTML with proper variable substitution
            html_template = f"""<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{event_title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    animation: {{
                        'float': 'float 6s ease-in-out infinite',
                        'float-delayed': 'float 8s ease-in-out infinite', 
                        'glow': 'glow 3s ease-in-out infinite alternate',
                        'fade-in': 'fadeIn 1.2s ease-out',
                        'fade-in-up': 'fadeInUp 1s ease-out',
                        'spin-slow': 'spin 30s linear infinite',
                        'pulse-soft': 'pulse 4s ease-in-out infinite',
                        'bounce-soft': 'bounceSoft 2s ease-in-out infinite'
                    }},
                    keyframes: {{
                        float: {{ 
                            '0%, 100%': {{ transform: 'translateY(0px) rotate(0deg)' }}, 
                            '50%': {{ transform: 'translateY(-20px) rotate(2deg)' }} 
                        }},
                        glow: {{ 
                            '0%': {{ opacity: '0.4' }}, 
                            '100%': {{ opacity: '0.8' }} 
                        }},
                        fadeIn: {{ 
                            '0%': {{ opacity: '0', transform: 'translateY(30px)' }}, 
                            '100%': {{ opacity: '1', transform: 'translateY(0)' }} 
                        }},
                        fadeInUp: {{ 
                            '0%': {{ opacity: '0', transform: 'translateY(40px)' }}, 
                            '100%': {{ opacity: '1', transform: 'translateY(0)' }} 
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        .text-shadow {{ text-shadow: 0 4px 8px rgba(0,0,0,0.3); }}
        .glass-effect {{ 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br {palette['hero_gradient']} text-white overflow-x-hidden">
    <!-- Hero Section -->
    <section class="relative min-h-screen flex items-center justify-center overflow-hidden">
        <!-- Animated Background Elements -->
        <div class="absolute inset-0 bg-gradient-conic from-{palette['primary']}-500 via-{palette['secondary']}-500 to-{palette['primary']}-500 opacity-20 animate-spin-slow"></div>
        <div class="absolute top-20 left-20 w-32 h-32 bg-gradient-conic from-{palette['primary']}-500 via-{palette['secondary']}-400 to-{palette['primary']}-500 rounded-full opacity-20 animate-float blur-sm"></div>
        <div class="absolute bottom-32 right-20 w-24 h-24 bg-gradient-conic from-{palette['secondary']}-500 via-{palette['primary']}-400 to-{palette['secondary']}-500 opacity-25 animate-float-delayed"></div>
        
        <!-- Hero Content -->
        <div class="relative z-10 max-w-5xl mx-auto text-center px-6">
            <div class="space-y-8">
                <h1 class="text-4xl md:text-6xl lg:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r {palette['text_gradient']} mb-8 tracking-tight animate-fade-in text-shadow leading-tight">
                    {event_title}
                </h1>
                <p class="text-lg md:text-xl lg:text-2xl text-gray-200 mb-12 leading-relaxed max-w-4xl mx-auto animate-fade-in font-light" style="animation-delay: 0.3s;">
                    {event_description}
                </p>
                
                <!-- Event Details Cards -->
                <div class="flex flex-wrap justify-center gap-4 mb-12 animate-fade-in" style="animation-delay: 0.4s;">
                    <div class="glass-effect px-4 py-3 rounded-xl text-white">
                        <div class="text-xs opacity-80">📅 Дата</div>
                        <div class="font-bold text-sm">{event_date}</div>
                    </div>
                    <div class="glass-effect px-4 py-3 rounded-xl text-white">
                        <div class="text-xs opacity-80">⏰ Время</div>
                        <div class="font-bold text-sm">{event_time}</div>
                    </div>
                    <div class="glass-effect px-4 py-3 rounded-xl text-white">
                        <div class="text-xs opacity-80">📍 Место</div>
                        <div class="font-bold text-sm">{event_location}</div>
                    </div>
                </div>
                
                <div class="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style="animation-delay: 0.6s;">
                    <button class="group px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 transform bg-gradient-to-r from-{palette['primary']}-600 to-{palette['secondary']}-600 text-white hover:scale-105 hover:shadow-xl relative overflow-hidden">
                        <span class="relative z-10">Присоединиться</span>
                    </button>
                    <button class="group px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-500 transform glass-effect text-white hover:bg-white/30 hover:scale-105">
                        <span class="relative z-10">Подробнее</span>
                    </button>
                </div>
            </div>
        </div>
    </section>

    <!-- About Section -->
    <section class="py-20 px-6 bg-gradient-to-r from-{palette['primary']}-900/30 to-{palette['secondary']}-900/30 backdrop-blur-xl relative">
        <div class="max-w-4xl mx-auto text-center relative z-10">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-8 animate-fade-in-up text-shadow">
                О событии
            </h2>
            <p class="text-lg md:text-xl text-gray-200 leading-relaxed animate-fade-in-up font-light" style="animation-delay: 0.2s;">
                {event_description}
            </p>
            
            <!-- Event Info Grid -->
            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 animate-fade-in-up" style="animation-delay: 0.4s;">
                <div class="glass-effect p-6 rounded-2xl hover:scale-105 transition-all duration-300">
                    <div class="text-3xl mb-3">📍</div>
                    <h3 class="text-lg font-bold text-white mb-2">Адрес</h3>
                    <p class="text-gray-300 text-sm">{venue_address if venue_address else 'Адрес уточняется'}</p>
                </div>
                <div class="glass-effect p-6 rounded-2xl hover:scale-105 transition-all duration-300">
                    <div class="text-3xl mb-3">📱</div>
                    <h3 class="text-lg font-bold text-white mb-2">Контакты</h3>
                    <p class="text-gray-300 text-sm">{organizer_name}</p>
                    <p class="text-gray-300 text-xs">{organizer_phone}</p>
                </div>
                <div class="glass-effect p-6 rounded-2xl hover:scale-105 transition-all duration-300 md:col-span-2 lg:col-span-1">
                    <div class="text-3xl mb-3">✉️</div>
                    <h3 class="text-lg font-bold text-white mb-2">Email</h3>
                    <p class="text-gray-300 text-xs break-all">{organizer_email}</p>
                </div>
            </div>
        </div>
    </section>
    
    <!-- RSVP Section -->
    <section class="py-20 px-6 relative">
        <div class="absolute inset-0 bg-gradient-to-br from-{palette['secondary']}-950 via-{palette['primary']}-950 to-{palette['accent']}-950"></div>
        <div class="max-w-3xl mx-auto text-center relative z-10">
            <h2 class="text-3xl md:text-5xl font-extrabold text-white mb-8 animate-fade-in-up text-shadow">
                Подтвердите участие
            </h2>
            <p class="text-lg text-gray-200 mb-8 animate-fade-in-up" style="animation-delay: 0.2s;">
                Мы будем рады видеть вас на нашем событии!
            </p>
            
            <div class="glass-effect p-6 rounded-2xl animate-fade-in-up" style="animation-delay: 0.4s;">
                <form class="space-y-4">
                    <div class="grid md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Ваше имя" class="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:bg-white/20 focus:border-{palette['primary']}-400 transition-all text-sm">
                        <input type="email" placeholder="Email" class="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-300 focus:bg-white/20 focus:border-{palette['primary']}-400 transition-all text-sm">
                    </div>
                    <select class="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white focus:bg-white/20 focus:border-{palette['primary']}-400 transition-all text-sm">
                        <option value="">Количество гостей</option>
                        <option value="1">1 человек</option>
                        <option value="2">2 человека</option>
                        <option value="3">3 человека</option>
                        <option value="4">4+ человек</option>
                    </select>
                    <button type="submit" class="w-full py-3 px-6 rounded-lg font-bold text-lg bg-gradient-to-r from-{palette['primary']}-600 to-{palette['secondary']}-600 text-white hover:scale-105 hover:shadow-xl transition-all duration-300">
                        🎉 Подтвердить участие
                    </button>
                </form>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="py-12 bg-gradient-to-r from-slate-900 via-{palette['primary']}-900 to-slate-900 border-t border-white/10 relative">
        <div class="max-w-4xl mx-auto px-6 text-center relative z-10">
            <div class="space-y-4">
                <h3 class="text-2xl font-bold text-white animate-fade-in">
                    {event_title}
                </h3>
                <p class="text-white/80 text-sm font-light animate-fade-in" style="animation-delay: 0.1s;">
                    Создано с ❤️ и использованием современных технологий
                </p>
            </div>
        </div>
    </footer>

    <script>
        // Enhanced animations and interactions - Fixed ResizeObserver issues
        document.addEventListener('DOMContentLoaded', function() {{
            // Suppress ResizeObserver loop errors
            const resizeObserverErr = window.ResizeObserver;
            window.ResizeObserver = class ResizeObserver extends resizeObserverErr {{
                constructor(callback) {{
                    const wrappedCallback = (entries, observer) => {{
                        window.requestAnimationFrame(() => {{
                            try {{
                                callback(entries, observer);
                            }} catch (e) {{
                                // Suppress ResizeObserver loop errors
                                if (e.message && e.message.includes('ResizeObserver loop')) {{
                                    return;
                                }}
                                throw e;
                            }}
                        }});
                    }};
                    super(wrappedCallback);
                }}
            }};
            
            // Suppress ResizeObserver errors globally
            window.addEventListener('error', function(e) {{
                if (e.message && e.message.includes('ResizeObserver loop')) {{
                    e.stopImmediatePropagation();
                    e.preventDefault();
                    return false;
                }}
            }});
            
            // Add fade-in animations with proper error handling
            const observerOptions = {{
                threshold: 0.1,
                rootMargin: '50px 0px'
            }};
            
            const observer = new IntersectionObserver((entries) => {{
                entries.forEach(entry => {{
                    if (entry.isIntersecting) {{
                        try {{
                            entry.target.style.animationPlayState = 'running';
                            entry.target.style.opacity = '1';
                        }} catch (e) {{
                            // Ignore errors
                        }}
                    }}
                }});
            }}, observerOptions);
            
            // Observe all animated elements with error handling
            try {{
                document.querySelectorAll('[class*="animate-"]').forEach(el => {{
                    if (el && el.style !== undefined) {{
                        observer.observe(el);
                    }}
                }});
            }} catch (e) {{
                // Ignore observer errors
            }}
            
            // Enhanced button hover effects with error handling
            try {{
                document.querySelectorAll('button').forEach(button => {{
                    button.addEventListener('mouseenter', function() {{
                        try {{
                            this.style.transform += ' scale(1.05)';
                        }} catch (e) {{
                            // Ignore transform errors
                        }}
                    }});
                    
                    button.addEventListener('mouseleave', function() {{
                        try {{
                            this.style.transform = this.style.transform.replace(' scale(1.05)', '');
                        }} catch (e) {{
                            // Ignore transform errors
                        }}
                    }});
                }});
            }} catch (e) {{
                // Ignore button errors
            }}
        }});
    </script>
</body>
</html>"""
            
            return html_template
            
        except Exception as e:
            logger.error(f"Error generating enhanced HTML preview: {e}")
            return self._create_basic_html_fallback(site_data)

    def _create_basic_html_fallback(self, site_data: GeneratedReactSite) -> str:
        """Create enhanced HTML fallback with smart color detection"""
        # Extract user preferences
        color_preferences = getattr(site_data, 'color_preferences', '') or ''
        event_type = getattr(site_data, 'event_type', 'birthday')
        
        # Smart color scheme detection
        def get_smart_color_scheme(color_preferences: str, event_type: str) -> str:
            if not color_preferences:
                return event_type
            
            color_prefs_lower = color_preferences.lower()
            if any(word in color_prefs_lower for word in ['rose', 'розов', 'pink', 'красн']):
                return 'wedding'
            if any(word in color_prefs_lower for word in ['blue', 'син', 'голуб', 'indigo', 'фиолет']):
                return 'birthday'
            if any(word in color_prefs_lower for word in ['emerald', 'зелен', 'teal', 'cyan']):
                return 'anniversary'
            if any(word in color_prefs_lower for word in ['amber', 'желт', 'золот', 'orange', 'оранж']):
                return 'graduation'
            if any(word in color_prefs_lower for word in ['slate', 'сер', 'gray', 'серый']):
                return 'corporate'
            
            return event_type
        
        actual_color_scheme = get_smart_color_scheme(color_preferences, event_type)
        
        # Color palettes
        color_palettes = {
            'wedding': {'primary': 'rose', 'secondary': 'pink', 'hero': 'from-rose-900 via-pink-900 to-purple-900'},
            'birthday': {'primary': 'blue', 'secondary': 'indigo', 'hero': 'from-blue-900 via-indigo-900 to-purple-900'},
            'corporate': {'primary': 'slate', 'secondary': 'gray', 'hero': 'from-slate-900 via-gray-900 to-zinc-900'},
            'anniversary': {'primary': 'emerald', 'secondary': 'teal', 'hero': 'from-emerald-900 via-teal-900 to-cyan-900'},
            'graduation': {'primary': 'amber', 'secondary': 'orange', 'hero': 'from-amber-900 via-orange-900 to-red-900'}
        }
        
        palette = color_palettes.get(actual_color_scheme, color_palettes['birthday'])
        
        return f"""<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{site_data.title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {{
            theme: {{
                extend: {{
                    animation: {{
                        'float': 'float 6s ease-in-out infinite',
                        'glow': 'glow 3s ease-in-out infinite alternate',
                        'fade-in': 'fadeIn 1.2s ease-out'
                    }},
                    keyframes: {{
                        float: {{ 
                            '0%, 100%': {{ transform: 'translateY(0px)' }}, 
                            '50%': {{ transform: 'translateY(-20px)' }} 
                        }},
                        glow: {{ 
                            '0%': {{ opacity: '0.4' }}, 
                            '100%': {{ opacity: '0.8' }} 
                        }},
                        fadeIn: {{ 
                            '0%': {{ opacity: '0', transform: 'translateY(30px)' }}, 
                            '100%': {{ opacity: '1', transform: 'translateY(0)' }} 
                        }}
                    }}
                }}
            }}
        }}
    </script>
    <style>
        .text-shadow {{ text-shadow: 0 4px 8px rgba(0,0,0,0.3); }}
        .glass-effect {{ 
            background: rgba(255, 255, 255, 0.1);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }}
    </style>
</head>
<body class="min-h-screen bg-gradient-to-br {palette['hero']} text-white overflow-x-hidden">
    <div class="relative min-h-screen flex items-center justify-center">
        <!-- Animated Background -->
        <div class="absolute inset-0 bg-gradient-conic from-{palette['primary']}-500 via-{palette['secondary']}-500 to-{palette['primary']}-500 opacity-20 animate-spin-slow"></div>
        <div class="absolute top-20 left-20 w-32 h-32 bg-{palette['primary']}-500/20 rounded-full animate-float blur-sm"></div>
        <div class="absolute bottom-20 right-20 w-24 h-24 bg-{palette['secondary']}-500/25 rounded-full animate-float" style="animation-delay: 2s;"></div>
        
        <!-- Content -->
        <div class="relative z-10 container mx-auto px-6 text-center">
            <h1 class="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-{palette['primary']}-200 to-{palette['secondary']}-200 mb-8 animate-fade-in tracking-tight">
                {site_data.title}
            </h1>
            <p class="text-xl md:text-2xl text-gray-200 mb-12 max-w-3xl mx-auto animate-fade-in leading-relaxed" style="animation-delay: 0.3s;">
                {site_data.meta_description}
            </p>
            <button class="px-10 py-5 rounded-3xl font-bold text-xl bg-gradient-to-r from-{palette['primary']}-600 to-{palette['secondary']}-600 text-white hover:scale-110 transition-all duration-500 animate-fade-in shadow-2xl" style="animation-delay: 0.6s;">
                Узнать больше
            </button>
        </div>
    </div>
</body>
</html>"""

    def _create_v0_inspired_fallback(self, site_data: GeneratedReactSite) -> str:
        """Create v0.dev inspired React fallback component"""
        component_name = site_data.component_name
        title = site_data.title
        description = site_data.meta_description
        color_palette = site_data.color_palette
        animations = site_data.animations
        
        # Определяем динамические цвета из palette (если доступны)
        primary = color_palette.get('primary', 'purple') if isinstance(color_palette, dict) else 'purple'
        secondary = color_palette.get('secondary', 'pink') if isinstance(color_palette, dict) else 'pink'
        
        # V0.dev style template с плейсхолдерами для цветов
        react_template = """import React, { useState, useCallback } from 'react';

interface Props {}

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Modern React component with v0.dev patterns
const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <section className={`py-20 px-6 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const GlassButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false 
}) => {
  const baseClasses = "px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform";
  const variantClasses = variant === 'primary' 
    ? "bg-gradient-to-r from-PRIMARY-600 to-SECONDARY-600 text-white hover:scale-105 hover:shadow-2xl"
    : "bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const COMPONENT_NAME: React.FC<Props> = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitStatus('idle');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <Section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-conic from-purple-500 via-pink-500 to-purple-500 opacity-20 animate-spin-slow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-8 tracking-tight">
            TITLE_PLACEHOLDER
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            DESCRIPTION_PLACEHOLDER
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <GlassButton variant="primary">Начать сейчас</GlassButton>
            <GlassButton variant="secondary">Узнать больше</GlassButton>
          </div>
        </div>
      </Section>

      {/* About Section */}
      <Section className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-8">О нас</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            DESCRIPTION_PLACEHOLDER
          </p>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-lg">
            © 2024 TITLE_PLACEHOLDER. Создано с использованием современных технологий
          </p>
        </div>
      </footer>
    </div>
  );
};

export default COMPONENT_NAME;"""

        # Safe string replacement (no f-strings)
        react_code = react_template.replace("COMPONENT_NAME", component_name)
        react_code = react_code.replace("TITLE_PLACEHOLDER", title)
        react_code = react_code.replace("DESCRIPTION_PLACEHOLDER", description)
        
        return react_code

    def _create_react_system_prompt(self) -> str:
        """Create React-specific system prompt for structure generation"""
        return """🎯 ТЫ - ГЕНИЙ ДИЗАЙНА И REACT АРХИТЕКТОР!

🚀 КРИТИЧЕСКАЯ МИССИЯ: Создать УНИКАЛЬНУЮ структуру сайта!

⚡ ОБЯЗАТЕЛЬНО:
- ВСЕГДА учитывай предпочтения пользователя по цветам
- КАЖДЫЙ сайт должен быть УНИКАЛЬНЫМ (не шаблон!)
- Создавай креативные, эмоциональные заголовки
- Используй умную цветовую палитру

📋 ФОРМАТ ОТВЕТА - ТОЛЬКО JSON:
{
  "title": "Креативный заголовок (не шаблон!)",
  "meta_description": "Эмоциональное описание под 160 символов",
  "component_name": "УникальноеИмяКомпонента",
  "hero_section": {
    "title": "Захватывающий заголовок для этого события",
    "subtitle": "Живое описание с характером",
    "cta_text": "Активная кнопка действия",
    "background_type": "gradient_mesh"
  },
  "about_section": {
    "title": "Креативный заголовок раздела",
    "content": "Богатое, детальное описание"
  },
  "color_palette": {
    "primary": "цвет-на-основе-предпочтений-пользователя",
    "secondary": "дополнительный-цвет",
    "accent": "акцентный-цвет"
  },
  "theme_config": {
    "extend": {
      "animation": {
        "custom_float": "float 6s ease-in-out infinite"
      }
    }
  },
  "animations": ["hover:scale-105", "transition-all"],
  "dependencies": ["react", "@types/react", "tailwindcss"]
}

🎨 ПРИНЦИПЫ ДИЗАЙНА:
✅ Glass morphism с backdrop-blur эффектами
✅ Сложные градиенты и overlays
✅ Плавные микро-взаимодействия
✅ Мобильная адаптивность
✅ Доступность (WCAG)

🔥 МАНДАТ КРЕАТИВНОСТИ:
- НИ ОДНОГО общего шаблона!
- КАЖДЫЙ сайт - произведение искусства
- Цвета должны вызывать правильные эмоции
- Удивляй инновационными решениями

ВОЗВРАЩАЙ ТОЛЬКО JSON БЕЗ ОБЪЯСНЕНИЙ!"""

    def _create_react_user_prompt(self, request: SiteGenerationRequest) -> str:
        """Create React-enhanced user prompt (shortened for speed)"""
        content_json = json.dumps(request.content_details, ensure_ascii=False, indent=2)
        component_names = {
            'wedding': 'WeddingLanding',
            'birthday': 'BirthdayLanding', 
            'corporate': 'CorporateLanding',
            'anniversary': 'AnniversaryLanding',
            'graduation': 'GraduationLanding'
        }
        component_name = component_names.get(request.event_type, 'EventLanding')
        react_colors = {
            'wedding': {
                'hero_gradient': 'bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50',
                'mesh_overlay': 'bg-gradient-to-br from-rose-400/10 via-pink-400/15 to-purple-400/10',
                'glass_primary': 'bg-white/20 backdrop-blur-xl border border-white/30',
                'glass_secondary': 'bg-rose-50/30 backdrop-blur-lg border border-rose-200/40',
                'button_primary': 'bg-gradient-to-r from-rose-500 to-pink-600',
                'text_gradient': 'bg-gradient-to-r from-gray-800 via-rose-800 to-purple-800'
            },
            'birthday': {
                'hero_gradient': 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
                'mesh_overlay': 'bg-gradient-to-br from-blue-400/12 via-indigo-400/18 to-purple-400/12',
                'glass_primary': 'bg-white/25 backdrop-blur-xl border border-white/35',
                'glass_secondary': 'bg-blue-50/35 backdrop-blur-lg border border-blue-200/45',
                'button_primary': 'bg-gradient-to-r from-blue-500 to-indigo-600',
                'text_gradient': 'bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800'
            },
            'housewarming': {
                'hero_gradient': 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
                'mesh_overlay': 'bg-gradient-to-br from-emerald-400/10 via-green-400/15 to-teal-400/10',
                'glass_primary': 'bg-white/20 backdrop-blur-xl border border-white/30',
                'glass_secondary': 'bg-emerald-50/30 backdrop-blur-lg border border-emerald-200/40',
                'button_primary': 'bg-gradient-to-r from-emerald-500 to-teal-600',
                'text_gradient': 'bg-gradient-to-r from-emerald-900 via-green-800 to-teal-800'
            }
        }
        colors = react_colors.get(request.event_type, react_colors['birthday'])
        return f"""Создай структуру React-лендинга для события типа {request.event_type} с темой {request.theme}.

Требования:
- Компонент: {component_name}
- Цветовая палитра: {json.dumps(colors, ensure_ascii=False)}
- Основные секции: hero, about, features, contact, footer
- Используй современные подходы React и Tailwind CSS
- Не добавляй подробные анимации, формы и сложную архитектуру
- Верни только JSON-структуру сайта без объяснений

Детали события:
{content_json}
"""

    def _create_react_fallback_structure(self, request: SiteGenerationRequest) -> GeneratedReactSite:
        """Create React fallback structure when API fails"""
        event_title = request.content_details.get('event_title') or 'Ваше событие'
        description = request.content_details.get('description') or 'Добро пожаловать на наше событие!'
        
        # Log fallback data usage
        logger.info(f"🔄 FALLBACK: Using user data - Title: {event_title}, Description: {description[:50]}...")
        
        component_names = {
            'wedding': 'WeddingLanding',
            'birthday': 'BirthdayLanding', 
            'corporate': 'CorporateLanding',
            'anniversary': 'AnniversaryLanding',
            'graduation': 'GraduationLanding'
        }
        
        component_name = component_names.get(request.event_type, 'EventLanding')
        
        react_colors = {
            'wedding': {
                'hero_gradient': 'bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50',
                'mesh_overlay': 'bg-gradient-to-br from-rose-400/10 via-pink-400/15 to-purple-400/10',
                'glass_primary': 'bg-white/20 backdrop-blur-xl border border-white/30',
                'glass_secondary': 'bg-rose-50/30 backdrop-blur-lg border border-rose-200/40',
                'button_primary': 'bg-gradient-to-r from-rose-500 to-pink-600',
                'text_gradient': 'bg-gradient-to-r from-gray-800 via-rose-800 to-purple-800'
            },
            'birthday': {
                'hero_gradient': 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50',
                'mesh_overlay': 'bg-gradient-to-br from-blue-400/12 via-indigo-400/18 to-purple-400/12',
                'glass_primary': 'bg-white/25 backdrop-blur-xl border border-white/35',
                'glass_secondary': 'bg-blue-50/35 backdrop-blur-lg border border-blue-200/45',
                'button_primary': 'bg-gradient-to-r from-blue-500 to-indigo-600',
                'text_gradient': 'bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800'
            },
            'housewarming': {
                'hero_gradient': 'bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50',
                'mesh_overlay': 'bg-gradient-to-br from-emerald-400/10 via-green-400/15 to-teal-400/10',
                'glass_primary': 'bg-white/20 backdrop-blur-xl border border-white/30',
                'glass_secondary': 'bg-emerald-50/30 backdrop-blur-lg border border-emerald-200/40',
                'button_primary': 'bg-gradient-to-r from-emerald-500 to-teal-600',
                'text_gradient': 'bg-gradient-to-r from-emerald-900 via-green-800 to-teal-800'
            }
        }
        
        colors = react_colors.get(request.event_type, react_colors['birthday'])
        
        return GeneratedReactSite(
            title=event_title,
            meta_description=description[:160],
            component_name=component_name,
            hero_section={
                "title": event_title,
                "subtitle": description,
                "cta_text": "Узнать подробности",
                "background_type": "mesh_gradient",
                "animations": ["animate-pulse", "animate-bounce"]
            },
            about_section={
                "title": "О событии",
                "content": description,
                "card_style": "glass_morphism",
                "hover_effects": ["scale", "glow"]
            },
            footer_section={
                "copyright": f"© 2022 {event_title}. Создано с ❤️",
                "style": "gradient_background"
            },
            color_palette=colors,
            theme_config={
                "extend": {
                    "animation": {
                        "float": "float 6s ease-in-out infinite",
                        "glow": "glow 2s ease-in-out infinite alternate",
                        "gradient": "gradient 15s ease infinite"
                    },
                    "keyframes": {
                        "float": {
                            "0%, 100%": {"transform": "translateY(0px)"},
                            "50%": {"transform": "translateY(-20px)"}
                        },
                        "glow": {
                            "0%": {"opacity": "0.5"},
                            "100%": {"opacity": "1"}
                        }
                    }
                }
            },
            animations=["hover:scale-105", "transition-all", "group-hover:opacity-100"],
            dependencies=["react", "@types/react", "tailwindcss"],
            # Add user preferences
            event_type=request.event_type,
            color_preferences=request.color_preferences,
            style_preferences=request.style_preferences,
            theme=request.theme,
            content_details=request.content_details
        )


# Create singleton instance
site_generator = SiteGeneratorService() 