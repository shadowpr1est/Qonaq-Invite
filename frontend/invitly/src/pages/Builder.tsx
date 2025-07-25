
import { useState, useEffect, useRef, KeyboardEvent, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  FileText, 
  Calendar, 
  Palette, 
  Check, 
  ArrowLeft, 
  ArrowRight,
  MapPin,
  Clock,
  Users,
  Phone,
  Mail,
  User,
  Plus,
  X,
  Sparkles,
  Heart,
  Star,
  Gift,
  PartyPopper,
  Cake,
  GraduationCap,
  Building2,
  Music,
  Image,
  Camera,
  Shirt,
  MessageSquare,
  List,
  Upload,
  Trash2
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import TwoGISMapPreview from '@/components/TwoGISMapPreview';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';

type EventType = string;

interface RSVPState {
  enabled: boolean;
  options: string[];
}

interface TimelineEvent {
  id: string;
  time: string;
  title: string;
  description: string;
}

interface DressCode {
  type: 'formal' | 'casual' | 'business' | 'costume' | 'smart_casual' | 'elegant';
  description: string;
}

interface GalleryImage {
  id: string;
  url: string;
  alt: string;
}

interface FormState {
  eventType: EventType;
  title: string;
  date: string;
  time: string;
  city: string;
  location: string;
  description: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  rsvp: RSVPState;
  // Дополнительные опции
  timeline: TimelineEvent[];
  dressCode: DressCode | null;
  gallery: GalleryImage[];
  backgroundMusic: string;
  wishes: string;
  backgroundImage?: string;
}



const siteStyles = [
  { name: "Modern", description: "Clean and contemporary design" },
  { name: "Minimalist", description: "Simple and elegant" },
  { name: "Elegant", description: "Sophisticated and refined" },
  { name: "Playful", description: "Fun and vibrant" },
  { name: "Rustic", description: "Natural and cozy" }
];




// Удаляю colorThemeOptions и все небрендовые цвета

const generateHTML = (siteData: any) => {
  const selectedTheme = siteData.color_preferences;
  const selectedStyle = siteData.theme || 'modern';
  let bodyClass = 'min-h-screen';
  let bodyStyle = '';

  if (selectedTheme && selectedTheme.startsWith('bg-gradient')) {
    // Tailwind класс
    bodyClass += ' ' + selectedTheme;
  } else if (selectedTheme && selectedTheme.startsWith('linear-gradient')) {
    // Inline-стиль
    bodyStyle = `background: ${selectedTheme};`;
  } else {
    // fallback
    bodyClass += ' bg-gradient-to-br from-slate-50 to-white';
  }

  // Применяем стили в зависимости от выбранного стиля
  let containerClass = 'max-w-4xl mx-auto text-center';
  let cardClass = 'bg-white/80 backdrop-blur-sm rounded-3xl p-6 md:p-12 elegant-shadow max-w-2xl mx-auto mb-8 fade-in';
  let titleClass = 'text-4xl md:text-6xl lg:text-7xl font-bold gradient-bg bg-clip-text text-transparent mb-6 text-shadow leading-tight';
  let descriptionClass = 'text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed';
  let buttonClass = 'w-full p-2 md:p-3 gradient-bg text-white font-semibold rounded-lg transition-all duration-200 text-base';

  switch (selectedStyle) {
    case 'modern':
      containerClass = 'max-w-5xl mx-auto text-center';
      cardClass = 'bg-white/90 backdrop-blur-md rounded-2xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto mb-8 fade-in';
      titleClass = 'text-5xl md:text-7xl lg:text-8xl font-extrabold gradient-bg bg-clip-text text-transparent mb-8 text-shadow leading-tight';
      descriptionClass = 'text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-light';
      buttonClass = 'w-full p-4 md:p-5 gradient-bg text-white font-bold rounded-xl transition-all duration-300 text-lg hover:scale-105';
      break;
    case 'classic':
      containerClass = 'max-w-4xl mx-auto text-center';
      cardClass = 'bg-white/95 backdrop-blur-sm rounded-none border-2 border-gray-200 p-8 md:p-12 shadow-lg max-w-2xl mx-auto mb-8 fade-in';
      titleClass = 'text-4xl md:text-6xl lg:text-7xl font-serif font-bold gradient-bg bg-clip-text text-transparent mb-6 text-shadow leading-tight';
      descriptionClass = 'text-lg md:text-xl text-gray-800 max-w-2xl mx-auto leading-relaxed font-serif';
      buttonClass = 'w-full p-3 md:p-4 gradient-bg text-white font-serif font-semibold rounded-none border-2 border-white transition-all duration-200 text-base';
      break;
    case 'minimalist':
      containerClass = 'max-w-3xl mx-auto text-center';
      cardClass = 'bg-white/70 backdrop-blur-sm rounded-lg p-6 md:p-8 shadow-sm max-w-xl mx-auto mb-6 fade-in';
      titleClass = 'text-3xl md:text-5xl lg:text-6xl font-light gradient-bg bg-clip-text text-transparent mb-4 leading-tight';
      descriptionClass = 'text-base md:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed font-light';
      buttonClass = 'w-full p-3 gradient-bg text-white font-light rounded-md transition-all duration-200 text-sm';
      break;
    case 'elegant':
      containerClass = 'max-w-4xl mx-auto text-center';
      cardClass = 'bg-white/85 backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-xl max-w-2xl mx-auto mb-8 fade-in border border-gray-100';
      titleClass = 'text-4xl md:text-6xl lg:text-7xl font-bold gradient-bg bg-clip-text text-transparent mb-6 text-shadow leading-tight';
      descriptionClass = 'text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed font-medium';
      buttonClass = 'w-full p-4 gradient-bg text-white font-semibold rounded-2xl transition-all duration-300 text-base hover:shadow-lg';
      break;
    case 'playful':
      containerClass = 'max-w-5xl mx-auto text-center';
      cardClass = 'bg-white/80 backdrop-blur-sm rounded-2xl p-8 md:p-12 shadow-2xl max-w-3xl mx-auto mb-8 fade-in';
      titleClass = 'text-4xl md:text-6xl lg:text-7xl font-bold gradient-bg bg-clip-text text-transparent mb-6 text-shadow leading-tight';
      descriptionClass = 'text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed';
      buttonClass = 'w-full p-4 gradient-bg text-white font-bold rounded-2xl transition-all duration-300 text-lg hover:scale-110 hover:rotate-2';
      break;
    case 'rustic':
      containerClass = 'max-w-4xl mx-auto text-center';
      cardClass = 'bg-white/90 backdrop-blur-sm rounded-lg p-6 md:p-10 shadow-lg max-w-2xl mx-auto mb-8 fade-in border-2 border-amber-200';
      titleClass = 'text-4xl md:text-6xl lg:text-7xl font-bold gradient-bg bg-clip-text text-transparent mb-6 text-shadow leading-tight';
      descriptionClass = 'text-lg md:text-xl text-gray-700 max-w-2xl mx-auto leading-relaxed';
      buttonClass = 'w-full p-4 gradient-bg text-white font-bold rounded-lg transition-all duration-200 text-base border-2 border-white';
      break;
    default:
      // modern по умолчанию
      break;
  }
  
  return `<!DOCTYPE html>
<html lang="en" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${siteData.content_details.event_title}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .elegant-shadow { box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1); }
        .text-shadow { text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .fade-in { animation: fadeIn 0.8s ease-out; }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .gradient-bg { background: ${selectedTheme}; }
        ${selectedStyle === 'classic' ? `
        .font-serif { font-family: 'Georgia', serif; }
        ` : ''}
        ${selectedStyle === 'minimalist' ? `
        .font-light { font-weight: 300; }
        ` : ''}
    </style>
</head>
<body class="${bodyClass}" style="${bodyStyle}">
    <section class="min-h-screen flex items-center justify-center px-4 py-12">
        <div class="${containerClass}">
            <div class="mb-8 fade-in">
                <h1 class="${titleClass}">
                    ${siteData.content_details.event_title}
                </h1>
                <p class="${descriptionClass}">
                    ${siteData.content_details.description || 'You are cordially invited to celebrate with us'}
                </p>
            </div>
            <div class="${cardClass}">
                <div class="grid md:grid-cols-2 gap-6 text-left">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">When</h3>
                            <p class="text-gray-600">
                              ${siteData.content_details.event_date ? new Date(siteData.content_details.event_date).toLocaleDateString('ru-RU') : ''}
                              ${siteData.content_details.event_time ? `<span class='ml-2 px-2 py-1 rounded bg-indigo-50 text-indigo-700 text-sm font-semibold'>${siteData.content_details.event_time.slice(0,5)}</span>` : ''}
                            </p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h3 class="font-semibold text-gray-900 mb-1">Where</h3>
                            <p class="text-gray-600">${siteData.content_details.city ? siteData.content_details.city + ', ' : ''}${siteData.content_details.venue_name}</p>
                        </div>
                    </div>
                </div>
            </div>
            ${siteData.content_details.rsvp_enabled ? `
            <div class="${cardClass}">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Will you join us?</h3>
                <div class="grid gap-4">
                    ${siteData.content_details.rsvp_options.map((option: string) => `
                    <button class="${buttonClass}">
                        ${option}
                    </button>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            ${siteData.content_details.contact_name || siteData.content_details.contact_phone || siteData.content_details.contact_email ? `
            <div class="${cardClass}">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Questions?</h3>
                <div class="space-y-2 text-gray-600">
                    ${siteData.content_details.contact_name ? `<p class="font-medium">${siteData.content_details.contact_name}</p>` : ''}
                    ${siteData.content_details.contact_phone ? `<p><a href="tel:${siteData.content_details.contact_phone}" class="hover:text-indigo-600 transition-colors">${siteData.content_details.contact_phone}</a></p>` : ''}
                    ${siteData.content_details.contact_email ? `<p><a href="mailto:${siteData.content_details.contact_email}" class="hover:text-indigo-600 transition-colors">${siteData.content_details.contact_email}</a></p>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${siteData.content_details.city && siteData.content_details.venue_name ? `
            <div class="${cardClass}">
                <h3 class="text-xl font-bold text-gray-900 mb-4">Location</h3>
                <div class="space-y-4">
                    <div class="flex items-center space-x-4">
                        <div class="w-12 h-12 gradient-bg rounded-full flex items-center justify-center">
                            <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-900">${siteData.content_details.venue_name}</h4>
                            <p class="text-gray-600">${siteData.content_details.city}</p>
                        </div>
                    </div>
                    <div class="w-full h-64 rounded-lg overflow-hidden border border-gray-200">
                        <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-100 to-purple-100">
                            <div class="text-center p-6">
                                <div class="text-4xl mb-4">📍</div>
                                <p class="text-lg font-semibold text-gray-800">${siteData.content_details.venue_name}</p>
                                <p class="text-gray-600">${siteData.content_details.city}</p>
                                <p class="text-sm text-gray-500 mt-2">Карта будет загружена при создании сайта</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            ` : ''}
            
            ${siteData.content_details.timeline && siteData.content_details.timeline.length > 0 ? `
            <div class="${cardClass}">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Программа мероприятия</h3>
                <div class="space-y-4">
                    ${siteData.content_details.timeline.map((event: any) => `
                    <div class="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                        <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center flex-shrink-0">
                            <span class="text-white font-bold text-sm">${event.time}</span>
                        </div>
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-900 mb-1">${event.title}</h4>
                            <p class="text-gray-600">${event.description}</p>
                        </div>
                    </div>
                    `).join('')}
                </div>
            </div>
            ` : ''}
            
            ${siteData.content_details.dress_code ? `
            <div class="${cardClass}">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Дресс-код</h3>
                <div class="p-4 bg-indigo-50 rounded-lg">
                    <h4 class="font-semibold text-indigo-900 mb-2">${siteData.content_details.dress_code.type === 'formal' ? 'Формальный' : 
                        siteData.content_details.dress_code.type === 'casual' ? 'Кэжуал' :
                        siteData.content_details.dress_code.type === 'business' ? 'Деловой' :
                        siteData.content_details.dress_code.type === 'costume' ? 'Костюм' :
                        siteData.content_details.dress_code.type === 'smart_casual' ? 'Смарт-кэжуал' :
                        siteData.content_details.dress_code.type === 'elegant' ? 'Элегантный' : 'Специальный'}</h4>
                    <p class="text-indigo-700">${siteData.content_details.dress_code.description}</p>
                </div>
            </div>
            ` : ''}
            
            ${siteData.content_details.wishes ? `
            <div class="${cardClass}">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Пожелания гостям</h3>
                <div class="p-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border-l-4 border-yellow-400">
                    <p class="text-gray-800 text-lg leading-relaxed">${siteData.content_details.wishes}</p>
                </div>
            </div>
            ` : ''}
            
            ${siteData.content_details.background_music ? `
            <div class="${cardClass}">
                <h3 class="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Музыкальное сопровождение</h3>
                <div class="p-4 bg-purple-50 rounded-lg">
                    <p class="text-purple-700 font-medium">${siteData.content_details.background_music === 'romantic' ? 'Романтичная музыка' :
                        siteData.content_details.background_music === 'party' ? 'Веселая музыка для вечеринки' :
                        siteData.content_details.background_music === 'elegant' ? 'Элегантная музыка' :
                        siteData.content_details.background_music === 'fun' ? 'Көңілді музыка' : 'Специальная подборка'}</p>
                </div>
            </div>
            ` : ''}
        </div>
    </section>
</body>
</html>`;
};

const MIN_RSVP_OPTIONS = 2;
const DEFAULT_RSVP_OPTIONS = ["Да, приду", "Нет, не приду"];





const LOCAL_STORAGE_KEY = "invitly-builder-draft";

const validateForm = (form: FormState, t: any) => {
  const errors: Record<string, string> = {};
  if (!form.title?.trim()) errors.title = t('builder.validation.title_required');
  if (!form.date?.trim()) errors.date = t('builder.validation.date_required');
  if (!form.city?.trim()) errors.city = t('builder.validation.city_required');
  if (!form.location?.trim()) errors.location = t('builder.validation.location_required');
  if (form.rsvp.enabled) {
    form.rsvp.options.forEach((opt, idx) => {
      if (!opt?.trim()) errors[`rsvp_${idx}`] = t('builder.validation.rsvp_option_required');
    });
  }
  return errors;
};

const Builder = () => {
  const { t } = useTranslation();
  
  const eventTypesList = useMemo(() => [
    { 
      label: t('builder.event_types.birthday'), 
      icon: Cake, 
      backendValue: "birthday", 
      color: "from-pink-500 to-rose-500",
      description: t('builder.event_types.birthday_description')
    },
    { 
      label: t('builder.event_types.wedding'), 
      icon: Heart, 
      backendValue: "wedding", 
      color: "from-purple-500 to-pink-500",
      description: t('builder.event_types.wedding_description')
    },
    { 
      label: t('builder.event_types.corporate'), 
      icon: Building2, 
      backendValue: "corporate", 
      color: "from-indigo-500 to-blue-500",
      description: t('builder.event_types.corporate_description')
    },
    { 
      label: t('builder.event_types.baby_shower'), 
      icon: Gift, 
      backendValue: "baby_shower", 
      color: "from-green-500 to-emerald-500",
      description: t('builder.event_types.baby_shower_description')
    },
    { 
      label: t('builder.event_types.graduation'), 
      icon: GraduationCap, 
      backendValue: "graduation", 
      color: "from-indigo-500 to-blue-500",
      description: t('builder.event_types.graduation_description')
    },
    { 
      label: t('builder.event_types.anniversary'), 
      icon: Star, 
      backendValue: "anniversary", 
      color: "from-orange-500 to-red-500",
      description: t('builder.event_types.anniversary_description')
    },
  ], [t]);
  
  const initialForm = useMemo(() => ({
    eventType: "",
    title: "",
    date: "",
    time: "",
    city: "",
    location: "",
    description: "",
    contactName: "",
    contactPhone: "",
    contactEmail: "",
    rsvp: { enabled: false, options: [t('builder.form.rsvp_options.yes'), t('builder.form.rsvp_options.no')] },
    // Дополнительные опции
    timeline: [],
    dressCode: null,
    gallery: [],
    backgroundMusic: "",
    wishes: ""
  }), [t]);
  
  const colorSchemes = useMemo(() => [
    {
      key: 'romantic_pastels',
      label: t('builder.color_schemes.romantic_pastels'),
      gradient: 'bg-gradient-to-r from-pink-200 via-pink-100 to-rose-200'
    },
    {
      key: 'vibrant_celebration',
      label: t('builder.color_schemes.vibrant_celebration'),
      gradient: 'bg-gradient-to-r from-yellow-400 via-pink-500 to-red-500'
    },
    {
      key: 'elegant_neutrals',
      label: t('builder.color_schemes.elegant_neutrals'),
      gradient: 'bg-gradient-to-r from-gray-200 via-gray-400 to-gray-600'
    },
    {
      key: 'bold_modern',
      label: t('builder.color_schemes.bold_modern'),
      gradient: 'bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-700'
    },
    {
      key: 'nature_inspired',
      label: t('builder.color_schemes.nature_inspired'),
      gradient: 'bg-gradient-to-r from-green-400 via-green-200 to-emerald-500'
    },
    {
      key: 'classic_black_white',
      label: t('builder.color_schemes.classic_black_white'),
      gradient: 'bg-gradient-to-r from-black via-gray-700 to-white'
    },
    {
      key: 'warm_autumn',
      label: t('builder.color_schemes.warm_autumn'),
      gradient: 'bg-gradient-to-r from-orange-400 via-yellow-600 to-red-400'
    },
    {
      key: 'cool_winter',
      label: t('builder.color_schemes.cool_winter'),
      gradient: 'bg-gradient-to-r from-blue-400 via-blue-200 to-cyan-400'
    },
  ], [t]);
  
  const styleMap: Record<string, string> = {
    Modern: 'modern',
    Minimalist: 'minimalist',
    Elegant: 'elegant',
    Playful: 'playful',
    Rustic: 'rustic',
  };

  const [currentStep, setCurrentStep] = useState(0);
  const [form, setForm] = useState<FormState>(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Убеждаемся что все поля инициализированы
        return { 
          ...initialForm, 
          ...parsed,
          city: parsed.city || "",
          location: parsed.location || ""
        };
      } catch {
        return initialForm;
      }
    }
    return initialForm;
  });

  // Fix RSVP options translation when loading from localStorage
  useEffect(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        // Check if RSVP options are translation keys instead of translated text
        if (parsed.rsvp && parsed.rsvp.options) {
          const needsTranslation = parsed.rsvp.options.some((option: string) => 
            option.includes('builder.form.rsvp_options.')
          );
          
          if (needsTranslation) {
            setForm(prev => ({
              ...prev,
              rsvp: {
                ...prev.rsvp,
                options: [t('builder.form.rsvp_options.yes'), t('builder.form.rsvp_options.no')]
              }
            }));
          }
        }
      } catch (error) {
        console.warn('Failed to parse draft from localStorage:', error);
      }
    }
  }, [t]);
  
  const [selectedTemplate, setSelectedTemplate] = useState(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        const idx = eventTypesList.findIndex(e => e.label === parsed.eventType);
        return idx !== -1 ? idx : 0;
      } catch (error) {
        console.warn('Failed to parse draft from localStorage:', error);
        return 0;
      }
    }
    return 0;
  });
  const [selectedStyle, setSelectedStyle] = useState(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.selectedStyle || siteStyles[0].name;
      } catch (error) {
        console.warn('Failed to parse draft from localStorage:', error);
        return siteStyles[0].name;
      }
    }
    return siteStyles[0].name;
  });
  // selectedColor теперь key из colorSchemes
  const [selectedColor, setSelectedColor] = useState(() => {
    const draft = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        return parsed.selectedColor || 'bold_modern';
      } catch (error) {
        console.warn('Failed to parse draft from localStorage:', error);
        return 'bold_modern';
      }
    }
    return 'bold_modern';
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // Modal states
  const [showBackgroundModal, setShowBackgroundModal] = useState(false);
  const [showGalleryModal, setShowGalleryModal] = useState(false);
  const [showDressCodeModal, setShowDressCodeModal] = useState(false);
  const [showTimelineModal, setShowTimelineModal] = useState(false);
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [showWishesModal, setShowWishesModal] = useState(false);
  
  // Loading states
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingPhrase, setLoadingPhrase] = useState('');
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    console.log('Builder auth check:', { isInitialized, user: !!user, userEmail: user?.email });
    if (isInitialized && !user) {
      console.log('Redirecting to login from builder');
      navigate('/login?from=builder');
    }
  }, [user, isInitialized, navigate]);

  // Auto-save draft
  useEffect(() => {
    // Ensure RSVP options are translated before saving
    const formToSave = {
      ...form,
      rsvp: {
        ...form.rsvp,
        options: form.rsvp.options.map((option, index) => {
          // If it's a translation key, translate it
          if (option.includes('builder.form.rsvp_options.')) {
            return index === 0 ? t('builder.form.rsvp_options.yes') : t('builder.form.rsvp_options.no');
          }
          return option;
        })
      },
      selectedStyle,
      selectedColor
    };
    
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify(formToSave)
    );
  }, [form, selectedStyle, selectedColor, t]);

  // Clear draft on finish
  const clearDraft = () => localStorage.removeItem(LOCAL_STORAGE_KEY);

  // Validation
  useEffect(() => {
    setErrors(validateForm(form, t));
  }, [form, t]);

  const canNext = () => {
    if (currentStep === 0) return selectedTemplate !== undefined;
    if (currentStep === 1) {
      const errs = validateForm(form, t);
      return !errs.title && !errs.date && !errs.city && !errs.location && Object.keys(errs).filter(k=>k.startsWith('rsvp_')).length === 0;
    }
    return true;
  };

  const handleFieldBlur = (field: string) => setTouched(t => ({ ...t, [field]: true }));

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && canNext()) {
      e.preventDefault();
      handleNext();
    }
    if (e.key === "Escape") {
      e.preventDefault();
      handleBack();
    }
  };

  const loadingPhrases = [
    t('builder.loading.creating_design'),
    t('builder.loading.optimizing_layout'),
    t('builder.loading.adding_animations'),
    t('builder.loading.preparing_content'),
    t('builder.loading.finalizing_design'),
    t('builder.loading.almost_ready'),
    t('builder.loading.creating_magic'),
    t('builder.loading.assembling_pieces'),
    t('builder.loading.adding_finishing_touches'),
    t('builder.loading.preparing_for_launch'),
    t('builder.loading.generating_unique_design'),
    t('builder.loading.optimizing_performance'),
    t('builder.loading.adding_interactive_elements'),
    t('builder.loading.creating_responsive_layout'),
    t('builder.loading.finalizing_details')
  ];

  const startLoadingAnimation = () => {
    setIsGenerating(true);
    setLoadingPhrase(loadingPhrases[0]);
    
    let currentPhraseIndex = 0;
    
    const interval = setInterval(() => {
      if (currentPhraseIndex < loadingPhrases.length - 1) {
        currentPhraseIndex++;
        setLoadingPhrase(loadingPhrases[currentPhraseIndex]);
      }
    }, 1000); // Меняем фразу каждую секунду
    
    return interval;
  };

  const handleNext = async () => {
    if (currentStep === 1) setTouched({ title: true, date: true, city: true, location: true });
    if (!canNext()) return;
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    else {
      setIsLoading(true);
      
      // Запускаем анимацию загрузки
      const loadingInterval = startLoadingAnimation();
      
      try {
        const siteRequest = {
          event_type: eventTypesList.find(e => e.label === form.eventType)?.backendValue || 'other',
          theme: styleMap[selectedStyle] || 'modern',
          color_preferences: selectedColor,
          content_details: {
            event_title: form.title,
            event_date: form.date,
            event_time: form.time,
            city: form.city,
            venue_name: form.location,
            description: form.description && form.description.trim().length > 0
              ? form.description
              : `Дорогие друзья!\n\nС радостью приглашаем вас принять участие в нашем особенном событии${form.title ? ` — «${form.title}»` : ''}. Это будет день, наполненный яркими эмоциями, тёплой атмосферой и незабываемыми моментами.\n\nМы очень ценим ваше присутствие и будем рады разделить с вами этот праздник. Пожалуйста, приходите с хорошим настроением и желанием веселиться!\n\nДо скорой встречи!`,
            contact_name: form.contactName,
            contact_phone: form.contactPhone,
            contact_email: form.contactEmail,
            rsvp_enabled: form.rsvp.enabled,
            rsvp_options: form.rsvp.options,
            // Дополнительные опции
            timeline: form.timeline,
            dress_code: form.dressCode,
            gallery: form.gallery,
            background_music: form.backgroundMusic,
            wishes: form.wishes,
          },
        };
        
        // Ждем 10 секунд для показа анимации загрузки
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        await apiClient.generateSiteWithStatus(siteRequest, (status: any) => {});
        toast.success(`🎉 ${t('notifications.invitation_created')}`);
        clearDraft();
        setTimeout(() => navigate('/dashboard'), 1200);
      } catch (e) {
        toast.error(t('notifications.invitation_creation_error'));
      } finally {
        setIsLoading(false);
        setIsGenerating(false);
        clearInterval(loadingInterval);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
    else navigate("/");
  };

  const handleRSVPOptionChange = (idx: number, value: string) => {
    // Не даём менять первые два варианта
    if (idx < MIN_RSVP_OPTIONS) return;
    setForm(f => ({
      ...f,
      rsvp: {
        ...f.rsvp,
        options: f.rsvp.options.map((opt, i) => (i === idx ? value : opt))
      }
    }));
  };

  const handleRemoveRSVPOption = (idx: number) => {
    // Не даём удалять первые два варианта
    if (idx < MIN_RSVP_OPTIONS) return;
    setForm(f => ({
      ...f,
      rsvp: {
        ...f.rsvp,
        options: f.rsvp.options.filter((_, i) => i !== idx)
      }
    }));
  };

  const stepMotion = {
    initial: { opacity: 0, y: 32 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -32 },
    transition: { duration: 0.3 }
  };

  // Stepper-компонент
  const Stepper = ({ currentStep, onStepClick }: { currentStep: number; onStepClick: (step: number) => void }) => (
    <div className="flex justify-center items-center gap-0 mt-2 select-none">
      {[0,1,2,3].map(idx => (
        <div key={idx} className="flex items-center">
          <button
            type="button"
            disabled={idx >= currentStep}
            onClick={() => idx < currentStep && onStepClick(idx)}
            className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold transition-all duration-200 border-2 focus:outline-none
              ${currentStep === idx
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white border-indigo-400 shadow-lg scale-110 cursor-default'
                : idx < currentStep
                  ? 'bg-gradient-to-r from-indigo-400 to-purple-400 text-white border-indigo-300 cursor-pointer hover:scale-105'
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-default'}`}
          >
            {idx < currentStep ? <Check className="w-5 h-5" /> : idx+1}
          </button>
          {idx < 3 && (
            <div className={`w-12 h-1 mx-1 rounded-full transition-all duration-200
              ${idx < currentStep
                ? 'bg-gradient-to-r from-indigo-400 to-purple-400'
                : 'bg-gray-200'}`}
            />
          )}
        </div>
      ))}
    </div>
  );

  if (!isInitialized) return (
    <div className="flex min-h-screen items-center justify-center">
              <LoadingSpinner size="lg" text={t('common.loading')} />
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 pt-16">
        <div className="container mx-auto px-4 py-6 lg:py-12">
          {/* Header */}
          <div className="text-center mb-4 lg:mb-8">
            {/* Убираю текстовые подписи шагов */}
            <Stepper currentStep={currentStep} onStepClick={step => setCurrentStep(step)} />
          </div>

          {/* Main Content */}
          <div className="max-w-7xl mx-auto">
            <AnimatePresence mode="wait" initial={false}>
              {/* Step 1: Template Selection */}
              {currentStep === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
                  <Card className="p-6 lg:p-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                      {eventTypesList.map((template, idx) => {
                        const IconComponent = template.icon;
                        return (
                          <button
                            key={template.label}
                            className={`group relative p-6 lg:p-8 rounded-2xl border-2 transition-all duration-300 text-left hover:scale-105 hover:shadow-lg ${
                              selectedTemplate === idx
                                ? "border-indigo-500 bg-indigo-50 shadow-lg scale-105"
                                : "border-border bg-white hover:border-indigo-300"
                            }`}
                            onClick={() => {
                              setSelectedTemplate(idx);
                              setForm(f => ({ ...f, eventType: template.label }));
                              setCurrentStep(1);
                            }}
                          >
                            <div className={`inline-flex items-center justify-center w-12 h-12 lg:w-16 lg:h-16 rounded-xl bg-gradient-to-br ${template.color} mb-4 group-hover:scale-110 transition-transform`}>
                              <IconComponent className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
                            </div>
                            <h3 className="font-semibold text-lg lg:text-xl mb-2">{template.label}</h3>
                            <p className="text-sm lg:text-base text-muted-foreground">{template.description}</p>
                            {selectedTemplate === idx && (
                              <div className="absolute top-4 right-4 w-6 h-6 lg:w-8 lg:h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                                <Check className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </Card>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
                  <Card className="p-6 lg:p-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <form className="space-y-6 lg:space-y-8" ref={formRef}>
                      {/* Event Title */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <PartyPopper className="w-4 h-4 text-indigo-500" />
                          {t('builder.form.event_title')} *
                        </label>
                        <input
                          className={`w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                            errors.title && touched.title ? "border-destructive" : "border-border"
                          }`}
                          placeholder={t('builder.form.event_title_placeholder')}
                          value={form.title}
                          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                          onBlur={() => handleFieldBlur("title")}
                        />
                        {errors.title && touched.title && (
                          <p className="text-sm text-destructive">{errors.title}</p>
                        )}
                      </div>

                      {/* Date and Location Grid */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-indigo-500" />
                            {t('builder.form.event_date')} *
                          </label>
                          <DatePicker
                            value={form.date}
                            onChange={(date) => setForm(f => ({ ...f, date }))}
                            onBlur={() => handleFieldBlur("date")}
                            error={!!(errors.date && touched.date)}
                            placeholder={t('builder.form.event_date_placeholder')}
                          />
                          {errors.date && touched.date && (
                            <p className="text-sm text-destructive">{errors.date}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Clock className="w-4 h-4 text-indigo-500" />
                            {t('builder.form.event_time')}
                          </label>
                          <TimePicker
                            value={form.time}
                            onChange={(time) => setForm(f => ({ ...f, time }))}
                            placeholder={t('builder.form.event_time_placeholder')}
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-indigo-500" />
                            {t('builder.form.city')} *
                          </label>
                          <input
                            className={`w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                              errors.city && touched.city ? "border-destructive" : "border-border"
                            }`}
                            type="text"
                            placeholder={t('builder.form.city_placeholder')}
                            value={form.city}
                            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                            onBlur={() => handleFieldBlur("city")}
                          />
                          {errors.city && touched.city && (
                            <p className="text-sm text-destructive">{errors.city}</p>
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-indigo-500" />
                            {t('builder.form.location')} *
                          </label>
                          <input
                            type="text"
                            value={form.location}
                            onChange={(e) => setForm(f => ({ ...f, location: e.target.value }))}
                            onBlur={() => handleFieldBlur("location")}
                            placeholder={t('builder.form.location_placeholder')}
                            className="w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                          />
                          {errors.location && touched.location && (
                            <p className="text-sm text-destructive">{errors.location}</p>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          {t('builder.form.description')}
                        </label>
                        <textarea
                          className="w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm min-h-[120px] text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                          placeholder={t('builder.form.description_placeholder')}
                          value={form.description}
                          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        />
                      </div>

                      <Separator />

                      {/* Contact Information */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                          <User className="w-5 h-5 text-indigo-500" />
                          {t('builder.form.contact_information')}
                        </h3>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">{t('builder.form.contact_name')}</label>
                            <input
                              className="w-full p-3 border-2 rounded-xl bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              placeholder={t('builder.form.contact_name_placeholder')}
                              value={form.contactName}
                              onChange={e => setForm(f => ({ ...f, contactName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {t('builder.form.contact_phone')}
                            </label>
                            <input
                              className="w-full p-3 border-2 rounded-xl bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              placeholder={t('builder.form.contact_phone_placeholder')}
                              value={form.contactPhone}
                              onChange={e => setForm(f => ({ ...f, contactPhone: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              Email
                            </label>
                            <input
                              className="w-full p-3 border-2 rounded-xl bg-background/50 backdrop-blur-sm transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                              type="email"
                              placeholder={t('builder.form.contact_email_placeholder')}
                              value={form.contactEmail}
                              onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))}
                            />
                          </div>
                        </div>
                      </div>

                      <Separator />

                      {/* RSVP */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={form.rsvp.enabled}
                            onChange={e => setForm(f => ({ ...f, rsvp: { ...f.rsvp, enabled: e.target.checked } }))}
                            id="rsvp-enabled"
                            className="w-5 h-5 rounded border-2 border-indigo-500 text-indigo-500 focus:ring-indigo-500/20"
                          />
                          <label htmlFor="rsvp-enabled" className="text-lg font-semibold flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            {t('builder.form.rsvp.enable')}
                          </label>
                        </div>
                        
                        {form.rsvp.enabled && (
                          <div className="space-y-3 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
                            <h4 className="font-medium">{t('builder.form.rsvp.options_title')}</h4>
                            {form.rsvp.options.map((option, idx) => (
                              <div key={idx} className="flex items-center gap-3">
                                <input
                                  className={`flex-1 p-3 border-2 rounded-lg bg-background transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                                    errors[`rsvp_${idx}`] ? "border-destructive" : "border-border"
                                  }`}
                                  value={option}
                                  onChange={e => handleRSVPOptionChange(idx, e.target.value)}
                                  onBlur={() => setTouched(t => ({ ...t, [`rsvp_${idx}`]: true }))}
                                  placeholder={t('builder.form.rsvp.option_placeholder', { number: idx + 1 })}
                                  disabled={idx < MIN_RSVP_OPTIONS}
                                />
                                {form.rsvp.options.length > MIN_RSVP_OPTIONS && idx >= MIN_RSVP_OPTIONS && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="p-2 h-auto text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={() => handleRemoveRSVPOption(idx)}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                )}
                              </div>
                            ))}
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={() => setForm(f => ({ ...f, rsvp: { ...f.rsvp, options: [...f.rsvp.options, ""] } }))}
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {t('builder.form.rsvp.add_option')}
                            </Button>
                          </div>
                        )}
                      </div>
                    </form>
                  </Card>
                </motion.div>
              )}

                            {/* Step 3: Additional Options */}
              {currentStep === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
                  <Card className="p-6 lg:p-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                    <div className="text-center mb-8">
                      <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">
                        {t('builder.form.additional_options.title')}
                      </h2>
                      <p className="text-gray-600">
                        {t('builder.form.additional_options.subtitle')}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Background/Photo Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.backgroundImage ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowBackgroundModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.background.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.background.subtitle')}</p>
                            {form.backgroundImage && (
                              <div className="mt-2 text-xs text-indigo-600">✓ {t('builder.form.additional_options.background.added')}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Photo Gallery Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.gallery && form.gallery.length > 0 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowGalleryModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                            <Camera className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.gallery.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.gallery.subtitle')}</p>
                            {form.gallery && form.gallery.length > 0 && (
                              <div className="mt-2 text-xs text-indigo-600">{form.gallery.length} {t('builder.form.additional_options.gallery.photos_added')}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Dress Code Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.dressCode ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowDressCodeModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-red-500 rounded-xl flex items-center justify-center">
                            <Shirt className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.dress_code.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.dress_code.subtitle')}</p>
                            {form.dressCode && (
                              <div className="mt-2 text-xs text-indigo-600">✓ {t(`builder.form.additional_options.dress_code.${form.dressCode.type}`)}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Event Program Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.timeline && form.timeline.length > 0 ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowTimelineModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                            <List className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.timeline.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.timeline.subtitle')}</p>
                            {form.timeline && form.timeline.length > 0 && (
                              <div className="mt-2 text-xs text-indigo-600">{form.timeline.length} {t('builder.form.additional_options.timeline.events_added')}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Background Music Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.backgroundMusic ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowMusicModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.background_music.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.background_music.subtitle')}</p>
                            {form.backgroundMusic && (
                              <div className="mt-2 text-xs text-indigo-600">✓ {t(`builder.form.additional_options.background_music.${form.backgroundMusic}`)}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Wishes Card */}
                      <div 
                        className={`p-6 border-2 rounded-xl transition-all cursor-pointer group ${
                          form.wishes ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200 hover:border-indigo-300'
                        }`}
                        onClick={() => setShowWishesModal(true)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg mb-1">{t('builder.form.additional_options.wishes.title')}</h3>
                            <p className="text-sm text-gray-600">{t('builder.form.additional_options.wishes.subtitle')}</p>
                            {form.wishes && (
                              <div className="mt-2 text-xs text-indigo-600">✓ {t('builder.form.additional_options.wishes.added')}</div>
                            )}
                          </div>
                          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* Step 4: Customize Style */}
              {currentStep === 3 && (
                <motion.div key="step2" initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40 }} transition={{ duration: 0.3 }}>
                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Style Customization */}
                    <Card className="p-6 lg:p-10 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
                      <div className="space-y-8">
                        {/* Color Themes */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <Palette className="w-5 h-5 text-indigo-500" />
                            {t('builder.styling.color_scheme')}
                          </h3>
                          <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-2 2xl:grid-cols-4 gap-3">
                            {colorSchemes.map(scheme => (
                              <button
                                key={scheme.key}
                                className={`group relative aspect-square rounded-xl ${scheme.gradient} transition-all duration-300 hover:scale-105 ${selectedColor === scheme.key ? 'ring-4 ring-indigo-500/50 scale-105' : ''}`}
                                onClick={() => setSelectedColor(scheme.key)}
                                title={scheme.label}
                              >
                                {selectedColor === scheme.key && (
                                  <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                                      <Check className="w-4 h-4 text-indigo-500" />
                                    </div>
                                  </div>
                                )}
                                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-white drop-shadow font-semibold pointer-events-none">{scheme.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        <Separator />

                        {/* Site Styles */}
                        <div className="space-y-4">
                          <h3 className="text-xl font-semibold">{t('builder.styling.site_style')}</h3>
                          <div className="space-y-3">
                            {siteStyles.map((style) => (
                              <button
                                key={style.name}
                                className={`w-full p-4 text-left rounded-xl border-2 transition-all hover:scale-[1.02] ${
                                  selectedStyle === style.name
                                    ? "border-indigo-500 bg-indigo-50"
                                    : "border-border bg-background hover:border-indigo-300"
                                }`}
                                onClick={() => setSelectedStyle(style.name)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h4 className="font-semibold">{style.name}</h4>
                                    <p className="text-sm text-muted-foreground">{style.description}</p>
                                  </div>
                                  {selectedStyle === style.name && (
                                    <Check className="w-5 h-5 text-indigo-500" />
                                  )}
                                </div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Live Preview */}
                    <Card className="p-0 bg-white border-0 shadow-xl overflow-hidden">
                      <div className="bg-muted/30 px-4 py-3 border-b flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        </div>
                        <Badge variant="secondary" className="text-xs">{t('builder.preview.preview')}</Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="lg:hidden"
                          onClick={() => setShowPreview(!showPreview)}
                        >
                          {showPreview ? t('builder.preview.hide') : t('builder.preview.show')} {t('builder.preview.preview')}
                        </Button>
                      </div>
                      <div className={`${showPreview ? "block" : "hidden lg:block"}`}>
                        <iframe
                          title="Live Preview"
                          srcDoc={generateHTML({
                            event_type: eventTypesList.find(e => e.label === form.eventType)?.backendValue || 'other',
                            theme: styleMap[selectedStyle] || 'modern',
                            color_preferences: selectedColor,
                            content_details: {
                              event_title: form.title || t('builder.preview.default_title'),
                              event_date: form.date || "2024-12-31",
                              event_time: form.time || "",
                              city: form.city || "",
                              venue_name: form.location || t('builder.preview.default_location'),
                              description: form.description || t('builder.preview.default_description'),
                              contact_name: form.contactName,
                              contact_phone: form.contactPhone,
                              contact_email: form.contactEmail,
                              rsvp_enabled: form.rsvp.enabled,
                              rsvp_options: form.rsvp.options,
                              // Дополнительные опции
                              timeline: form.timeline,
                              dress_code: form.dressCode,
                              gallery: form.gallery,
                              background_music: form.backgroundMusic,
                              wishes: form.wishes,
                            },
                          })}
                          className="w-full h-[500px] border-0"
                          sandbox="allow-scripts allow-same-origin"
                        />
                        
                        {/* Map Preview */}
                        {(form.city || form.location) && (
                          <div className="p-4 border-t border-gray-200">
                            <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Карта локации
                            </h3>
                            <TwoGISMapPreview
                              location={`${form.city ? form.city + ', ' : ''}${form.location}`}
                              title={form.title || "Место проведения"}
                              height="200px"
                              className="rounded-lg"
                            />
                            {/* Debug info */}
                            <div className="mt-2 text-xs text-gray-500">
                              Debug: {`${form.city ? form.city + ', ' : ''}${form.location}`}
                            </div>
                          </div>
                        )}
                      </div>
                    </Card>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Navigation */}
          <div className="max-w-7xl mx-auto flex justify-between items-center mt-8 lg:mt-12">
            <Button 
              variant="ghost" 
              size="lg"
              onClick={handleBack} 
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {currentStep === 0 ? t('builder.navigation.cancel') : t('builder.navigation.back')}
            </Button>
            
            <Button 
              size="lg"
              onClick={handleNext} 
              disabled={!canNext() || isLoading}
              className="flex items-center gap-2 min-w-[140px]"
            >
              {currentStep === 3 ? (
                <>
                  <Sparkles className="w-4 h-4" />
                  {t('builder.navigation.create_invitation')}
                </>
              ) : (
                <>
                  {t('builder.navigation.next')}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {isGenerating && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md">
              <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
                <LoadingSpinner size="xl" text={loadingPhrase} />
                <p className="text-center text-gray-500 text-sm max-w-md">
                  {t('builder.loading.please_wait')}
                </p>
              </div>
            </div>
          )}
          
          {isLoading && !isGenerating && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
                <LoadingSpinner size="xl" text={t('builder.creating_invitation')} />
              </div>
            </div>
          )}

          {/* Background Image Modal */}
          {showBackgroundModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Фон или фото для сайта</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowBackgroundModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Перетащите файл сюда или нажмите для выбора</p>
                    <Button variant="outline" className="mt-4">
                      Выбрать файл
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowBackgroundModal(false)}>
                      Отмена
                    </Button>
                    <Button className="flex-1" onClick={() => setShowBackgroundModal(false)}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Modal */}
          {showGalleryModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('builder.form.additional_options.gallery.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowGalleryModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">{t('builder.form.additional_options.gallery.drag_drop')}</p>
                    <p className="text-sm text-gray-500">{t('builder.form.additional_options.gallery.max_files')}</p>
                    <Button variant="outline" className="mt-4">
                      {t('builder.form.additional_options.gallery.upload')}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowGalleryModal(false)}>
                      Отмена
                    </Button>
                    <Button className="flex-1" onClick={() => setShowGalleryModal(false)}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dress Code Modal */}
          {showDressCodeModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{t('builder.form.additional_options.dress_code.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowDressCodeModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">{t('builder.form.additional_options.dress_code.subtitle')}</p>
                  
                  {/* Готовые варианты */}
                  <div>
                    <h4 className="font-medium mb-3">Готовые варианты</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { type: 'formal', label: t('builder.form.additional_options.dress_code.formal'), desc: t('builder.form.additional_options.dress_code.formal_desc') },
                        { type: 'casual', label: t('builder.form.additional_options.dress_code.casual'), desc: t('builder.form.additional_options.dress_code.casual_desc') },
                        { type: 'business', label: t('builder.form.additional_options.dress_code.business'), desc: t('builder.form.additional_options.dress_code.business_desc') },
                        { type: 'costume', label: t('builder.form.additional_options.dress_code.costume'), desc: t('builder.form.additional_options.dress_code.costume_desc') },
                        { type: 'smart_casual', label: t('builder.form.additional_options.dress_code.smart_casual'), desc: t('builder.form.additional_options.dress_code.smart_casual_desc') },
                        { type: 'elegant', label: t('builder.form.additional_options.dress_code.elegant'), desc: t('builder.form.additional_options.dress_code.elegant_desc') }
                      ].map((dressCode) => (
                        <button
                          key={dressCode.type}
                          onClick={() => {
                            setForm(f => ({ ...f, dressCode: { type: dressCode.type as any, description: dressCode.desc } }));
                            setShowDressCodeModal(false);
                          }}
                          className={`p-4 text-left rounded-lg border-2 transition-all ${
                            form.dressCode?.type === dressCode.type
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          <div className="font-medium">{dressCode.label}</div>
                          <div className="text-sm text-gray-600">{dressCode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Свой дресс-код */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Plus className="w-4 h-4 text-indigo-500" />
                      Добавить свой дресс-код
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Название дресс-кода</label>
                        <input
                          type="text"
                          placeholder="Например: 'Пижамная вечеринка' или 'Костюм супергероя'"
                          className="w-full p-3 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                        <textarea
                          placeholder="Опишите желаемый стиль одежды для гостей..."
                          className="w-full p-3 border rounded-lg min-h-[100px] resize-none"
                        />
                      </div>
                      <Button className="w-full">
                        <Plus className="w-4 h-4 mr-2" />
                        Добавить дресс-код
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timeline Modal */}
          {showTimelineModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{t('builder.form.additional_options.timeline.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowTimelineModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">{t('builder.form.additional_options.timeline.subtitle')}</p>
                  
                  <div className="space-y-6">
                    {form.timeline.map((event, index) => (
                      <div key={event.id} className="p-6 bg-gray-50 rounded-lg border">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-medium text-lg">Событие {index + 1}</h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newTimeline = form.timeline.filter((_, i) => i !== index);
                              setForm(f => ({ ...f, timeline: newTimeline }));
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Время</label>
                            <input
                              type="time"
                              value={event.time}
                              onChange={(e) => {
                                const newTimeline = [...form.timeline];
                                newTimeline[index].time = e.target.value;
                                setForm(f => ({ ...f, timeline: newTimeline }));
                              }}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Название события</label>
                            <input
                              type="text"
                              placeholder={t('builder.form.additional_options.timeline.event_title')}
                              value={event.title}
                              onChange={(e) => {
                                const newTimeline = [...form.timeline];
                                newTimeline[index].title = e.target.value;
                                setForm(f => ({ ...f, timeline: newTimeline }));
                              }}
                              className="w-full p-3 border rounded-lg"
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Описание</label>
                            <textarea
                              placeholder={t('builder.form.additional_options.timeline.description')}
                              value={event.description}
                              onChange={(e) => {
                                const newTimeline = [...form.timeline];
                                newTimeline[index].description = e.target.value;
                                setForm(f => ({ ...f, timeline: newTimeline }));
                              }}
                              className="w-full p-3 border rounded-lg min-h-[120px] resize-none"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <Button
                      variant="outline"
                      onClick={() => {
                        const newEvent: TimelineEvent = {
                          id: Date.now().toString(),
                          time: '',
                          title: '',
                          description: ''
                        };
                        setForm(f => ({ ...f, timeline: [...f.timeline, newEvent] }));
                      }}
                      className="w-full py-4"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t('builder.form.additional_options.timeline.add_event')}
                    </Button>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => setShowTimelineModal(false)}>
                      Отмена
                    </Button>
                    <Button className="flex-1" onClick={() => setShowTimelineModal(false)}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Music Modal */}
          {showMusicModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold">{t('builder.form.additional_options.background_music.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowMusicModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <p className="text-sm text-gray-600">{t('builder.form.additional_options.background_music.subtitle')}</p>
                  
                  {/* Готовые варианты */}
                  <div>
                    <h4 className="font-medium mb-3">Готовые варианты</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {[
                        { value: '', label: t('builder.form.additional_options.background_music.none') },
                        { value: 'romantic', label: t('builder.form.additional_options.background_music.romantic') },
                        { value: 'party', label: t('builder.form.additional_options.background_music.party') },
                        { value: 'elegant', label: t('builder.form.additional_options.background_music.elegant') },
                        { value: 'fun', label: t('builder.form.additional_options.background_music.fun') }
                      ].map((music) => (
                        <button
                          key={music.value}
                          onClick={() => {
                            setForm(f => ({ ...f, backgroundMusic: music.value }));
                            setShowMusicModal(false);
                          }}
                          className={`p-4 text-center rounded-lg border-2 transition-all ${
                            form.backgroundMusic === music.value
                              ? 'border-indigo-500 bg-indigo-50'
                              : 'border-gray-200 hover:border-indigo-300'
                          }`}
                        >
                          {music.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Генерация с помощью ИИ */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-500" />
                      Генерация с помощью ИИ
                    </h4>
                    <div className="space-y-3">
                      <textarea
                        placeholder="Опишите желаемую музыку: например, 'романтичная мелодия для свадьбы' или 'веселая музыка для дня рождения'"
                        className="w-full p-3 border rounded-lg min-h-[80px] resize-none"
                      />
                      <Button className="w-full" disabled>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Сгенерировать музыку
                      </Button>
                    </div>
                  </div>

                  <Separator />

                  {/* Загрузка своей музыки */}
                  <div>
                    <h4 className="font-medium mb-3 flex items-center gap-2">
                      <Upload className="w-4 h-4 text-indigo-500" />
                      Загрузить свою музыку
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Music className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">Перетащите аудиофайл сюда или нажмите для выбора</p>
                      <p className="text-sm text-gray-500 mb-4">Поддерживаемые форматы: MP3, WAV, M4A (до 10MB)</p>
                      <Button variant="outline">
                        Выбрать файл
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Wishes Modal */}
          {showWishesModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{t('builder.form.additional_options.wishes.title')}</h3>
                  <Button variant="ghost" size="sm" onClick={() => setShowWishesModal(false)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600">{t('builder.form.additional_options.wishes.subtitle')}</p>
                  <textarea
                    value={form.wishes}
                    onChange={(e) => setForm(f => ({ ...f, wishes: e.target.value }))}
                    placeholder={t('builder.form.additional_options.wishes.placeholder')}
                    className="w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm min-h-[120px] text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                  <p className="text-sm text-gray-500">{t('builder.form.additional_options.wishes.examples')}</p>
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" onClick={() => setShowWishesModal(false)}>
                      Отмена
                    </Button>
                    <Button className="flex-1" onClick={() => setShowWishesModal(false)}>
                      Сохранить
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Builder;