import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import type { EventType, ThemeStyle, ColorScheme } from '@/lib/types';

import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, ArrowRight, Palette, Calendar, Users, Heart, Star, Gift, 
  Home, Briefcase, GraduationCap, Baby, Eye, Sparkles, Zap, Monitor, 
  Smartphone, Clock, Music, Share, QrCode, User
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Схема валидации для MVP
const mvpFormSchema = z.object({
  event_type: z.string().min(1, 'Выберите тип события'),
  template_id: z.string().min(1, 'Выберите шаблон'),
  color_scheme: z.string().optional(),
  font_pair: z.string().optional(),
  decorative_elements: z.array(z.string()).optional(),
  event_title: z.string().min(1, 'Введите название события'),
  event_date: z.string().min(1, 'Укажите дату'),
  event_time: z.string().min(1, 'Укажите время'),
  venue_name: z.string().min(1, 'Укажите место'),
  venue_address: z.string().optional(),
  description: z.string().min(10, 'Добавьте описание (минимум 10 символов)'),
  contact_name: z.string().min(1, 'Укажите контактное лицо'),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Введите корректный email'),
  // Уникальные поля для разных типов событий
  special_features: z.record(z.any()).optional(),
});

type FormData = z.infer<typeof mvpFormSchema>;

// Типы событий с уникальными особенностями
const eventTypes = [
  { 
    value: 'birthday', 
    label: 'День рождения', 
    icon: <Gift className="w-8 h-8" />, 
    color: 'from-pink-500 to-purple-600',
    feature: 'Таймер-обратный отсчёт + стена пожеланий',
    description: 'Создайте волшебную атмосферу празднования'
  },
  { 
    value: 'wedding', 
    label: 'Свадьба', 
    icon: <Heart className="w-8 h-8" />, 
    color: 'from-rose-400 to-pink-500',
    feature: 'Выбор меню и рассадка гостей',
    description: 'Организуйте идеальный день для влюблённых'
  },
  { 
    value: 'corporate', 
    label: 'Корпоратив', 
    icon: <Briefcase className="w-8 h-8" />, 
    color: 'from-blue-500 to-indigo-600',
    feature: 'Расписание докладов и экспорт в календарь',
    description: 'Профессиональное мероприятие с программой'
  },
  { 
    value: 'housewarming', 
    label: 'Новоселье', 
    icon: <Home className="w-8 h-8" />, 
    color: 'from-green-500 to-emerald-600',
    feature: 'Интерактивная схема квартиры',
    description: 'Покажите гостям новое пространство'
  },
  { 
    value: 'baby_shower', 
    label: 'Baby Shower', 
    icon: <Baby className="w-8 h-8" />, 
    color: 'from-yellow-400 to-orange-500',
    feature: 'Список желанных подарков с бронированием',
    description: 'Подготовьтесь к встрече малыша вместе'
  },
  { 
    value: 'graduation', 
    label: 'Выпускной', 
    icon: <GraduationCap className="w-8 h-8" />, 
    color: 'from-purple-500 to-blue-600',
    feature: 'Онлайн-альбом "Лучшие моменты"',
    description: 'Запечатлейте важный этап в жизни'
  },
];

// Готовые шаблоны для каждого типа события
const templates = {
  birthday: [
    { id: 'birthday-balloons', name: 'Воздушные шары', preview: 'bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-400', hero: '🎈' },
    { id: 'birthday-confetti', name: 'Конфетти', preview: 'bg-gradient-to-r from-yellow-300 via-orange-300 to-red-400', hero: '🎉' },
    { id: 'birthday-cake', name: 'Праздничный торт', preview: 'bg-gradient-to-r from-blue-300 via-green-300 to-teal-400', hero: '🎂' },
    { id: 'birthday-party', name: 'Вечеринка', preview: 'bg-gradient-to-r from-purple-400 via-pink-400 to-red-400', hero: '🥳' },
    { id: 'birthday-elegant', name: 'Элегантный', preview: 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-400', hero: '✨' },
  ],
  wedding: [
    { id: 'wedding-classic', name: 'Классический', preview: 'bg-gradient-to-r from-rose-200 via-pink-100 to-white', hero: '💐' },
    { id: 'wedding-romantic', name: 'Романтичный', preview: 'bg-gradient-to-r from-pink-300 via-rose-200 to-red-200', hero: '💕' },
    { id: 'wedding-garden', name: 'Садовый', preview: 'bg-gradient-to-r from-green-200 via-emerald-200 to-teal-200', hero: '🌿' },
    { id: 'wedding-modern', name: 'Современный', preview: 'bg-gradient-to-r from-slate-300 via-gray-300 to-zinc-300', hero: '💎' },
    { id: 'wedding-rustic', name: 'Рустик', preview: 'bg-gradient-to-r from-amber-200 via-orange-200 to-yellow-200', hero: '🌾' },
  ],
  corporate: [
    { id: 'corp-professional', name: 'Профессиональный', preview: 'bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500', hero: '🏢' },
    { id: 'corp-modern', name: 'Современный', preview: 'bg-gradient-to-r from-gray-600 via-slate-600 to-zinc-600', hero: '💼' },
    { id: 'corp-creative', name: 'Креативный', preview: 'bg-gradient-to-r from-orange-400 via-red-400 to-pink-400', hero: '🎨' },
    { id: 'corp-tech', name: 'IT', preview: 'bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400', hero: '💻' },
    { id: 'corp-elegant', name: 'Элегантный', preview: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500', hero: '⭐' },
  ],
  housewarming: [
    { id: 'house-cozy', name: 'Уютный', preview: 'bg-gradient-to-r from-orange-300 via-amber-300 to-yellow-300', hero: '🏠' },
    { id: 'house-modern', name: 'Современный', preview: 'bg-gradient-to-r from-gray-400 via-slate-400 to-zinc-400', hero: '🏡' },
    { id: 'house-garden', name: 'С садом', preview: 'bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400', hero: '🌻' },
    { id: 'house-family', name: 'Семейный', preview: 'bg-gradient-to-r from-blue-300 via-indigo-300 to-purple-300', hero: '👨‍👩‍👧‍👦' },
    { id: 'house-minimalist', name: 'Минималистичный', preview: 'bg-gradient-to-r from-stone-300 via-neutral-300 to-gray-300', hero: '🔲' },
  ],
  baby_shower: [
    { id: 'baby-cute', name: 'Милый', preview: 'bg-gradient-to-r from-pink-200 via-blue-200 to-yellow-200', hero: '👶' },
    { id: 'baby-pastel', name: 'Пастельный', preview: 'bg-gradient-to-r from-purple-200 via-pink-200 to-rose-200', hero: '🍼' },
    { id: 'baby-toys', name: 'Игрушки', preview: 'bg-gradient-to-r from-yellow-300 via-green-300 to-blue-300', hero: '🧸' },
    { id: 'baby-stars', name: 'Звёздочки', preview: 'bg-gradient-to-r from-indigo-200 via-purple-200 to-pink-200', hero: '⭐' },
    { id: 'baby-nature', name: 'Природный', preview: 'bg-gradient-to-r from-green-200 via-teal-200 to-cyan-200', hero: '🌱' },
  ],
  graduation: [
    { id: 'grad-classic', name: 'Классический', preview: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600', hero: '🎓' },
    { id: 'grad-gold', name: 'Золотой', preview: 'bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400', hero: '🏆' },
    { id: 'grad-modern', name: 'Современный', preview: 'bg-gradient-to-r from-slate-500 via-gray-500 to-zinc-500', hero: '📚' },
    { id: 'grad-celebration', name: 'Праздничный', preview: 'bg-gradient-to-r from-red-400 via-pink-400 to-purple-400', hero: '🎉' },
    { id: 'grad-success', name: 'Успех', preview: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500', hero: '🌟' },
  ],
};

// Цветовые схемы
const colorSchemes = [
  { id: 'warm', name: 'Тёплая', colors: ['#FF6B6B', '#FFE66D', '#FF8E53'] },
  { id: 'cool', name: 'Прохладная', colors: ['#4ECDC4', '#45B7D1', '#96CEB4'] },
  { id: 'elegant', name: 'Элегантная', colors: ['#2C3E50', '#34495E', '#7F8C8D'] },
  { id: 'vibrant', name: 'Яркая', colors: ['#E74C3C', '#F39C12', '#9B59B6'] },
  { id: 'pastel', name: 'Пастельная', colors: ['#FFB6C1', '#E6E6FA', '#F0F8FF'] },
];

// Пары шрифтов
const fontPairs = [
  { id: 'modern', name: 'Современный', heading: 'Inter', body: 'Inter' },
  { id: 'elegant', name: 'Элегантный', heading: 'Playfair Display', body: 'Source Sans Pro' },
  { id: 'playful', name: 'Игривый', heading: 'Comfortaa', body: 'Open Sans' },
  { id: 'classic', name: 'Классический', heading: 'Lora', body: 'Source Sans Pro' },
];

// Декоративные элементы
const decorativeElements = [
  { id: 'hearts', emoji: '💖', name: 'Сердечки' },
  { id: 'stars', emoji: '✨', name: 'Звёзды' },
  { id: 'flowers', emoji: '🌸', name: 'Цветы' },
  { id: 'balloons', emoji: '🎈', name: 'Шарики' },
  { id: 'confetti', emoji: '🎊', name: 'Конфетти' },
  { id: 'music', emoji: '🎵', name: 'Музыка' },
];

const steps = [
  { id: 'event', title: 'Тип события', description: 'Выберите что празднуем', icon: Calendar },
  { id: 'design', title: 'Оформление', description: 'Подберите стиль', icon: Palette },
  { id: 'details', title: 'Детали', description: 'Заполните информацию', icon: Users },
];

const BuilderMVP = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [previewMode, setPreviewMode] = useState<'mobile' | 'desktop'>('mobile');

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(mvpFormSchema),
    defaultValues: {
      event_type: '',
      template_id: '',
      color_scheme: 'warm',
      font_pair: 'modern',
      decorative_elements: [],
      event_title: '',
      event_date: '',
      event_time: '',
      venue_name: '',
      description: '',
      contact_name: '',
      contact_email: '',
      special_features: {},
    }
  });

  const watchedValues = watch();
  const selectedEventType = watchedValues.event_type;
  const selectedTemplate = watchedValues.template_id;

  const onSubmit = async (data: FormData) => {
    await createSite(data);
  };

  const createSite = async (data: FormData) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Имитация процесса создания с прогрессом
      const steps = [
        { progress: 20, message: 'Выбираем шаблон...' },
        { progress: 40, message: 'Настраиваем цвета...' },
        { progress: 60, message: 'Добавляем декоративные элементы...' },
        { progress: 80, message: 'Настраиваем уникальные особенности...' },
        { progress: 100, message: 'Финализируем приглашение...' },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, 800));
        setGenerationProgress(step.progress);
      }

      // Маппинг шаблонов к темам бэкенда
      const templateToThemeMap: Record<string, string> = {
        'birthday-balloons': 'playful',
        'birthday-confetti': 'playful',
        'birthday-cake': 'elegant',
        'birthday-party': 'modern',
        'birthday-elegant': 'luxury',
        'wedding-classic': 'classic',
        'wedding-romantic': 'elegant',
        'wedding-garden': 'rustic',
        'wedding-modern': 'modern',
        'wedding-rustic': 'rustic',
        'corp-professional': 'elegant',
        'corp-modern': 'modern',
        'corp-creative': 'playful',
        'corp-tech': 'minimalist',
        'corp-elegant': 'luxury',
        'house-cozy': 'rustic',
        'house-modern': 'modern',
        'house-garden': 'bohemian',
        'house-family': 'casual',
        'house-minimalist': 'minimalist',
        'baby-cute': 'playful',
        'baby-pastel': 'elegant',
        'baby-toys': 'playful',
        'baby-stars': 'modern',
        'baby-nature': 'rustic',
        'grad-classic': 'classic',
        'grad-gold': 'luxury',
        'grad-modern': 'modern',
        'grad-celebration': 'playful',
        'grad-success': 'elegant',
      };

      // Маппинг цветовых схем к бэкенду
      const colorSchemeMap: Record<string, string> = {
        'warm': 'warm_autumn',
        'cool': 'cool_winter',
        'elegant': 'elegant_neutrals',
        'vibrant': 'vibrant_celebration',
        'pastel': 'romantic_pastels',
      };

      const siteRequest = {
        event_type: data.event_type,
        theme: templateToThemeMap[data.template_id] || 'modern',
        content_details: {
          event_title: data.event_title,
          event_date: data.event_date,
          event_time: data.event_time,
          venue_name: data.venue_name,
          venue_address: data.venue_address || null,
          description: data.description,
          additional_info: data.special_features ? JSON.stringify(data.special_features) : null,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone || null,
          contact_email: data.contact_email,
          template_id: data.template_id,
          decorative_elements: data.decorative_elements?.join(',') || null,
          font_pair: data.font_pair || 'modern',
        },
        color_preferences: colorSchemeMap[data.color_scheme || 'warm'] || 'elegant_neutrals',
        style_preferences: `Font: ${data.font_pair || 'modern'}, Template: ${data.template_id}`,
        target_audience: 'mixed',
      };

      const generatedSite = await apiClient.generateSiteWithStatus(
        siteRequest,
        (status) => console.log(status)
      );
      
      toast.success('🎉 Приглашение готово! Пора звать гостей!');
      setTimeout(() => navigate('/dashboard'), 1500);

    } catch (error) {
      console.error('Ошибка создания:', error);
      toast.error('Что-то пошло не так. Попробуйте ещё раз');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit(onSubmit)();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return watchedValues.event_type;
      case 1: return watchedValues.template_id;
      case 2: return watchedValues.event_title && watchedValues.event_date && 
                    watchedValues.event_time && watchedValues.venue_name && 
                    watchedValues.description && watchedValues.contact_name && 
                    watchedValues.contact_email;
      default: return true;
    }
  };

  const toggleDecorativeElement = (elementId: string) => {
    const current = watchedValues.decorative_elements || [];
    const updated = current.includes(elementId)
      ? current.filter(id => id !== elementId)
      : [...current, elementId];
    setValue('decorative_elements', updated);
  };

  const renderPreview = () => {
    const eventType = eventTypes.find(et => et.value === selectedEventType);
    const template = templates[selectedEventType as keyof typeof templates]?.find(t => t.id === selectedTemplate);
    const colorScheme = colorSchemes.find(cs => cs.id === watchedValues.color_scheme);
    const fontPair = fontPairs.find(fp => fp.id === watchedValues.font_pair);
    
    const primaryColor = colorScheme?.colors[0] || '#6366f1';
    const secondaryColor = colorScheme?.colors[1] || '#8b5cf6';
    const accentColor = colorScheme?.colors[2] || '#ec4899';
    
    return (
      <div className={`mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-700 transform ${
        previewMode === 'mobile' ? 'w-full max-w-sm' : 'w-full max-w-2xl'
      }`}>
        {/* Hero Section */}
        <div 
          className="relative p-8 text-white text-center overflow-hidden"
          style={{ 
            background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor}, ${accentColor})`
          }}
        >
          {/* Animated Background Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-4 left-4 w-16 h-16 bg-white rounded-full animate-pulse"></div>
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full animate-bounce"></div>
            <div className="absolute top-1/2 left-1/2 w-20 h-20 bg-white rounded-full opacity-10 animate-ping"></div>
          </div>
          
          <div className="relative z-10">
            <div className="text-6xl mb-4 animate-bounce">{template?.hero || eventType?.icon || '🎉'}</div>
            <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight" style={{ fontFamily: fontPair?.heading || 'Inter' }}>
              {watchedValues.event_title || `${eventType?.label || 'Ваше событие'}`}
            </h1>
            <p className="text-lg opacity-90 leading-relaxed max-w-md mx-auto" style={{ fontFamily: fontPair?.body || 'Inter' }}>
              {watchedValues.description || 'Присоединяйтесь к нам на незабываемом празднике!'}
            </p>
            
            {/* Decorative Elements */}
            {watchedValues.decorative_elements && watchedValues.decorative_elements.length > 0 && (
              <div className="flex justify-center gap-3 mt-6">
                {watchedValues.decorative_elements.slice(0, 3).map((elementId) => {
                  const element = decorativeElements.find(el => el.id === elementId);
                  return element ? (
                    <span key={elementId} className="text-2xl animate-pulse">{element.emoji}</span>
                  ) : null;
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Event Details */}
        <div className="p-6 space-y-6">
          {/* Date & Time Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <Calendar className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">Дата</p>
              <p className="font-semibold text-gray-900">{watchedValues.event_date || 'Дата события'}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <Clock className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">Время</p>
              <p className="font-semibold text-gray-900">{watchedValues.event_time || 'Время'}</p>
            </div>
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg text-center border border-gray-200">
              <Home className="w-6 h-6 mx-auto mb-2 text-gray-600" />
              <p className="text-xs text-gray-600 uppercase tracking-wide">Место</p>
              <p className="font-semibold text-gray-900 text-sm">{watchedValues.venue_name || 'Место проведения'}</p>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Организатор
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-blue-800">
                <User className="w-4 h-4" />
                <span className="text-sm">{watchedValues.contact_name || 'Имя организатора'}</span>
              </div>
              {watchedValues.contact_phone && (
                <div className="flex items-center gap-3 text-blue-800">
                  <span className="text-sm">📞 {watchedValues.contact_phone}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-blue-800">
                <span className="text-sm">✉️ {watchedValues.contact_email || 'email@example.com'}</span>
              </div>
            </div>
          </div>

          {/* Unique Feature */}
          {selectedEventType && (
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
              <h4 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Особенность события
              </h4>
              <p className="text-sm text-yellow-800">{eventType?.feature}</p>
            </div>
          )}

          {/* RSVP Form */}
          <div 
            className="p-6 rounded-xl text-white relative overflow-hidden"
            style={{ 
              background: `linear-gradient(135deg, ${primaryColor}dd, ${secondaryColor}dd)`
            }}
          >
            <div className="relative z-10">
              <h4 className="font-bold text-xl mb-4 text-center">Подтвердите участие</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/80 focus:bg-white/30 focus:border-white/60 transition-all text-sm backdrop-blur-sm" 
                    placeholder="Ваше имя" 
                  />
                  <input 
                    className="w-full p-3 border border-white/30 rounded-lg bg-white/20 text-white placeholder-white/80 focus:bg-white/30 focus:border-white/60 transition-all text-sm backdrop-blur-sm" 
                    placeholder="Email" 
                  />
                </div>
                <div className="flex items-center gap-3 text-white/90">
                  <input type="checkbox" className="rounded border-white/30 text-white focus:ring-white/50" />
                  <span className="text-sm">Приведу +1 гостя</span>
                </div>
                <button 
                  className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border border-white/30"
                >
                  🎉 Буду участвовать!
                </button>
              </div>
            </div>
          </div>

          {/* Sharing Preview */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h5 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Share className="w-4 h-4" />
              Быстрое приглашение
            </h5>
            <div className="flex gap-3 items-center">
              <div className="flex-1 bg-white p-2 rounded border text-xs text-gray-600 overflow-hidden">
                <QrCode className="w-8 h-8 mx-auto mb-1 text-gray-400" />
                <div className="text-center">QR-код</div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 bg-green-500 text-white rounded text-xs font-medium hover:bg-green-600 transition-colors">
                  WhatsApp
                </button>
                <button className="px-3 py-2 bg-blue-500 text-white rounded text-xs font-medium hover:bg-blue-600 transition-colors">
                  Telegram
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!user) return null;

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-8">
          
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Создайте идеальное приглашение за 3 минуты
            </h1>
            <p className="text-gray-600">
              Выберите стиль → настройте оформление → добавьте детали
            </p>
          </div>

          {/* Progress */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-4">
              {steps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.id} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full transition-all
                      ${index <= currentStep 
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-400'
                      }
                    `}>
                      {index < currentStep ? '✓' : <Icon className="w-5 h-5" />}
                    </div>
                    <span className={`ml-2 text-sm font-medium ${
                      index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </span>
                    {index < steps.length - 1 && (
                      <div className={`w-12 h-0.5 mx-4 ${
                        index < currentStep ? 'bg-purple-500' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card className="shadow-xl border-0">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle className="text-center">
                  {steps[currentStep].title}
                </CardTitle>
                <p className="text-center text-gray-600">
                  {steps[currentStep].description}
                </p>
              </CardHeader>

              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {/* Шаг 1: Выбор типа события */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {eventTypes.map((type) => (
                          <motion.div
                            key={type.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setValue('event_type', type.value)}
                            className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                              selectedEventType === type.value
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-lg'
                                : 'border-gray-200 hover:border-purple-300 bg-white'
                            }`}
                          >
                            <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${type.color} flex items-center justify-center text-white`}>
                              {type.icon}
                            </div>
                            <h3 className="font-bold text-lg text-center mb-2">{type.label}</h3>
                            <p className="text-sm text-gray-600 text-center mb-2">{type.description}</p>
                            <div className="bg-yellow-50 p-2 rounded text-xs text-center">
                              <span className="font-medium">✨ {type.feature}</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 2: Оформление */}
                  {currentStep === 1 && selectedEventType && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      {/* Шаблоны */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Выберите шаблон</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {templates[selectedEventType as keyof typeof templates]?.map((template) => (
                            <motion.div
                              key={template.id}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setValue('template_id', template.id)}
                              className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                selectedTemplate === template.id
                                  ? 'border-purple-500 shadow-lg'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className={`h-24 ${template.preview} flex items-center justify-center text-4xl`}>
                                {template.hero}
                              </div>
                              <div className="p-3 bg-white">
                                <h4 className="font-medium text-center">{template.name}</h4>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Цветовые схемы */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Цветовая схема</h3>
                        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                          {colorSchemes.map((scheme) => (
                            <motion.div
                              key={scheme.id}
                              whileHover={{ scale: 1.1 }}
                              onClick={() => setValue('color_scheme', scheme.id)}
                              className={`cursor-pointer p-3 rounded-lg border-2 transition-all ${
                                watchedValues.color_scheme === scheme.id
                                  ? 'border-purple-500 shadow-lg'
                                  : 'border-gray-200'
                              }`}
                            >
                              <div className="flex gap-1 mb-2">
                                {scheme.colors.map((color, i) => (
                                  <div
                                    key={i}
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                              <span className="text-xs font-medium">{scheme.name}</span>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Шрифты */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Стиль шрифта</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          {fontPairs.map((font) => (
                            <motion.div
                              key={font.id}
                              whileHover={{ scale: 1.05 }}
                              onClick={() => setValue('font_pair', font.id)}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all ${
                                watchedValues.font_pair === font.id
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="text-center">
                                <div className="text-lg font-bold mb-1">Aa</div>
                                <div className="text-xs">{font.name}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Декоративные элементы */}
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Добавить элементы (опционально)</h3>
                        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                          {decorativeElements.map((element) => (
                            <motion.div
                              key={element.id}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => toggleDecorativeElement(element.id)}
                              className={`cursor-pointer p-4 rounded-lg border-2 transition-all text-center ${
                                watchedValues.decorative_elements?.includes(element.id)
                                  ? 'border-purple-500 bg-purple-50'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="text-2xl mb-1">{element.emoji}</div>
                              <div className="text-xs">{element.name}</div>
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 3: Детали события */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="event_title">Название события *</Label>
                            <Input
                              {...register('event_title')}
                              placeholder="Мой День Рождения 🎉"
                              className="text-lg"
                            />
                            {errors.event_title && (
                              <p className="text-sm text-red-600">{errors.event_title.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="event_date">Дата *</Label>
                              <Input {...register('event_date')} type="date" />
                              {errors.event_date && (
                                <p className="text-sm text-red-600">{errors.event_date.message}</p>
                              )}
                            </div>
                            <div>
                              <Label htmlFor="event_time">Время *</Label>
                              <Input {...register('event_time')} type="time" />
                              {errors.event_time && (
                                <p className="text-sm text-red-600">{errors.event_time.message}</p>
                              )}
                            </div>
                          </div>

                          <div>
                            <Label htmlFor="venue_name">Место проведения *</Label>
                            <Input
                              {...register('venue_name')}
                              placeholder="Кафе 'Счастье' или дома"
                            />
                            {errors.venue_name && (
                              <p className="text-sm text-red-600">{errors.venue_name.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="venue_address">Адрес (опционально)</Label>
                            <Input
                              {...register('venue_address')}
                              placeholder="ул. Праздничная, 1"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="description">Короткое сообщение гостям *</Label>
                            <Textarea
                              {...register('description')}
                              placeholder="Приглашаю отметить мой день рождения! Будет весело 🎈"
                              rows={4}
                            />
                            {errors.description && (
                              <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="contact_name">Контактное лицо *</Label>
                            <Input
                              {...register('contact_name')}
                              placeholder="Ваше имя"
                            />
                            {errors.contact_name && (
                              <p className="text-sm text-red-600">{errors.contact_name.message}</p>
                            )}
                          </div>

                          <div>
                            <Label htmlFor="contact_phone">Телефон (опционально)</Label>
                            <Input
                              {...register('contact_phone')}
                              placeholder="+7 (999) 123-45-67"
                            />
                          </div>

                          <div>
                            <Label htmlFor="contact_email">Email *</Label>
                            <Input
                              {...register('contact_email')}
                              type="email"
                              placeholder="your@email.com"
                            />
                            {errors.contact_email && (
                              <p className="text-sm text-red-600">{errors.contact_email.message}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading overlay */}
                {isGenerating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-white/95 flex items-center justify-center z-50 rounded-lg"
                  >
                    <div className="text-center space-y-6">
                      <div className="flex justify-center">
                        <LoadingSpinner 
                          size="xl" 
                          variant="gradient"
                          className="scale-110"
                        />
                      </div>
                      <motion.h3 
                        className="text-xl font-bold text-gray-800"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Создаём ваше приглашение...
                      </motion.h3>
                      <div className="w-64 bg-gray-200 rounded-full h-2 mb-2 mx-auto">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${generationProgress}%` }}
                        />
                      </div>
                      <p className="text-gray-600 text-lg font-medium">{generationProgress}%</p>
                    </div>
                  </motion.div>
                )}
              </CardContent>

              {/* Navigation */}
              <div className="border-t p-6">
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Назад
                  </Button>

                  <Badge variant="outline" className="px-4 py-2">
                    {currentStep + 1} из {steps.length}
                  </Badge>

                  <Button
                    onClick={nextStep}
                    disabled={!canProceed()}
                    className={`flex items-center gap-2 ${
                      !canProceed()
                        ? 'opacity-50 cursor-not-allowed'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600'
                    }`}
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Zap className="w-4 h-4" />
                        Создать приглашение
                      </>
                    ) : (
                      <>
                        Далее
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default BuilderMVP; 