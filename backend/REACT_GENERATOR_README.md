# 🚀 React Site Generator

Новый мощный генератор сайтов, создающий красивые React лендинги с TypeScript и Tailwind CSS вместо обычного HTML.

## 🎯 Особенности

### ⚛️ Modern React Stack
- **TypeScript** для типобезопасности
- **Функциональные компоненты** с hooks
- **Controlled components** для форм
- **React.memo** для оптимизации

### 🎨 Премиум Дизайн
- **Glass Morphism** эффекты с backdrop-blur
- **Gradient текст** и фоны
- **Micro-animations** на hover
- **Responsive** дизайн для всех устройств

### 🔥 Context7 TailwindCSS Техники
- Advanced градиенты (conic, radial, mesh)
- Backdrop filters и saturate эффекты
- Современная типографика с gradient text
- Sophisticated layouts с CSS Grid

### ♿ Accessibility Ready
- WCAG 2.1 AA соответствие
- Keyboard navigation поддержка
- Screen reader friendly
- Focus states для всех интерактивных элементов

## 📡 API Endpoints

### Создание React сайта
```bash
POST /api/v1/sites/generate
```

**Запрос:**
```json
{
  "event_type": "wedding",
  "theme": "Романтическая роскошь",
  "color_preferences": "Розовые и фиолетовые тона",
  "content_details": {
    "event_title": "Свадьба Анны и Максима",
    "description": "Приглашаем вас разделить с нами самый счастливый день",
    "date": "15 июня 2024",
    "location": "Усадьба 'Золотой рассвет'"
  },
  "style_preferences": "Glass morphism с современными анимациями",
  "target_audience": "Семья и близкие друзья"
}
```

**Ответ:**
```json
{
  "id": "uuid",
  "title": "Свадьба Анны и Максима",
  "component_name": "WeddingLanding",
  "meta_description": "Приглашаем вас разделить...",
  "site_structure": {
    "hero_section": {...},
    "about_section": {...},
    "contact_section": {...},
    "color_palette": {...}
  },
  "html_content": "// React TypeScript код",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Получение React кода
```bash
GET /api/v1/sites/{site_id}/react-code
```

Возвращает чистый TypeScript React код для скачивания или копирования.

## 🎭 Поддерживаемые Типы Событий

### 💒 Свадьба (`wedding`)
- **Цвета:** Rose, Pink, Purple палитра
- **Компонент:** `WeddingLanding`
- **Стиль:** Романтичный, нежный, элегантный
- **Анимации:** Gentle floating, soft pulses

### 🎂 День рождения (`birthday`)
- **Цвета:** Blue, Indigo, Purple палитра
- **Компонент:** `BirthdayLanding`  
- **Стиль:** Радостный, праздничный, энергичный
- **Анимации:** Bouncy, energetic, playful

### 🏢 Корпоратив (`corporate`)
- **Цвета:** Slate, Gray, Zinc палитра
- **Компонент:** `CorporateLanding`
- **Стиль:** Профессиональный, современный
- **Анимации:** Crisp, precise, corporate-smooth

### 🎓 Выпускной (`graduation`)
- **Цвета:** Emerald, Teal, Cyan палитра
- **Компонент:** `GraduationLanding`
- **Стиль:** Триумфальный, вдохновляющий
- **Анимации:** Upward movements, growth-inspired

### 🏠 Новоселье (`housewarming`)
- **Цвета:** Orange, Amber, Warm tones
- **Компонент:** `HousewarmingLanding`
- **Стиль:** Уютный, теплый, гостеприимный
- **Анимации:** Welcoming, gentle, homey

## 🛠️ Как Использовать

### 1. Запуск Тестов
```bash
cd backend
python test_react_generator.py
```

### 2. API Запрос
```python
import requests

response = requests.post('http://localhost:8000/api/v1/sites/generate', 
    headers={'Authorization': 'Bearer your_token'},
    json={
        'event_type': 'wedding',
        'theme': 'Современная роскошь',
        'content_details': {
            'event_title': 'Наша Свадьба',
            'description': 'Особенный день для особенных людей'
        }
    }
)

site = response.json()
print(f"Создан компонент: {site['site_structure']['component_name']}")
```

### 3. Получение React Кода
```python
site_id = "your-site-uuid"
response = requests.get(f'http://localhost:8000/api/v1/sites/{site_id}/react-code',
    headers={'Authorization': 'Bearer your_token'}
)

# Сохраняем код в файл
with open('MyComponent.tsx', 'w') as f:
    f.write(response.text)
```

## 📋 Структура Генерируемого Кода

### TypeScript Interfaces
```typescript
interface Props {}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}
```

### Основные Компоненты
- **Section** - Обертка для секций с анимациями
- **GlassButton** - Кнопка с glass morphism эффектом
- **Главный компонент** - Полноценный лендинг

### State Management
```typescript
const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
});

const [isSubmitting, setIsSubmitting] = useState(false);
```

### Event Handlers
```typescript
const handleSubmit = useCallback(async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);
  // API call logic
}, []);

const handleInputChange = useCallback((e: React.ChangeEvent<...>) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
}, []);
```

## 🎨 Дизайн Системы

### Glass Morphism
```css
backdrop-blur-xl backdrop-saturate-150 
bg-white/25 border border-white/35
shadow-2xl hover:shadow-violet-500/25
```

### Gradient Text
```css
bg-clip-text text-transparent 
bg-gradient-to-r from-slate-800 via-violet-800 to-indigo-800
```

### Hover Animations
```css
hover:scale-105 hover:rotate-1 
transition-all duration-300 ease-out
group-hover:opacity-100
```

### Responsive Layout
```css
grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
px-4 sm:px-6 lg:px-8
text-6xl md:text-8xl font-black
```

## 🚀 Production Ready

### Оптимизация
- **React.memo** для предотвращения ненужных рендеров
- **useCallback** для стабильных ссылок на функции  
- **Lazy loading** для изображений
- **Tree shaking** готовые imports

### Performance
- Минимальные dependencies
- Оптимизированные Tailwind классы
- Эффективная структура компонентов
- Modern React patterns

### SEO Friendly
- Semantic HTML структура
- Meta tags поддержка
- Accessibility attributes
- Open Graph готовность

## 🔧 Кастомизация

### Цветовые Палитры
Каждый тип события имеет свою палитру:
```json
{
  "hero_gradient": "bg-gradient-to-br from-rose-50 via-pink-50 to-purple-50",
  "glass_primary": "bg-white/20 backdrop-blur-xl border border-white/30",
  "button_primary": "bg-gradient-to-r from-rose-500 to-pink-600"
}
```

### Анимации
Настраиваемые анимации для каждого типа:
```json
{
  "animations": [
    "hover:scale-105",
    "transition-all",
    "group-hover:opacity-100",
    "animate-pulse",
    "animate-bounce"
  ]
}
```

### Theme Config
Расширение Tailwind конфигурации:
```json
{
  "extend": {
    "animation": {
      "float": "float 6s ease-in-out infinite",
      "glow": "glow 2s ease-in-out infinite alternate"
    }
  }
}
```

## 🎉 Результат

Генератор создает:
- ✅ **Production-ready** React компонент
- ✅ **TypeScript** типизацию
- ✅ **Modern hooks** использование
- ✅ **Responsive** дизайн
- ✅ **Accessibility** поддержку
- ✅ **Glass morphism** эффекты
- ✅ **Smooth animations**
- ✅ **Form validation**
- ✅ **Loading states**
- ✅ **Error handling**

Код готов для:
- 📱 Мобильных устройств
- 🖥️ Десктопов
- ⌚ Планшетов
- ♿ Screen readers
- 🔍 SEO индексации
- 🚀 Production deploy

---

**Созданно с ❤️ для современной веб-разработки** 