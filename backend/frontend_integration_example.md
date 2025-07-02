# 🎨 Frontend Integration Example

Пример интеграции React генератора с фронтендом.

## 📱 React Hook для API

```typescript
// hooks/useReactGenerator.ts
import { useState } from 'react';
import { api } from '../lib/api';

interface SiteGenerationRequest {
  event_type: string;
  theme: string;
  color_preferences?: string;
  content_details: Record<string, any>;
  style_preferences?: string;
  target_audience?: string;
}

interface GeneratedSite {
  id: string;
  title: string;
  component_name: string;
  meta_description: string;
  site_structure: any;
  html_content: string; // React TypeScript код
  created_at: string;
}

export const useReactGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSite = async (request: SiteGenerationRequest) => {
    setIsGenerating(true);
    setError(null);
    
    try {
      const response = await api.post('/sites/generate', request);
      setGeneratedSite(response.data);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Ошибка генерации');
      throw err;
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadReactCode = async (siteId: string, filename?: string) => {
    try {
      const response = await api.get(`/sites/${siteId}/react-code`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || `component_${siteId}.tsx`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Ошибка скачивания:', err);
    }
  };

  return {
    isGenerating,
    generatedSite,
    error,
    generateSite,
    downloadReactCode
  };
};
```

## 🎯 Компонент Генератора

```typescript
// components/ReactSiteBuilder.tsx
import React, { useState } from 'react';
import { useReactGenerator } from '../hooks/useReactGenerator';

const eventTypes = [
  { value: 'wedding', label: '💒 Свадьба', color: 'from-rose-500 to-pink-600' },
  { value: 'birthday', label: '🎂 День рождения', color: 'from-blue-500 to-indigo-600' },
  { value: 'corporate', label: '🏢 Корпоратив', color: 'from-slate-600 to-gray-700' },
  { value: 'graduation', label: '🎓 Выпускной', color: 'from-emerald-500 to-teal-600' },
  { value: 'anniversary', label: '💎 Годовщина', color: 'from-purple-500 to-violet-600' }
];

export const ReactSiteBuilder: React.FC = () => {
  const { isGenerating, generatedSite, error, generateSite, downloadReactCode } = useReactGenerator();
  
  const [formData, setFormData] = useState({
    event_type: 'wedding',
    theme: '',
    color_preferences: '',
    content_details: {
      event_title: '',
      description: '',
      date: '',
      location: ''
    },
    style_preferences: 'Glass morphism с современными анимациями',
    target_audience: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await generateSite(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleContentChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      content_details: { ...prev.content_details, [field]: value }
    }));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-purple-600 mb-4">
          🚀 React Site Generator
        </h1>
        <p className="text-gray-600">Создайте красивый React лендинг за минуты</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Тип события */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Тип события
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('event_type', type.value)}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.event_type === type.value
                    ? `bg-gradient-to-r ${type.color} text-white border-transparent shadow-lg scale-105`
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Основная информация */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Основная информация</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Название события"
              value={formData.content_details.event_title}
              onChange={(e) => handleContentChange('event_title', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Дата события"
              value={formData.content_details.date}
              onChange={(e) => handleContentChange('date', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <input
            type="text"
            placeholder="Место проведения"
            value={formData.content_details.location}
            onChange={(e) => handleContentChange('location', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />

          <textarea
            placeholder="Описание события"
            value={formData.content_details.description}
            onChange={(e) => handleContentChange('description', e.target.value)}
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            required
          />
        </div>

        {/* Дизайн */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">Дизайн и стиль</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Тема (например: Романтическая роскошь)"
              value={formData.theme}
              onChange={(e) => handleInputChange('theme', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              placeholder="Цветовые предпочтения"
              value={formData.color_preferences}
              onChange={(e) => handleInputChange('color_preferences', e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>

          <input
            type="text"
            placeholder="Целевая аудитория"
            value={formData.target_audience}
            onChange={(e) => handleInputChange('target_audience', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          />
        </div>

        {/* Кнопка генерации */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white py-4 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
              Генерируем React компонент...
            </div>
          ) : (
            '🚀 Создать React лендинг'
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
            {error}
          </div>
        )}
      </form>

      {/* Результат */}
      {generatedSite && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-green-800">
              ✅ React компонент создан!
            </h3>
            <button
              onClick={() => downloadReactCode(generatedSite.id, `${generatedSite.component_name}.tsx`)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              📥 Скачать .tsx
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <strong>Компонент:</strong> {generatedSite.component_name}
            </div>
            <div>
              <strong>Создан:</strong> {new Date(generatedSite.created_at).toLocaleString()}
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <h4 className="font-medium text-gray-800 mb-2">Превью кода:</h4>
            <pre className="text-xs text-gray-600 overflow-x-auto">
              {generatedSite.html_content.split('\n').slice(0, 10).join('\n')}
              {'\n...'}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
```

## 🔧 API Client

```typescript
// lib/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Добавляем токен авторизации
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Обработка ошибок
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## 🎨 Code Preview Component

```typescript
// components/CodePreview.tsx
import React, { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodePreviewProps {
  code: string;
  filename: string;
}

export const CodePreview: React.FC<CodePreviewProps> = ({ code, filename }) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between bg-gray-800 px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          </div>
          <span className="text-gray-300 text-sm font-mono">{filename}</span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded-md text-sm transition-colors"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
              </svg>
              <span>Скопировано!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"></path>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"></path>
              </svg>
              <span>Копировать</span>
            </>
          )}
        </button>
      </div>
      
      <SyntaxHighlighter
        language="typescript"
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          padding: '1rem',
          fontSize: '0.875rem',
          lineHeight: '1.5'
        }}
        showLineNumbers
        wrapLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};
```

## 🚀 Использование

```typescript
// App.tsx
import React from 'react';
import { ReactSiteBuilder } from './components/ReactSiteBuilder';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-purple-50 to-indigo-50">
      <ReactSiteBuilder />
    </div>
  );
}

export default App;
```

## 📱 Responsive Features

Компонент полностью адаптивен:
- ✅ Мобильные устройства (320px+)
- ✅ Планшеты (768px+) 
- ✅ Десктопы (1024px+)
- ✅ Touch-friendly интерфейс
- ✅ Keyboard navigation

## 🎉 Результат

После генерации пользователь получает:
1. **Готовый React компонент** с TypeScript
2. **Красивый glass morphism** дизайн
3. **Responsive** верстку
4. **Accessibility** поддержку
5. **Возможность скачать** .tsx файл
6. **Превью кода** с подсветкой синтаксиса

---

**Готово к production deployment! 🚀** 