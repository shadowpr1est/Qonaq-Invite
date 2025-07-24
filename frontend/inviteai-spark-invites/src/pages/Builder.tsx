
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
  Building2
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

type EventType = string;

interface RSVPState {
  enabled: boolean;
  options: string[];
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
  if (!form.title?.trim()) errors.title = "Title is required.";
  if (!form.date?.trim()) errors.date = "Date is required.";
  if (!form.city?.trim()) errors.city = t('builder.validation.city_required');
  if (!form.location?.trim()) errors.location = t('builder.validation.location_required');
  if (form.rsvp.enabled) {
    form.rsvp.options.forEach((opt, idx) => {
      if (!opt?.trim()) errors[`rsvp_${idx}`] = "Option cannot be empty.";
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
    rsvp: { enabled: false, options: [t('builder.form.rsvp_options.yes'), t('builder.form.rsvp_options.no')] }
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
  const formRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { user, isInitialized } = useAuth();

  // Redirect if not authenticated
  useEffect(() => {
    if (isInitialized && !user) navigate('/login?from=builder');
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

  const handleNext = async () => {
    if (currentStep === 1) setTouched({ title: true, date: true, city: true, location: true });
    if (!canNext()) return;
    if (currentStep < 2) setCurrentStep(currentStep + 1);
    else {
      setIsLoading(true);
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
          },
        };
        await apiClient.generateSiteWithStatus(siteRequest, (status: any) => {});
        toast.success('🎉 Invitation created successfully!');
        clearDraft();
        setTimeout(() => navigate('/dashboard'), 1200);
      } catch (e) {
        toast.error('Error creating invitation. Please try again.');
      } finally {
        setIsLoading(false);
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
      {[0,1,2].map(idx => (
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
          {idx < 2 && (
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
      <LoadingSpinner size="lg" text="Загрузка..." />
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
                          <input
                            className={`w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 ${
                              errors.date && touched.date ? "border-destructive" : "border-border"
                            }`}
                            type="date"
                            value={form.date}
                            onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                            onBlur={() => handleFieldBlur("date")}
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
                          <input
                            className="w-full p-4 border-2 rounded-xl bg-background/50 backdrop-blur-sm text-lg transition-all focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                            type="time"
                            value={form.time}
                            onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
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

              {/* Step 3: Customize Style */}
              {currentStep === 2 && (
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
              {currentStep === 2 ? (
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

          {isLoading && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm">
              <div className="w-full max-w-md flex flex-col items-center justify-center gap-6">
                <LoadingSpinner size="xl" text={t('builder.creating_invitation')} />
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Builder;