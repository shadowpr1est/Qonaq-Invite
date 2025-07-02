import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';

import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import type { SiteFormData, EventType, ThemeStyle, ColorScheme, Site } from '@/lib/types';

import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { 
  ArrowLeft,
  ArrowRight,
  Palette,
  Calendar,
  Clock,
  Users,
  Image,
  Type,
  Music,
  Map,
  Settings,
  Sparkles,
  Heart,
  Star,
  Gift,
  Home,
  Briefcase,
  GraduationCap,
  Eye,
  Save,
  Undo,
  Redo,
  Monitor,
  Smartphone,
  Tablet,
  Paintbrush,
  Layout,
  FileText,
  Share2,
  Download,
  Code,
  Zap,
  Globe,
  Camera,
  MousePointer,
  Lightbulb,
  Wand2,
  Shuffle,
  RefreshCw,
  Play,
  Pause,
  SkipForward,
  Volume2
} from 'lucide-react';

import { generateContext7Preview } from '@/lib/context7Preview';
import LivePreviewFrame from '@/components/LivePreviewFrame';

// Enhanced form validation schema for editing mode
const siteFormSchema = z.object({
  event_type: z.string().min(1, 'Выберите тип события'),
  theme: z.string().min(1, 'Выберите тему'),
  event_title: z.string().min(1, 'Введите название события'),
  event_date: z.string().optional(),
  event_time: z.string().optional(),
  venue_name: z.string().optional(),
  venue_address: z.string().optional(),
  description: z.string().min(10, 'Описание должно быть не менее 10 символов'),
  additional_info: z.string().optional(),
  contact_name: z.string().optional(),
  contact_phone: z.string().optional(),
  contact_email: z.string().email('Введите корректный email').optional().or(z.literal('')),
  color_preferences: z.string().optional(),
  style_preferences: z.string().optional(),
  target_audience: z.string().optional(),
});

type FormData = z.infer<typeof siteFormSchema>;

// Advanced preview modes
type PreviewMode = 'desktop' | 'tablet' | 'mobile';
type EditMode = 'create' | 'edit' | 'preview';

const eventTypes: Array<{ value: EventType; label: string; icon: React.ReactNode; color: string }> = [
  { value: 'wedding', label: 'Свадьба', icon: <Heart className="w-6 h-6" />, color: 'from-pink-500 to-purple-600' },
  { value: 'birthday', label: 'День рождения', icon: <Gift className="w-6 h-6" />, color: 'from-blue-500 to-indigo-600' },
  { value: 'anniversary', label: 'Юбилей', icon: <Star className="w-6 h-6" />, color: 'from-yellow-500 to-orange-600' },
  { value: 'corporate', label: 'Корпоратив', icon: <Briefcase className="w-6 h-6" />, color: 'from-green-500 to-teal-600' },
  { value: 'graduation', label: 'Выпускной', icon: <GraduationCap className="w-6 h-6" />, color: 'from-purple-500 to-pink-600' },
  { value: 'housewarming', label: 'Новоселье', icon: <Home className="w-6 h-6" />, color: 'from-emerald-500 to-cyan-600' },
];

const themes: Array<{ value: ThemeStyle; label: string; description: string; preview: string }> = [
  { value: 'modern', label: 'Современный', description: 'Минимализм и чистые линии', preview: 'bg-gradient-to-br from-gray-50 to-white' },
  { value: 'classic', label: 'Классический', description: 'Элегантность и традиции', preview: 'bg-gradient-to-br from-amber-50 to-orange-100' },
  { value: 'elegant', label: 'Элегантный', description: 'Роскошь и изысканность', preview: 'bg-gradient-to-br from-purple-50 to-indigo-100' },
  { value: 'playful', label: 'Игривый', description: 'Яркость и веселье', preview: 'bg-gradient-to-br from-pink-100 to-yellow-100' },
  { value: 'rustic', label: 'Рустик', description: 'Природная естественность', preview: 'bg-gradient-to-br from-green-50 to-emerald-100' },
  { value: 'vintage', label: 'Винтаж', description: 'Ретро и ностальгия', preview: 'bg-gradient-to-br from-amber-100 to-orange-200' },
];

const colorSchemes: Array<{ value: ColorScheme; label: string; colors: string[]; gradient: string }> = [
  { 
    value: 'romantic_pastels', 
    label: 'Романтичные пастели', 
    colors: ['#FFE4E1', '#F0F8FF', '#E6E6FA'],
    gradient: 'bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200'
  },
  { 
    value: 'vibrant_celebration', 
    label: 'Яркое торжество', 
    colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
    gradient: 'bg-gradient-to-r from-red-400 via-teal-400 to-blue-500'
  },
  { 
    value: 'elegant_neutrals', 
    label: 'Элегантные нейтральные', 
    colors: ['#F5F5DC', '#D2B48C', '#8B7355'],
    gradient: 'bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300'
  },
  { 
    value: 'bold_modern', 
    label: 'Смелый современный', 
    colors: ['#2C3E50', '#E74C3C', '#F39C12'],
    gradient: 'bg-gradient-to-r from-slate-600 via-red-500 to-orange-500'
  },
  { 
    value: 'nature_inspired', 
    label: 'Природные', 
    colors: ['#2ECC71', '#E67E22', '#8E44AD'],
    gradient: 'bg-gradient-to-r from-green-500 via-orange-500 to-purple-600'
  },
  { 
    value: 'classic_black_white', 
    label: 'Классический ч/б', 
    colors: ['#000000', '#FFFFFF', '#808080'],
    gradient: 'bg-gradient-to-r from-black via-gray-500 to-white'
  },
];

// Advanced Design State
interface DesignCustomization {
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    fontSize: number;
    lineHeight: number;
  };
  layout: {
    style: ThemeStyle;
    spacing: number;
    borderRadius: number;
    shadowIntensity: number;
  };
  animations: {
    enabled: boolean;
    speed: number;
    type: 'subtle' | 'smooth' | 'energetic';
  };
  elements: {
    headerStyle: 'minimal' | 'bold' | 'elegant';
    buttonStyle: 'rounded' | 'sharp' | 'pill';
    imageStyle: 'natural' | 'artistic' | 'professional';
  };
}

// AI Style Suggestions
interface StyleSuggestion {
  id: string;
  name: string;
  description: string;
  customization: Partial<DesignCustomization>;
  aiReason: string;
  popularity: number;
  tags: string[];
}

// Live Preview Mock Data
const generateLivePreview = (customization: DesignCustomization, formData: any) => {
  return {
    hero: {
      title: formData.event_title || 'Ваше событие',
      subtitle: formData.description || 'Описание вашего события',
      backgroundColor: customization.colorPalette.primary,
      textColor: customization.colorPalette.text,
      buttonColor: customization.colorPalette.accent
    },
    sections: [
      { type: 'about', title: 'О событии', content: formData.description },
      { type: 'details', title: 'Детали', content: `${formData.event_date} в ${formData.event_time}` },
      { type: 'contact', title: 'Контакты', content: formData.contact_name }
    ]
  };
};

const Builder = () => {
  const navigate = useNavigate();
  const { siteId } = useParams<{ siteId?: string }>();
  const { user, isInitialized } = useAuth();
  
  // Core state
  const [editMode, setEditMode] = useState<EditMode>(siteId ? 'edit' : 'create');
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  
  // Advanced editing state  
  const [previewMode, setPreviewMode] = useState<PreviewMode>('desktop');
  const [livePreview, setLivePreview] = useState(true);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [editHistory, setEditHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Advanced Design State
  const [designCustomization, setDesignCustomization] = useState<DesignCustomization>({
    colorPalette: {
      primary: '#8B5CF6',
      secondary: '#06B6D4',
      accent: '#F59E0B',
      background: '#FFFFFF',
      text: '#1F2937'
    },
    typography: {
      headingFont: 'Inter',
      bodyFont: 'Inter',
      fontSize: 16,
      lineHeight: 1.6
    },
    layout: {
      style: 'modern',
      spacing: 32,
      borderRadius: 12,
      shadowIntensity: 0.1
    },
    animations: {
      enabled: true,
      speed: 0.8,
      type: 'smooth'
    },
    elements: {
      headerStyle: 'minimal',
      buttonStyle: 'rounded',
      imageStyle: 'natural'
    }
  });
  const [aiSuggestions, setAiSuggestions] = useState<StyleSuggestion[]>([]);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  
  // Refs for auto-save and debouncing
  const autoSaveTimeout = useRef<NodeJS.Timeout>();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    getValues,
    formState: { errors, isValid, isDirty }
  } = useForm<FormData>({
    resolver: zodResolver(siteFormSchema),
    mode: 'onChange',
    defaultValues: {
      event_type: '',
      theme: '',
      event_title: '',
      description: '',
      color_preferences: '',
      target_audience: 'family_friends',
    }
  });

  // Watch form values for real-time updates
  const watchedValues = watch();

  // AI Style Generation
  const generateAISuggestions = useCallback(async () => {
    setIsGeneratingAI(true);
    try {
      // Simulate AI analysis based on form data
      const eventType = getValues('event_type');
      const description = getValues('description');
      const target = getValues('target_audience');
      
      // Mock AI suggestions based on input
      const suggestions: StyleSuggestion[] = [
        {
          id: 'ai-elegant-modern',
          name: 'Элегантная современность',
          description: 'Чистые линии с изысканными акцентами',
          aiReason: `На основе типа события "${eventType}" и описания, предлагаю утончённый стиль с минимализмом`,
          popularity: 92,
          tags: ['минимализм', 'элегантность', 'современность'],
          customization: {
            colorPalette: {
              primary: '#1E293B',
              secondary: '#64748B',
              accent: '#F59E0B',
              background: '#FFFFFF',
              text: '#0F172A'
            },
            layout: {
              style: 'elegant',
              spacing: 40,
              borderRadius: 8,
              shadowIntensity: 0.15
            }
          }
        },
        {
          id: 'ai-warm-inviting',
          name: 'Тёплое приглашение',
          description: 'Уютные цвета и дружелюбный дизайн',
          aiReason: `Для создания атмосферы близости и комфорта`,
          popularity: 87,
          tags: ['уют', 'тепло', 'дружелюбие'],
          customization: {
            colorPalette: {
              primary: '#DC2626',
              secondary: '#F97316',
              accent: '#FBBF24',
              background: '#FEF7ED',
              text: '#431407'
            },
            layout: {
              style: 'playful',
              spacing: 28,
              borderRadius: 16,
              shadowIntensity: 0.2
            }
          }
        },
        {
          id: 'ai-nature-inspired',
          name: 'Природная гармония',
          description: 'Естественные оттенки и органичные формы',
          aiReason: 'Создаёт ощущение спокойствия и природной красоты',
          popularity: 78,
          tags: ['природа', 'гармония', 'экология'],
          customization: {
            colorPalette: {
              primary: '#059669',
              secondary: '#0D9488',
              accent: '#84CC16',
              background: '#F0FDF4',
              text: '#14532D'
            },
            layout: {
              style: 'rustic',
              spacing: 36,
              borderRadius: 20,
              shadowIntensity: 0.1
            }
          }
        }
      ];
      
      setAiSuggestions(suggestions);
    } catch (error) {
      console.error('Error generating AI suggestions:', error);
    } finally {
      setIsGeneratingAI(false);
    }
  }, [getValues]);

  // Apply AI suggestion
  const applyAISuggestion = (suggestion: StyleSuggestion) => {
    setDesignCustomization(prev => ({
      ...prev,
      ...suggestion.customization
    }));
    
    // Update form values
    if (suggestion.customization.layout?.style) {
      setValue('theme', suggestion.customization.layout.style);
    }
    
    toast.success(`Применён стиль "${suggestion.name}"`);
  };

  // Random style generator
  const generateRandomStyle = () => {
    const randomColors = [
      { primary: '#8B5CF6', secondary: '#06B6D4', accent: '#F59E0B' },
      { primary: '#EF4444', secondary: '#F97316', accent: '#84CC16' },
      { primary: '#3B82F6', secondary: '#8B5CF6', accent: '#F59E0B' },
      { primary: '#10B981', secondary: '#06B6D4', accent: '#F59E0B' },
      { primary: '#F59E0B', secondary: '#EF4444', accent: '#8B5CF6' }
    ];
    
    const randomPalette = randomColors[Math.floor(Math.random() * randomColors.length)];
    const randomSpacing = 20 + Math.random() * 32;
    const randomRadius = 4 + Math.random() * 20;
    
    setDesignCustomization(prev => ({
      ...prev,
      colorPalette: {
        ...prev.colorPalette,
        ...randomPalette
      },
      layout: {
        ...prev.layout,
        spacing: randomSpacing,
        borderRadius: randomRadius
      }
    }));
    
    toast.success('Случайный стиль применён!');
  };

  // Generate AI suggestions when form data changes
  useEffect(() => {
    if (currentStep === 2 && watchedValues.event_type && watchedValues.description) {
      generateAISuggestions();
    }
  }, [currentStep, watchedValues.event_type, watchedValues.description, generateAISuggestions]);

  // Load existing site for editing
  useEffect(() => {
    if (siteId && editMode === 'edit') {
      loadSiteForEditing();
    }
  }, [siteId, editMode]);

  const loadSiteForEditing = async () => {
    try {
      setIsLoading(true);
      const generatedSite = await apiClient.getSite(siteId!);
      
      // Преобразуем GeneratedSite в Site для редактирования
      const site: Site = {
        ...generatedSite,
        event_type: generatedSite.event_type as EventType,
        theme: generatedSite.theme as ThemeStyle,
        content_details: {
          event_title: generatedSite.title,
          event_date: '',
          event_time: '',
          venue_name: '',
          venue_address: '',
          description: generatedSite.meta_description || '',
          additional_info: '',
          contact_name: '',
          contact_phone: '',
          contact_email: '',
        },
        color_preferences: undefined,
        style_preferences: '',
        target_audience: 'family_friends',
      };
      
      setCurrentSite(site);
      
      // Populate form with existing data
      reset({
        event_type: site.event_type,
        theme: site.theme,
        event_title: site.content_details.event_title,
        event_date: site.content_details.event_date,
        event_time: site.content_details.event_time,
        venue_name: site.content_details.venue_name,
        venue_address: site.content_details.venue_address,
        description: site.content_details.description,
        additional_info: site.content_details.additional_info,
        contact_name: site.content_details.contact_name,
        contact_phone: site.content_details.contact_phone,
        contact_email: site.content_details.contact_email,
        color_preferences: site.color_preferences || '',
        style_preferences: site.style_preferences,
        target_audience: site.target_audience,

      });
      
      // Load current HTML for preview
      if (site.html_content) {
        setPreviewHtml(site.html_content);
      }
      
      setCurrentStep(0); // Start at content editing tab
      
    } catch (error) {
      console.error('Ошибка загрузки сайта:', error);
      toast.error('Не удалось загрузить сайт для редактирования');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-save functionality
  useEffect(() => {
    if (editMode === 'edit' && isDirty && currentSite) {
      setHasUnsavedChanges(true);
      
      // Clear previous timeout
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
      
      // Set new timeout for auto-save
      autoSaveTimeout.current = setTimeout(() => {
        autoSave();
      }, 3000); // Auto-save after 3 seconds of inactivity
    }
    
    return () => {
      if (autoSaveTimeout.current) {
        clearTimeout(autoSaveTimeout.current);
      }
    };
  }, [watchedValues, editMode, currentSite, isDirty]);

  const autoSave = async () => {
    if (!currentSite || !hasUnsavedChanges) return;
    
    try {
      setIsSaving(true);
      const formData = getValues();
      
      const updateData = {
        ...formData,
        content_details: {
          event_title: formData.event_title,
          event_date: formData.event_date,
          event_time: formData.event_time,
          venue_name: formData.venue_name,
          venue_address: formData.venue_address,
          description: formData.description,
          additional_info: formData.additional_info,
          contact_name: formData.contact_name,
          contact_phone: formData.contact_phone,
          contact_email: formData.contact_email,
        },
        advanced_settings: {
          typography_scale: formData.typography_scale,
          animation_intensity: formData.animation_intensity,
          section_spacing: formData.section_spacing,
          border_radius: formData.border_radius,
          enable_animations: formData.enable_animations,
          enable_parallax: formData.enable_parallax,
          enable_dark_mode: formData.enable_dark_mode,
        }
      };
      
      await apiClient.updateSite(currentSite.id, updateData);
      setHasUnsavedChanges(false);
      toast.success('Изменения автоматически сохранены', { duration: 2000 });
      
    } catch (error) {
      console.error('Ошибка автосохранения:', error);
      toast.error('Ошибка автосохранения');
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview update с дебаунсом
  useEffect(() => {
    if (livePreview && editMode === 'edit' && currentSite) {
      const timeoutId = setTimeout(() => {
        updateLivePreview();
      }, 500); // Дебаунс 500мс для плавности

      return () => clearTimeout(timeoutId);
    }
  }, [watchedValues, livePreview, editMode]);

  // Автоматическое обновление превью при переходе между шагами
  useEffect(() => {
    if (editMode === 'create') {
      const timeoutId = setTimeout(async () => {
        try {
          const currentData = getValues();
          const html = await generatePreviewHtml(currentData);
          setPreviewHtml(html);
        } catch (error) {
          console.error('Ошибка обновления превью:', error);
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [currentStep, watchedValues, editMode, getValues]);

  // Загрузка начального превью
  useEffect(() => {
    const loadInitialPreview = async () => {
      try {
        if (editMode === 'edit' && currentSite) {
          // Use stored HTML if it exists, otherwise generate preview
          if (currentSite.html_content && currentSite.html_content.trim().length > 20) {
            setPreviewHtml(currentSite.html_content);
          } else {
            const html = await generatePreviewHtml(currentSite.site_structure || currentSite);
            setPreviewHtml(html);
          }
        } else if (editMode === 'create') {
          // For create mode, load default preview
          const defaultData = {
            event_type: 'birthday',
            event_title: 'Ваше событие',
            description: 'Добро пожаловать на наше мероприятие!'
          };
          const html = await generatePreviewHtml(defaultData);
          setPreviewHtml(html);
        }
      } catch (error) {
        console.error('Ошибка загрузки превью:', error);
        // Fallback to basic preview
        setPreviewHtml(generateContext7Preview({ 
          title: editMode === 'edit' ? (currentSite?.title || 'Загрузка...') : 'Ваше событие' 
        }));
      }
    };
    
    loadInitialPreview();
  }, [currentSite, editMode]);

  const updateLivePreview = useCallback(async () => {
    if (!currentSite) return;
    
    try {
      const formData = getValues();
      
      // Simulate updated site structure
      const updatedSiteData = {
        title: formData.event_title,
        meta_description: formData.description?.substring(0, 160),
        hero_section: {
          title: formData.event_title,
          subtitle: formData.description,
          background_type: "mesh_gradient",
          call_to_action: "Узнать подробности"
        },
        about_section: {
          title: "О событии",
          content: formData.description,
          highlights: []
        },
        contact_section: {
          title: "Контакты",
          email: formData.contact_email,
          phone: formData.contact_phone,
          name: formData.contact_name
        },
        color_scheme: {
          primary: "#3B82F6",
          secondary: "#8B5CF6", 
          accent: "#F59E0B",
          background: "#FFFFFF",
          text: "#1F2937"
        },
        fonts: {
          heading: "Inter",
          body: "Inter"
        },
        animations: ["fadeIn", "slideUp"],
        custom_css: "",
        advanced_settings: {
          typography_scale: formData.typography_scale,
          animation_intensity: formData.animation_intensity,
          section_spacing: formData.section_spacing,
          border_radius: formData.border_radius,
          enable_animations: formData.enable_animations,
          enable_parallax: formData.enable_parallax,
          enable_dark_mode: formData.enable_dark_mode,
        }
      };
      
      // Generate updated HTML (this would be an API call in real implementation)
      // For now, we'll simulate it
      const updatedHtml = await generatePreviewHtml(updatedSiteData);
      setPreviewHtml(updatedHtml);
      
    } catch (error) {
      console.error('Ошибка обновления превью:', error);
    }
  }, [currentSite, getValues]);

  const generatePreviewHtml = async (siteData: any): Promise<string> => {
    try {
      // Генерируем HTML превью напрямую без API вызова для быстрого отображения
      console.log('🎨 Генерируем HTML preview...', siteData);
      
      return generateContext7Preview(siteData);
      
    } catch (error) {
      console.error('❌ Ошибка генерации превью:', error);
      return generateContext7Preview(siteData);
    }
  };

  // Context7-enhanced fallback preview
  const generateFallbackPreview = (siteData: any): string => {
    const eventType = siteData.event_type || 'birthday';
    const title = siteData.event_title || siteData.title || 'Ваше событие';
    const description = siteData.description || 'Добро пожаловать на наше особенное мероприятие!';
    const eventDate = siteData.event_date || '';
    const eventTime = siteData.event_time || '';
    const venue = siteData.venue_name || '';
    const contactName = siteData.contact_name || '';
    const contactPhone = siteData.contact_phone || '';
    const contactEmail = siteData.contact_email || '';
    const theme = siteData.theme || 'modern';
    const colorPreference = siteData.color_preferences || '';
    
    // Умное определение цветовой схемы на основе выбора пользователя
    const getColorScheme = () => {
      // Если пользователь выбрал конкретные цвета
      if (colorPreference.includes('rose') || colorPreference.includes('розов')) return 'wedding';
      if (colorPreference.includes('blue') || colorPreference.includes('син') || colorPreference.includes('голуб')) return 'birthday';
      if (colorPreference.includes('emerald') || colorPreference.includes('зелен')) return 'anniversary';
      if (colorPreference.includes('amber') || colorPreference.includes('желт') || colorPreference.includes('золот')) return 'graduation';
      if (colorPreference.includes('slate') || colorPreference.includes('сер')) return 'corporate';
      
      // Иначе по типу события
      return eventType;
    };
    
    const actualColorScheme = getColorScheme();
    
    // Расширенные цветовые палитры с умным подбором
    const colorPalettes = {
      wedding: {
        primary: 'rose', secondary: 'pink', accent: 'purple',
        gradient: 'from-rose-50 via-pink-50 to-purple-50',
        heroGradient: 'from-rose-900 via-pink-900 to-purple-900',
        textGradient: 'from-slate-800 via-rose-800 to-purple-800'
      },
      birthday: {
        primary: 'blue', secondary: 'indigo', accent: 'purple',
        gradient: 'from-blue-50 via-indigo-50 to-purple-50',
        heroGradient: 'from-blue-900 via-indigo-900 to-purple-900',
        textGradient: 'from-slate-800 via-blue-800 to-indigo-800'
      },
      corporate: {
        primary: 'slate', secondary: 'gray', accent: 'zinc',
        gradient: 'from-slate-50 via-gray-50 to-zinc-50',
        heroGradient: 'from-slate-900 via-gray-900 to-zinc-900',
        textGradient: 'from-slate-900 via-gray-800 to-zinc-800'
      },
      anniversary: {
        primary: 'emerald', secondary: 'teal', accent: 'cyan',
        gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
        heroGradient: 'from-emerald-900 via-teal-900 to-cyan-900',
        textGradient: 'from-slate-800 via-emerald-800 to-teal-800'
      },
      graduation: {
        primary: 'amber', secondary: 'orange', accent: 'red',
        gradient: 'from-amber-50 via-orange-50 to-red-50',
        heroGradient: 'from-amber-900 via-orange-900 to-red-900',
        textGradient: 'from-slate-800 via-amber-800 to-orange-800'
      }
    };
    
    const palette = colorPalettes[actualColorScheme] || colorPalettes.birthday;
    
    // ИИ-генерируемый богатый контент по типу события
    const generateSmartContent = () => {
      const age = title.match(/(\d+)\s*лет/)?.[1];
      const isRoundAge = age && (parseInt(age) % 10 === 0 || parseInt(age) % 5 === 0);
      
      const contentTemplates = {
        wedding: {
          features: [
            { icon: '💒', title: 'Торжественная церемония', desc: 'Обмен клятвами в окружении родных и близких в прекрасной атмосфере любви' },
            { icon: '📸', title: 'Фотосессия', desc: 'Профессиональная съемка самых важных моментов для памяти на всю жизнь' },
            { icon: '🥂', title: 'Банкет и тосты', desc: 'Изысканный ужин с теплыми поздравлениями от гостей' },
            { icon: '💃', title: 'Танцы до утра', desc: 'Живая музыка и танцевальная программа для незабываемого веселья' },
            { icon: '🎁', title: 'Подарки молодоженам', desc: 'Особенные подарки в честь начала новой семейной жизни' },
            { icon: '🌹', title: 'Букет невесты', desc: 'Традиционное бросание букета для будущего счастья' }
          ],
          aboutTitle: 'Наша История Любви',
          aboutText: 'Каждая любовь уникальна, как и наша. Мы прошли долгий путь, чтобы оказаться здесь, и сегодня хотим разделить нашу радость с самыми дорогими людьми. Этот день станет началом нашей общей истории как семьи.',
          timeline: [
            { year: 'Встреча', desc: 'Наша судьбоносная встреча' },
            { year: 'Первое свидание', desc: 'Волшебный вечер, который все изменил' },
            { year: 'Предложение', desc: 'Момент, когда мы решили быть вместе навсегда' },
            { year: 'Свадьба', desc: 'Сегодня мы говорим "да" перед всеми' }
          ]
        },
        
        birthday: {
          features: age ? [
            { icon: '🎂', title: `Торт ${age} лет`, desc: `Особенный торт в честь ${isRoundAge ? 'юбилейного ' : ''}${age}-летия` },
            { icon: '🎁', title: 'Подарки и сюрпризы', desc: 'Много интересных подарков и неожиданных сюрпризов от друзей' },
            { icon: '🎵', title: 'Музыкальная программа', desc: 'Любимые песни именинника и танцы под живую музыку' },
            { icon: '📱', title: 'Фото на память', desc: 'Фотозона с реквизитом и профессиональная съемка праздника' },
            { icon: '🍽️', title: 'Праздничное меню', desc: 'Вкусные угощения и любимые блюда именинника' },
            { icon: '🎪', title: 'Развлечения', desc: 'Игры, конкурсы и веселые активности для всех гостей' }
          ] : [
            { icon: '🎂', title: 'Праздничный торт', desc: 'Красивый торт с задуванием свечей и загадыванием желания' },
            { icon: '🎁', title: 'Подарки', desc: 'Время для поздравлений и вручения подарков' },
            { icon: '🎵', title: 'Музыка и танцы', desc: 'Танцы под любимые песни и веселая музыкальная программа' },
            { icon: '📸', title: 'Фотосессия', desc: 'Фотографии на память в кругу друзей и семьи' },
            { icon: '🍰', title: 'Праздничное меню', desc: 'Вкусные угощения и напитки для всех гостей' },
            { icon: '🎈', title: 'Декор и атмосфера', desc: 'Красивое оформление и праздничная атмосфера' }
          ],
          aboutTitle: isRoundAge ? `Юбилей - ${age} лет!` : 'Празднуем День Рождения!',
          aboutText: age ? 
            `${isRoundAge ? 'Круглая дата - особый повод для большого праздника!' : 'Еще один год жизни, полный ярких моментов!'} Присоединяйтесь к нам, чтобы отметить этот особенный день в кругу самых близких людей. Будет много смеха, радости и незабываемых воспоминаний!` :
            'Присоединяйтесь к нам для веселого празднования дня рождения! Будет много смеха, музыки, подарков и незабываемых моментов в кругу друзей и семьи.',
          specialNote: isRoundAge ? 'Юбилейная дата заслуживает особого внимания!' : 'Каждый день рождения особенный!'
        },
        
        corporate: {
          features: [
            { icon: '🏆', title: 'Награждение лучших', desc: 'Признание достижений сотрудников и вручение наград за выдающиеся результаты' },
            { icon: '📊', title: 'Презентация итогов', desc: 'Подведение итогов года и презентация планов на будущее' },
            { icon: '🤝', title: 'Нетворкинг', desc: 'Возможность для общения между департаментами и укрепления связей' },
            { icon: '🎯', title: 'Командные активности', desc: 'Team building активности для укрепления корпоративного духа' },
            { icon: '🍽️', title: 'Корпоративный банкет', desc: 'Изысканный ужин в непринужденной атмосфере' },
            { icon: '🎤', title: 'Выступления руководства', desc: 'Вдохновляющие речи и объявление важных новостей' }
          ],
          aboutTitle: 'Корпоративное Мероприятие',
          aboutText: 'Время подвести итоги, отметить достижения и настроиться на новые цели. Наша команда - это наша сила, и сегодня мы празднуем наши общие успехи и строим планы на будущее.',
          values: ['Командная работа', 'Инновации', 'Профессионализм', 'Развитие']
        },
        
        anniversary: {
          features: [
            { icon: '💕', title: 'Годы вместе', desc: 'Празднование прожитых вместе лет и общих достижений' },
            { icon: '📱', title: 'Воспоминания', desc: 'Фотогалерея и видео с лучшими моментами совместной жизни' },
            { icon: '🥂', title: 'Торжественный тост', desc: 'Поднимем бокалы за любовь, которая крепнет с годами' },
            { icon: '💐', title: 'Цветы и подарки', desc: 'Символические подарки в честь прожитых вместе лет' },
            { icon: '🎵', title: 'Наша музыка', desc: 'Песни, которые сопровождали нас на протяжении всех этих лет' },
            { icon: '👨‍👩‍👧‍👦', title: 'Семья и друзья', desc: 'В кругу самых близких людей, которые разделяют нашу радость' }
          ],
          aboutTitle: 'Наша Годовщина',
          aboutText: 'Время летит незаметно, когда ты рядом с любимым человеком. Сегодня мы отмечаем еще один год нашей совместной жизни, полной любви, понимания и взаимной поддержки.',
          milestones: 'За эти годы мы построили крепкую семью и создали множество прекрасных воспоминаний'
        },
        
        graduation: {
          features: [
            { icon: '🎓', title: 'Вручение дипломов', desc: 'Торжественная церемония получения документов об образовании' },
            { icon: '📚', title: 'Подведение итогов', desc: 'Вспоминаем лучшие моменты студенческих лет и достижения' },
            { icon: '👨‍🎓', title: 'Выступления выпускников', desc: 'Речи от лучших студентов курса и пожелания будущим поколениям' },
            { icon: '📸', title: 'Фото выпускников', desc: 'Групповые и индивидуальные фотографии на память' },
            { icon: '🚀', title: 'Планы на будущее', desc: 'Обсуждение карьерных планов и жизненных целей' },
            { icon: '🎉', title: 'Праздничный банкет', desc: 'Торжественный ужин в честь завершения учебы' }
          ],
          aboutTitle: 'Выпускной - Начало Нового Пути',
          aboutText: 'Сегодня мы закрываем одну важную главу нашей жизни и открываем новую. Годы учебы подходят к концу, но впереди нас ждут новые вызовы и возможности для профессионального и личностного роста.',
          achievement: 'Диплом - это не конец пути, а билет в будущее!'
        }
      };
      
      return contentTemplates[eventType] || contentTemplates.birthday;
    };
    
    const content = generateSmartContent();
    
    return `<!DOCTYPE html>
<html lang="ru" class="scroll-smooth">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      theme: {
        extend: {
          animation: {
            'float': 'float 6s ease-in-out infinite',
            'float-delayed': 'float 8s ease-in-out infinite',
            'glow': 'glow 3s ease-in-out infinite alternate',
            'fade-in': 'fadeIn 1.2s ease-out',
            'fade-in-up': 'fadeInUp 1s ease-out',
            'spin-slow': 'spin 30s linear infinite',
            'pulse-soft': 'pulse 4s ease-in-out infinite',
            'bounce-soft': 'bounceSoft 2s ease-in-out infinite',
            'wiggle': 'wiggle 1s ease-in-out infinite',
            'scale-up': 'scaleUp 0.3s ease-out',
            'gradient-x': 'gradientX 8s ease infinite',
            'shimmer': 'shimmer 2s linear infinite',
            'particle': 'particle 20s ease-in-out infinite',
            'blob': 'blob 7s ease-in-out infinite',
            'twinkle': 'twinkle 2s ease-in-out infinite alternate'
          },
          keyframes: {
            float: { 
              '0%, 100%': { transform: 'translateY(0px) rotate(0deg)' }, 
              '50%': { transform: 'translateY(-30px) rotate(5deg)' } 
            },
            glow: { 
              '0%': { opacity: '0.4', filter: 'blur(8px)', transform: 'scale(1)' }, 
              '100%': { opacity: '0.8', filter: 'blur(12px)', transform: 'scale(1.1)' } 
            },
            fadeIn: { 
              '0%': { opacity: '0', transform: 'translateY(40px) scale(0.9)' }, 
              '100%': { opacity: '1', transform: 'translateY(0) scale(1)' } 
            },
            fadeInUp: { 
              '0%': { opacity: '0', transform: 'translateY(60px)' }, 
              '100%': { opacity: '1', transform: 'translateY(0)' } 
            },
            bounceSoft: {
              '0%, 100%': { transform: 'translateY(0px)' },
              '50%': { transform: 'translateY(-10px)' }
            },
            wiggle: {
              '0%, 100%': { transform: 'rotate(-2deg)' },
              '50%': { transform: 'rotate(2deg)' }
            },
            scaleUp: {
              '0%': { transform: 'scale(1)' },
              '100%': { transform: 'scale(1.05)' }
            },
            gradientX: {
              '0%, 100%': { 'background-position': '0% 50%' },
              '50%': { 'background-position': '100% 50%' }
            },
            gradientY: {
              '0%, 100%': { 'background-position': '50% 0%' },
              '50%': { 'background-position': '50% 100%' }
            },
            shimmer: {
              '0%': { 'background-position': '-200% 0' },
              '100%': { 'background-position': '200% 0' }
            }
          },
          fontFamily: {
            'display': ['Space Grotesk', 'Inter', 'sans-serif'],
            'body': ['Inter', 'system-ui', 'sans-serif']
          },
          backdropBlur: {
            'xs': '2px',
            '4xl': '72px'
          }
        }
      }
    }
  </script>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Inter:wght@300;400;500;600;700;800;900&display=swap');
    
    * {
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    
    body { 
      font-family: 'Inter', system-ui, sans-serif;
      font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
    }
    
    .gradient-mesh {
      background: 
        radial-gradient(circle at 20% 80%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(255, 119, 198, 0.3) 0%, transparent 50%),
        radial-gradient(circle at 40% 40%, rgba(120, 198, 255, 0.3) 0%, transparent 50%);
    }
    
    .glass-card {
      background: rgba(255, 255, 255, 0.25);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.18);
      box-shadow: 
        0 8px 32px 0 rgba(31, 38, 135, 0.15),
        inset 0 1px 0 0 rgba(255, 255, 255, 0.2);
    }
    
    .neumorphism {
      background: linear-gradient(145deg, #f0f0f0, #ffffff);
      box-shadow: 
        20px 20px 40px #d1d1d1,
        -20px -20px 40px #ffffff,
        inset 2px 2px 4px rgba(255,255,255,0.1),
        inset -2px -2px 4px rgba(0,0,0,0.1);
    }
    
    .text-shimmer {
      background: linear-gradient(
        90deg,
        rgba(255,255,255,0) 0%,
        rgba(255,255,255,0.8) 50%,
        rgba(255,255,255,0) 100%
      );
      background-size: 200% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      animation: shimmer 3s infinite;
    }
    
    .floating-particles::before,
    .floating-particles::after {
      content: '';
      position: absolute;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.6);
      animation: float 4s ease-in-out infinite;
    }
    
    .floating-particles::before {
      top: 20%;
      left: 10%;
      animation-delay: 0s;
    }
    
    .floating-particles::after {
      top: 60%;
      right: 15%;
      animation-delay: 2s;
    }
    
    .custom-scrollbar::-webkit-scrollbar { width: 8px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.1); border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { 
      background: linear-gradient(45deg, #${palette.primary === 'rose' ? 'f43f5e' : palette.primary === 'blue' ? '3b82f6' : palette.primary === 'emerald' ? '10b981' : palette.primary === 'amber' ? 'f59e0b' : '64748b'}, #${palette.secondary === 'pink' ? 'ec4899' : palette.secondary === 'indigo' ? '6366f1' : palette.secondary === 'teal' ? '14b8a6' : palette.secondary === 'orange' ? 'f97316' : '64748b'});
      border-radius: 4px;
    }
    
    .hero-bg {
      background: 
        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.4) 0%, transparent 60%),
        linear-gradient(135deg, 
          ${palette.gradient.replace('from-', '').replace(' via-', ', ').replace(' to-', ', ').replace('-50', '')},
          rgba(255, 255, 255, 0.1)
        );
    }
    
    @media (max-width: 768px) {
      .hero-bg { background-attachment: scroll; }
    }
    
    .btn-primary {
      background: linear-gradient(135deg, 
        rgb(${palette.primary === 'rose' ? '244, 63, 94' : palette.primary === 'blue' ? '59, 130, 246' : palette.primary === 'emerald' ? '16, 185, 129' : palette.primary === 'amber' ? '245, 158, 11' : '100, 116, 139'}), 
        rgb(${palette.secondary === 'pink' ? '236, 72, 153' : palette.secondary === 'indigo' ? '99, 102, 241' : palette.secondary === 'teal' ? '20, 184, 166' : palette.secondary === 'orange' ? '249, 115, 22' : '100, 116, 139'})
      );
      box-shadow: 
        0 10px 25px -5px rgba(${palette.primary === 'rose' ? '244, 63, 94' : palette.primary === 'blue' ? '59, 130, 246' : palette.primary === 'emerald' ? '16, 185, 129' : palette.primary === 'amber' ? '245, 158, 11' : '100, 116, 139'}, 0.4),
        0 6px 12px -2px rgba(0, 0, 0, 0.1);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .btn-primary:hover {
      transform: translateY(-2px) scale(1.02);
      box-shadow: 
        0 20px 40px -5px rgba(${palette.primary === 'rose' ? '244, 63, 94' : palette.primary === 'blue' ? '59, 130, 246' : palette.primary === 'emerald' ? '16, 185, 129' : palette.primary === 'amber' ? '245, 158, 11' : '100, 116, 139'}, 0.5),
        0 10px 20px -2px rgba(0, 0, 0, 0.15);
    }
  </style>
</head>
<body class="min-h-screen bg-gradient-to-br ${palette.gradient} antialiased">
  <!-- Hero Section -->
  <section class="relative min-h-screen flex items-center justify-center overflow-hidden hero-bg floating-particles">
    <!-- Sophisticated Background Layers -->
    <div class="absolute inset-0 gradient-mesh"></div>
    <div class="absolute inset-0 bg-gradient-to-br ${palette.heroGradient} opacity-80"></div>
    <div class="absolute inset-0 bg-gradient-conic from-${palette.primary}-500 via-${palette.secondary}-500 to-${palette.accent}-500 opacity-15 animate-spin-slow" style="background-size: 400% 400%; animation: gradientX 8s ease infinite;"></div>
    
    <!-- Enhanced Floating Elements -->
    <div class="absolute top-16 left-16 w-40 h-40 bg-gradient-conic from-${palette.primary}-400 via-${palette.secondary}-300 to-${palette.accent}-400 rounded-full opacity-20 animate-float filter blur-sm"></div>
    <div class="absolute top-32 left-32 w-20 h-20 bg-gradient-to-r from-${palette.primary}-500 to-${palette.secondary}-500 rounded-full opacity-30 animate-float-delayed"></div>
    
    <div class="absolute bottom-16 right-16 w-32 h-32 bg-gradient-conic from-${palette.secondary}-400 via-${palette.accent}-300 to-${palette.primary}-400 rounded-full opacity-25 animate-float filter blur-sm" style="animation-delay: 3s;"></div>
    <div class="absolute bottom-32 right-32 w-16 h-16 bg-gradient-to-l from-${palette.secondary}-500 to-${palette.accent}-500 rounded-full opacity-35 animate-float-delayed" style="animation-delay: 1.5s;"></div>
    
    <div class="absolute top-1/3 left-8 w-12 h-12 bg-gradient-to-r from-${palette.accent}-400 to-${palette.primary}-400 rounded-full opacity-20 animate-bounce-soft" style="animation-delay: 2s;"></div>
    <div class="absolute top-2/3 right-8 w-8 h-8 bg-gradient-to-l from-white to-${palette.secondary}-200 rounded-full opacity-40 animate-pulse-soft" style="animation-delay: 1s;"></div>
    
    <!-- Glass Morphism Backdrop -->
    <div class="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20"></div>
    
    <div class="relative z-20 text-center px-6 max-w-6xl mx-auto">
      <div class="space-y-8">
                  <h1 class="font-display text-3xl md:text-5xl lg:text-6xl font-black text-white mb-8 tracking-tight animate-fade-in relative">
          <span class="bg-gradient-to-r from-white via-white to-white/80 bg-clip-text text-transparent">
            ${title}
          </span>
          <div class="absolute inset-0 bg-gradient-to-r from-white/20 via-white/10 to-transparent bg-clip-text text-transparent text-shimmer animate-shimmer"></div>
        </h1>
        
        <p class="text-xl md:text-3xl lg:text-4xl text-white/95 mb-12 leading-relaxed font-light animate-fade-in-up" style="animation-delay: 0.4s;">
          <span class="bg-gradient-to-r from-white to-white/90 bg-clip-text text-transparent">
            ${description}
          </span>
        </p>
      </div>
      
      ${eventDate || eventTime || venue ? `
      <div class="glass-card rounded-3xl p-8 mb-12 animate-fade-in-up border-2 border-white/30 relative overflow-hidden" style="animation-delay: 0.6s;">
        <div class="absolute inset-0 bg-gradient-to-r from-white/5 via-white/10 to-white/5"></div>
        <div class="relative z-10">
          <h3 class="text-2xl font-bold text-white mb-6 text-center font-display">Детали события</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${eventDate ? `
            <div class="text-center group">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${palette.primary}-400 to-${palette.secondary}-400 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                📅
              </div>
              <div class="font-bold text-lg text-white mb-1">Дата</div>
              <div class="text-white/90 text-lg">${eventDate}</div>
            </div>
            ` : ''}
            ${eventTime ? `
            <div class="text-center group">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${palette.secondary}-400 to-${palette.accent}-400 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                🕐
              </div>
              <div class="font-bold text-lg text-white mb-1">Время</div>
              <div class="text-white/90 text-lg">${eventTime}</div>
            </div>
            ` : ''}
            ${venue ? `
            <div class="text-center group">
              <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-${palette.accent}-400 to-${palette.primary}-400 rounded-2xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform duration-300">
                📍
              </div>
              <div class="font-bold text-lg text-white mb-1">Место</div>
              <div class="text-white/90 text-lg">${venue}</div>
            </div>
            ` : ''}
          </div>
        </div>
      </div>
      ` : ''}
      
      <div class="flex flex-col sm:flex-row gap-6 justify-center animate-fade-in-up max-w-lg mx-auto" style="animation-delay: 0.8s;">
        <button class="btn-primary px-10 py-5 text-white rounded-2xl font-bold text-lg shadow-2xl relative overflow-hidden group">
          <span class="relative z-10">Подтвердить участие</span>
          <div class="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
        </button>
        <button class="glass-card px-10 py-5 text-white rounded-2xl font-bold text-lg border-2 border-white/40 hover:border-white/60 hover:bg-white/30 transition-all duration-300 group relative overflow-hidden">
          <span class="relative z-10">Подробности</span>
          <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500"></div>
        </button>
      </div>
    </div>
  </section>

  <!-- About Section -->
  <section class="py-24 px-6 relative overflow-hidden">
    <!-- Sophisticated Background -->
    <div class="absolute inset-0 bg-gradient-to-br from-white via-${palette.primary}-50/30 to-${palette.secondary}-50/30"></div>
    <div class="absolute inset-0 bg-gradient-to-tl from-transparent via-white/40 to-white/60 backdrop-blur-3xl"></div>
    
    <!-- Floating Background Elements -->
    <div class="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-${palette.primary}-200/20 to-${palette.secondary}-200/20 rounded-full filter blur-3xl animate-float-delayed"></div>
    <div class="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-tr from-${palette.secondary}-200/20 to-${palette.accent}-200/20 rounded-full filter blur-2xl animate-float" style="animation-delay: 3s;"></div>
    
    <div class="relative z-10 max-w-5xl mx-auto text-center">
      <div class="space-y-8">
        <h2 class="font-display text-5xl md:text-7xl font-black bg-gradient-to-br ${palette.textGradient} bg-clip-text text-transparent mb-12 relative">
          ${content.aboutTitle}
          <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-${palette.primary}-500 to-${palette.secondary}-500 rounded-full"></div>
        </h2>
        
        <div class="glass-card rounded-3xl p-12 border border-white/20 relative overflow-hidden group">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-${palette.primary}-400 via-${palette.secondary}-400 to-${palette.accent}-400"></div>
          
          <div class="relative z-10">
            <p class="text-2xl md:text-3xl text-gray-800 leading-relaxed font-light mb-8">
              ${content.aboutText}
            </p>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
              <div class="text-center group">
                <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-${palette.primary}-100 to-${palette.primary}-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <span class="text-2xl">🎉</span>
                </div>
                <div class="text-sm font-semibold text-gray-600">Незабываемо</div>
              </div>
              
              <div class="text-center group">
                <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-${palette.secondary}-100 to-${palette.secondary}-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <span class="text-2xl">❤️</span>
                </div>
                <div class="text-sm font-semibold text-gray-600">С любовью</div>
              </div>
              
              <div class="text-center group">
                <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-${palette.accent}-100 to-${palette.accent}-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <span class="text-2xl">✨</span>
                </div>
                <div class="text-sm font-semibold text-gray-600">Особенное</div>
              </div>
              
              <div class="text-center group">
                <div class="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-${palette.primary}-100 to-${palette.secondary}-200 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                  <span class="text-2xl">🎊</span>
                </div>
                <div class="text-sm font-semibold text-gray-600">Праздничное</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>



  <!-- Special AI Section -->
  <section class="py-20 px-6 bg-white/60 backdrop-blur-sm">
    <div class="max-w-4xl mx-auto">
      ${eventType === 'birthday' && content.specialNote ? `
      <div class="text-center mb-12">
        <div class="inline-block px-6 py-3 bg-gradient-to-r from-${palette.primary}-500 to-${palette.secondary}-500 text-white rounded-full font-semibold text-lg shadow-lg">
          ${content.specialNote}
        </div>
      </div>
      ` : ''}
      
      ${eventType === 'wedding' && content.timeline ? `
      <div class="space-y-8">
        <h2 class="text-4xl font-bold text-center text-gray-800 mb-12">Наш путь к алтарю</h2>
        <div class="grid md:grid-cols-2 gap-8">
          ${content.timeline.map((milestone, index) => `
          <div class="flex items-start gap-4 p-6 bg-white/80 rounded-2xl border border-${palette.primary}-100 hover:border-${palette.primary}-300 transition-all">
            <div class="w-8 h-8 bg-gradient-to-r from-${palette.primary}-500 to-${palette.secondary}-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
              ${index + 1}
            </div>
            <div>
              <h3 class="font-bold text-xl text-gray-800 mb-2">${milestone.year}</h3>
              <p class="text-gray-600">${milestone.desc}</p>
            </div>
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${eventType === 'corporate' && content.values ? `
      <div class="text-center">
        <h2 class="text-4xl font-bold text-gray-800 mb-8">Наши ценности</h2>
        <div class="flex flex-wrap justify-center gap-4">
          ${content.values.map(value => `
          <div class="px-6 py-3 bg-gradient-to-r from-${palette.primary}-100 to-${palette.secondary}-100 text-${palette.primary}-800 rounded-full font-semibold border border-${palette.primary}-200">
            ${value}
          </div>
          `).join('')}
        </div>
      </div>
      ` : ''}
      
      ${(eventType === 'anniversary' || eventType === 'graduation') && (content.milestones || content.achievement) ? `
      <div class="text-center p-8 bg-gradient-to-r from-${palette.primary}-50 to-${palette.secondary}-50 rounded-3xl border border-${palette.primary}-100">
        <h2 class="text-3xl font-bold text-gray-800 mb-6">
          ${eventType === 'anniversary' ? 'Наши достижения' : 'Важная веха'}
        </h2>
        <p class="text-xl text-gray-700 leading-relaxed">
          ${content.milestones || content.achievement}
        </p>
      </div>
      ` : ''}
    </div>
  </section>



  <!-- Footer -->
  <footer class="relative py-16 overflow-hidden">
    <!-- Sophisticated Background -->
    <div class="absolute inset-0 bg-gradient-to-br ${palette.heroGradient}"></div>
    <div class="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent"></div>
    
    <!-- Animated Background Elements -->
    <div class="absolute top-0 left-0 w-full h-full">
      <div class="absolute top-4 left-10 w-16 h-16 bg-white/10 rounded-full filter blur-xl animate-float"></div>
      <div class="absolute top-8 right-20 w-12 h-12 bg-white/15 rounded-full filter blur-lg animate-float-delayed"></div>
      <div class="absolute bottom-4 left-1/4 w-20 h-20 bg-white/8 rounded-full filter blur-2xl animate-pulse-soft"></div>
      <div class="absolute bottom-8 right-1/4 w-14 h-14 bg-white/12 rounded-full filter blur-xl animate-bounce-soft"></div>
    </div>
    
    <div class="relative z-10 max-w-6xl mx-auto px-6">
      <!-- Main Footer Content -->
      <div class="text-center mb-12">
        <div class="mb-8">
          <h3 class="font-display text-4xl md:text-5xl font-black text-white mb-4">
            <span class="bg-gradient-to-r from-white via-white to-white/90 bg-clip-text text-transparent">
              ${title}
            </span>
          </h3>
          <div class="w-24 h-1 bg-gradient-to-r from-white/60 to-white/30 mx-auto rounded-full"></div>
        </div>
        
        <!-- Social Links / Call to Action -->
        <div class="flex flex-wrap justify-center gap-6 mb-8">
          <div class="glass-card px-6 py-3 rounded-2xl border border-white/30 group hover:scale-105 transition-all duration-300">
            <span class="text-white/90 group-hover:text-white transition-colors text-lg font-medium">
              📱 Поделиться приглашением
            </span>
          </div>
          
          <div class="glass-card px-6 py-3 rounded-2xl border border-white/30 group hover:scale-105 transition-all duration-300">
            <span class="text-white/90 group-hover:text-white transition-colors text-lg font-medium">
              📅 Добавить в календарь
            </span>
          </div>
          
          <div class="glass-card px-6 py-3 rounded-2xl border border-white/30 group hover:scale-105 transition-all duration-300">
            <span class="text-white/90 group-hover:text-white transition-colors text-lg font-medium">
              🗺️ Маршрут к месту
            </span>
          </div>
        </div>
        
        <!-- Event Summary -->
        ${eventDate && eventTime ? `
        <div class="glass-card rounded-3xl p-8 border border-white/30 mb-8 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent"></div>
          <div class="relative z-10">
            <h4 class="text-2xl font-bold text-white mb-4 font-display">Напоминание</h4>
            <div class="grid md:grid-cols-2 gap-6">
              <div class="text-center">
                <div class="text-white/90 text-lg font-medium mb-2">Дата события</div>
                <div class="text-white text-xl font-bold">${eventDate}</div>
              </div>
              <div class="text-center">
                <div class="text-white/90 text-lg font-medium mb-2">Время начала</div>
                <div class="text-white text-xl font-bold">${eventTime}</div>
              </div>
            </div>
          </div>
        </div>
        ` : ''}
      </div>
      
      <!-- Bottom Section -->
      <div class="border-t border-white/20 pt-8">
        <div class="grid md:grid-cols-3 gap-8 items-center">
          <!-- Copyright -->
          <div class="text-center md:text-left">
            <p class="text-white/80 text-lg">
              © 2024 ${title}
            </p>
          </div>
          
          <!-- Made with Love -->
          <div class="text-center">
            <p class="text-white/90 text-lg font-medium flex items-center justify-center gap-2">
              <span>Создано с</span>
              <span class="text-red-300 animate-pulse text-xl">❤️</span>
              <span>и вдохновением</span>
            </p>
          </div>
          
          <!-- Powered By -->
          <div class="text-center md:text-right">
            <p class="text-white/70 text-sm">
              Powered by FluentAI
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Scroll to Top Button -->
    <div class="absolute bottom-8 right-8">
      <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" 
        class="w-14 h-14 bg-white/20 backdrop-blur-xl border border-white/30 rounded-full flex items-center justify-center text-white hover:bg-white/30 hover:scale-110 transition-all duration-300 group">
        <svg class="w-6 h-6 group-hover:animate-bounce-soft" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18"/>
        </svg>
      </button>
    </div>
  </footer>

  <script>
    // Enhanced form submission with beautiful animations
    function handleSubmit(e) {
      e.preventDefault();
      const form = e.target;
      const button = form.querySelector('button[type="submit"]');
      const originalContent = button.innerHTML;
      
      // Add loading state with spinner
      button.innerHTML = \`
        <span class="flex items-center justify-center gap-3">
          <svg class="animate-spin w-6 h-6" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Отправка...</span>
        </span>
      \`;
      button.disabled = true;
      
      // Simulate form submission
      setTimeout(() => {
        // Success state
        button.innerHTML = \`
          <span class="flex items-center justify-center gap-3">
            <svg class="w-6 h-6 text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <span>Успешно отправлено!</span>
            <span class="text-2xl animate-bounce">🎉</span>
          </span>
        \`;
        button.className = button.className.replace(/from-.*?-600/g, 'from-green-500').replace(/to-.*?-600/g, 'to-green-600');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-8 right-8 glass-card rounded-2xl p-6 border border-green-200 bg-green-50/90 backdrop-blur-xl text-green-800 font-semibold shadow-2xl z-50 transform translate-x-full transition-transform duration-300';
        successMessage.innerHTML = \`
          <div class="flex items-center gap-3">
            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <div class="text-lg font-bold">Спасибо!</div>
              <div class="text-sm">Ваше подтверждение получено</div>
            </div>
          </div>
        \`;
        document.body.appendChild(successMessage);
        
        // Animate in
        setTimeout(() => successMessage.classList.remove('translate-x-full'), 100);
        
        // Remove after delay
        setTimeout(() => {
          successMessage.classList.add('translate-x-full');
          setTimeout(() => successMessage.remove(), 300);
        }, 4000);
        
        // Reset form after delay
        setTimeout(() => {
          button.innerHTML = originalContent;
          button.disabled = false;
          button.className = button.className.replace(/from-green-\d+/g, 'from-${palette.primary}-600').replace(/to-green-\d+/g, 'to-${palette.secondary}-600');
          form.reset();
        }, 3000);
      }, 1500);
    }
    
    // Smooth scroll enhancements
    document.addEventListener('DOMContentLoaded', function() {
      // Add smooth scrolling for internal links
      document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
          e.preventDefault();
          const target = document.querySelector(this.getAttribute('href'));
          if (target) {
            target.scrollIntoView({
              behavior: 'smooth',
              block: 'start'
            });
          }
        });
      });
      
      // Add scroll-based animations
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };
      
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.style.animationPlayState = 'running';
          }
        });
      }, observerOptions);
      
      // Observe all animated elements
      document.querySelectorAll('[class*="animate-"]').forEach(el => {
        el.style.animationPlayState = 'paused';
        observer.observe(el);
      });
      
      // Add parallax effect to floating elements
      window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        const floatingElements = document.querySelectorAll('[class*="animate-float"]');
        
        floatingElements.forEach((el, index) => {
          const speed = 0.5 + (index * 0.1);
          el.style.transform = \`translateY(\${scrollY * speed}px)\`;
        });
      });
      
      // Add mouse move parallax effect
      document.addEventListener('mousemove', (e) => {
        const mouseX = e.clientX / window.innerWidth;
        const mouseY = e.clientY / window.innerHeight;
        
        document.querySelectorAll('.floating-particles').forEach(el => {
          const speed = 20;
          el.style.transform = \`translate(\${mouseX * speed}px, \${mouseY * speed}px)\`;
        });
      });
      
      // Add typing effect for main title
      const heroTitle = document.querySelector('h1');
      if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        let i = 0;
        
        const typeWriter = () => {
          if (i < text.length) {
            heroTitle.textContent += text.charAt(i);
            i++;
            setTimeout(typeWriter, 100);
          }
        };
        
        setTimeout(typeWriter, 1000);
      }
    });
    
    // Add page load animations
    window.addEventListener('load', () => {
      document.body.style.opacity = '0';
      document.body.style.transition = 'opacity 1s ease-in-out';
      
      setTimeout(() => {
        document.body.style.opacity = '1';
      }, 100);
    });
  </script>
</body>
</html>`;
  };

  // Перенаправление если не авторизован
  useEffect(() => {
    if (isInitialized && !user) {
      navigate('/login');
    }
  }, [user, isInitialized, navigate]);

  // Реалистичный прогресс генерации
  // Progress is now handled by real-time WebSocket updates in createSite function

  const steps = editMode === 'edit' 
    ? [
        { id: 'content', title: 'Контент', description: 'Редактирование содержимого', icon: FileText },
        { id: 'design', title: 'Дизайн', description: 'Стиль и цветовая схема', icon: Palette },
        { id: 'advanced', title: 'Настройки', description: 'Продвинутые параметры', icon: Settings },
        { id: 'preview', title: 'Превью', description: 'Предпросмотр и публикация', icon: Eye },
      ]
    : [
        { id: 'type', title: 'Тип события', description: 'Выберите тип вашего мероприятия', icon: Heart },
        { id: 'details', title: 'Детали события', description: 'Расскажите о вашем событии', icon: FileText },
        { id: 'design', title: 'Дизайн', description: 'Выберите стиль и цветовую схему', icon: Palette },
        { id: 'generate', title: 'Генерация', description: 'Создание вашего сайта', icon: Sparkles },
      ];

  const onSubmit = async (data: FormData) => {
    try {
      if (editMode === 'edit' && currentSite) {
        // Update existing site
        await updateSite(data);
      } else {
        // Create new site
        await createSite(data);
      }
    } catch (error) {
      console.error('Ошибка при обработке формы:', error);
      toast.error('Произошла ошибка при сохранении');
    }
  };

  const createSite = async (data: FormData) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Конвертация enum значений в понятные для backend строки
      const convertThemeToDescription = (theme: string): string => {
        const themeMap: Record<string, string> = {
          'modern': 'современный минималистичный стиль с чистыми линиями',
          'classic': 'классический элегантный стиль с традициями',
          'elegant': 'элегантный роскошный стиль с изысканностью',
          'playful': 'игривый яркий стиль с весельем',
          'rustic': 'рустик природный стиль с естественностью',
          'vintage': 'винтажный ретро стиль с ностальгией',
          'luxury': 'роскошный премиальный стиль',
          'minimalist': 'минималистичный чистый стиль',
          'bohemian': 'богемный творческий стиль',
          'casual': 'повседневный легкий стиль'
        };
        return themeMap[theme] || theme;
      };

      const convertColorPreferencesToDescription = (colorPrefs: string): string => {
        const colorMap: Record<string, string> = {
          'romantic_pastels': 'романтичные пастельные тона розовый голубой лавандовый',
          'vibrant_celebration': 'яркие праздничные цвета красный бирюзовый синий',
          'elegant_neutrals': 'элегантные нейтральные бежевый песочный коричневый золотистый',
          'bold_modern': 'смелые современные темно-синий красный оранжевый',
          'nature_inspired': 'природные зеленый оранжевый фиолетовый',
          'classic_black_white': 'классический черно-белый серый'
        };
        return colorMap[colorPrefs] || colorPrefs;
      };

      // Маппинг enum → описательные строки для backend
      const siteRequest = {
        event_type: data.event_type,
        theme: convertThemeToDescription(data.theme),
        content_details: {
          event_title: data.event_title,
          event_date: data.event_date,
          event_time: data.event_time,
          venue_name: data.venue_name,
          venue_address: data.venue_address,
          description: data.description,
          additional_info: data.additional_info,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
        },
        color_preferences: data.color_preferences ? convertColorPreferencesToDescription(data.color_preferences) : null,
        style_preferences: data.style_preferences || null,
        target_audience: data.target_audience || null,
      };

      // Используем новый метод с real-time статусами
      const generatedSite = await apiClient.generateSiteWithStatus(
        siteRequest,
        (status) => {
          // Синхронизируем прогресс-бар с реальными статусами
          setGenerationProgress(status.progress);
          setGenerationStatus(status.message);
          
          console.log(`${status.step}: ${status.message} (${status.progress}%)`);
        }
      );
      
      toast.success('Сайт успешно создан!');
      
      // Переход к dashboard с приглашениями
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);

    } catch (error) {
      console.error('Ошибка генерации сайта:', error);
      toast.error(error instanceof Error ? error.message : 'Ошибка при создании сайта');
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0);
      setGenerationStatus('');
    }
  };

  const updateSite = async (data: FormData) => {
    if (!currentSite) return;
    
    setIsSaving(true);
    
    try {
      const updateData = {
        ...data,
        content_details: {
          event_title: data.event_title,
          event_date: data.event_date,
          event_time: data.event_time,
          venue_name: data.venue_name,
          venue_address: data.venue_address,
          description: data.description,
          additional_info: data.additional_info,
          contact_name: data.contact_name,
          contact_phone: data.contact_phone,
          contact_email: data.contact_email,
        },
        advanced_settings: {
          typography_scale: data.typography_scale,
          animation_intensity: data.animation_intensity,
          section_spacing: data.section_spacing,
          border_radius: data.border_radius,
          enable_animations: data.enable_animations,
          enable_parallax: data.enable_parallax,
          enable_dark_mode: data.enable_dark_mode,
        }
      };
      
      await apiClient.updateSite(currentSite.id, updateData);
      setHasUnsavedChanges(false);
      toast.success('Сайт успешно обновлен!');
      
    } catch (error) {
      console.error('Ошибка обновления сайта:', error);
      toast.error('Ошибка при обновлении сайта');
    } finally {
      setIsSaving(false);
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
    if (editMode === 'edit') return true; // В режиме редактирования можно переходить между шагами
    
    switch (currentStep) {
      case 0: return watchedValues.event_type;
      case 1: return watchedValues.event_title && watchedValues.description;
      case 2: return watchedValues.theme;
      default: return true;
    }
  };

  const publishSite = async () => {
    if (!currentSite) return;
    
    try {
      await apiClient.updateSite(currentSite.id, { is_published: true });
      toast.success('Сайт успешно опубликован!');
      setCurrentSite({ ...currentSite, is_published: true });
    } catch (error) {
      toast.error('Ошибка публикации сайта');
    }
  };

  const previewDevice = (device: PreviewMode) => {
    setPreviewMode(device);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </MainLayout>
    );
  }

  if (!isInitialized || !user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        {/* Header with status and tools */}
        {editMode === 'edit' && (
          <div className="bg-white/80 backdrop-blur-lg border-b border-purple-100 sticky top-16 z-40 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    К панели
                  </Button>
                  
                  <div className="h-6 w-px bg-gray-300" />
                  
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{currentSite?.title}</span>
                    <Badge variant={currentSite?.is_published ? "default" : "secondary"}>
                      {currentSite?.is_published ? "Опубликован" : "Черновик"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {hasUnsavedChanges && (
                    <div className="flex items-center gap-2 text-amber-600">
                      <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                      <span className="text-sm">Несохраненные изменения</span>
                    </div>
                  )}
                  
                  {isSaving && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <LoadingSpinner className="w-4 h-4" />
                      <span className="text-sm">Сохранение...</span>
                    </div>
                  )}

                  <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                    <Button
                      variant={previewMode === 'desktop' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => previewDevice('desktop')}
                      className="px-2 py-1"
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'tablet' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => previewDevice('tablet')}
                      className="px-2 py-1"
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={previewMode === 'mobile' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => previewDevice('mobile')}
                      className="px-2 py-1"
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSubmit(onSubmit)()}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Сохранить
                  </Button>

                  {!currentSite?.is_published ? (
                    <Button
                      onClick={publishSite}
                      className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                    >
                      <Zap className="w-4 h-4" />
                      Опубликовать
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`/sites/${currentSite.id}`, '_blank')}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Просмотр
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          {editMode === 'edit' ? (
            // Edit Mode Layout - Split view with tabs and preview
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-14rem)]">
              {/* Editor Panel */}
              <div className="space-y-6">
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        <Paintbrush className="w-5 h-5" />
                        Редактор сайта
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={livePreview}
                          onCheckedChange={setLivePreview}
                          id="live-preview"
                        />
                        <Label htmlFor="live-preview" className="text-sm">
                          Живой предпросмотр
                        </Label>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="h-full overflow-y-auto">
                    <Tabs value={steps[currentStep].id} onValueChange={(value) => {
                      const stepIndex = steps.findIndex(step => step.id === value);
                      if (stepIndex !== -1) setCurrentStep(stepIndex);
                    }}>
                      <TabsList className="grid grid-cols-4 w-full mb-6">
                        {steps.map((step, index) => {
                          const Icon = step.icon;
                          return (
                            <TabsTrigger 
                              key={step.id} 
                              value={step.id}
                              className="flex items-center gap-2"
                            >
                              <Icon className="w-4 h-4" />
                              <span className="hidden sm:inline">{step.title}</span>
                            </TabsTrigger>
                          );
                        })}
                      </TabsList>

                      {/* Content Tab */}
                      <TabsContent value="content" className="space-y-6">
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="event_title">Название события *</Label>
                            <Input
                              {...register('event_title')}
                              placeholder="Введите название вашего события"
                              className="text-lg font-medium"
                            />
                            {errors.event_title && (
                              <p className="text-sm text-red-600">{errors.event_title.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="event_date">Дата события</Label>
                              <Input
                                {...register('event_date')}
                                type="date"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="event_time">Время</Label>
                              <Input
                                {...register('event_time')}
                                type="time"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="description">Описание события *</Label>
                            <Textarea
                              {...register('description')}
                              placeholder="Расскажите о вашем событии, его особенностях и атмосфере..."
                              rows={4}
                            />
                            {errors.description && (
                              <p className="text-sm text-red-600">{errors.description.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="venue_name">Место проведения</Label>
                              <Input
                                {...register('venue_name')}
                                placeholder="Название места"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="venue_address">Адрес</Label>
                              <Input
                                {...register('venue_address')}
                                placeholder="Полный адрес"
                              />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="additional_info">Дополнительная информация</Label>
                            <Textarea
                              {...register('additional_info')}
                              placeholder="Дресс-код, подарки, парковка и другие важные детали..."
                              rows={3}
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="contact_name">Контактное лицо</Label>
                              <Input
                                {...register('contact_name')}
                                placeholder="Имя"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contact_phone">Телефон</Label>
                              <Input
                                {...register('contact_phone')}
                                placeholder="+7 (999) 123-45-67"
                              />
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="contact_email">Email</Label>
                              <Input
                                {...register('contact_email')}
                                type="email"
                                placeholder="email@example.com"
                              />
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Design Tab */}
                      <TabsContent value="design" className="space-y-6">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Стиль дизайна</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {themes.map((theme) => (
                              <motion.div
                                key={theme.value}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setValue('theme', theme.value)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  watchedValues.theme === theme.value
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-gray-200 hover:border-brand-300'
                                }`}
                              >
                                <div className={`h-16 rounded mb-3 ${theme.preview}`} />
                                <h4 className="font-medium text-gray-900 mb-1">{theme.label}</h4>
                                <p className="text-sm text-gray-600">{theme.description}</p>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-semibold mb-4">Цветовая схема</h3>
                          <div className="grid grid-cols-1 gap-3">
                            {colorSchemes.map((scheme) => (
                              <motion.div
                                key={scheme.value}
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                onClick={() => setValue('color_preferences', scheme.value)}
                                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                                  watchedValues.color_preferences === scheme.value
                                    ? 'border-brand-500 bg-brand-50'
                                    : 'border-gray-200 hover:border-brand-300'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-gray-900">{scheme.label}</h4>
                                  <div className={`h-6 w-24 rounded-full ${scheme.gradient}`} />
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </TabsContent>

                      {/* Advanced Settings Tab */}
                      <TabsContent value="advanced" className="space-y-6">
                        <div className="space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold mb-4">Типографика</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Масштаб шрифта</Label>
                                  <span className="text-sm text-gray-500">{watchedValues.typography_scale}x</span>
                                </div>
                                <Slider
                                  value={[watchedValues.typography_scale || 1]}
                                  onValueChange={(value) => setValue('typography_scale', value[0])}
                                  min={0.8}
                                  max={1.5}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">Анимации</h3>
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label htmlFor="enable_animations">Включить анимации</Label>
                                <Switch
                                  id="enable_animations"
                                  checked={watchedValues.enable_animations}
                                  onCheckedChange={(checked) => setValue('enable_animations', checked)}
                                />
                              </div>

                              {watchedValues.enable_animations && (
                                <div>
                                  <div className="flex justify-between items-center mb-2">
                                    <Label>Интенсивность анимаций</Label>
                                    <span className="text-sm text-gray-500">{Math.round((watchedValues.animation_intensity || 0.7) * 100)}%</span>
                                  </div>
                                  <Slider
                                    value={[watchedValues.animation_intensity || 0.7]}
                                    onValueChange={(value) => setValue('animation_intensity', value[0])}
                                    min={0.1}
                                    max={1}
                                    step={0.1}
                                    className="w-full"
                                  />
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <Label htmlFor="enable_parallax">Parallax эффекты</Label>
                                <Switch
                                  id="enable_parallax"
                                  checked={watchedValues.enable_parallax}
                                  onCheckedChange={(checked) => setValue('enable_parallax', checked)}
                                />
                              </div>
                            </div>
                          </div>

                          <div>
                            <h3 className="text-lg font-semibold mb-4">Дизайн системы</h3>
                            <div className="space-y-4">
                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Отступы между секциями</Label>
                                  <span className="text-sm text-gray-500">{watchedValues.section_spacing}x</span>
                                </div>
                                <Slider
                                  value={[watchedValues.section_spacing || 1]}
                                  onValueChange={(value) => setValue('section_spacing', value[0])}
                                  min={0.5}
                                  max={2}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>

                              <div>
                                <div className="flex justify-between items-center mb-2">
                                  <Label>Скругление углов</Label>
                                  <span className="text-sm text-gray-500">{watchedValues.border_radius}x</span>
                                </div>
                                <Slider
                                  value={[watchedValues.border_radius || 0.5]}
                                  onValueChange={(value) => setValue('border_radius', value[0])}
                                  min={0}
                                  max={2}
                                  step={0.1}
                                  className="w-full"
                                />
                              </div>

                              <div className="flex items-center justify-between">
                                <Label htmlFor="enable_dark_mode">Поддержка темной темы</Label>
                                <Switch
                                  id="enable_dark_mode"
                                  checked={watchedValues.enable_dark_mode}
                                  onCheckedChange={(checked) => setValue('enable_dark_mode', checked)}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      {/* Preview Tab */}
                      <TabsContent value="preview" className="space-y-6">
                        <div className="text-center space-y-4">
                          <h3 className="text-lg font-semibold">Готово к публикации!</h3>
                          <p className="text-gray-600">
                            Ваш сайт готов. Вы можете опубликовать его или продолжить редактирование.
                          </p>
                          
                          <div className="flex justify-center gap-4">
                            {!currentSite?.is_published ? (
                              <Button
                                onClick={publishSite}
                                className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                              >
                                <Zap className="w-4 h-4" />
                                Опубликовать сайт
                              </Button>
                            ) : (
                              <div className="space-y-2">
                                <Badge variant="default" className="bg-green-500">
                                  Сайт опубликован
                                </Badge>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={() => window.open(`/sites/${currentSite.id}`, '_blank')}
                                    className="flex items-center gap-2"
                                  >
                                    <Eye className="w-4 h-4" />
                                    Открыть сайт
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => {
                                      navigator.clipboard.writeText(`${window.location.origin}/sites/${currentSite.id}`);
                                      toast.success('Ссылка скопирована!');
                                    }}
                                    className="flex items-center gap-2"
                                  >
                                    <Share2 className="w-4 h-4" />
                                    Копировать ссылку
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div className="space-y-4">
                <Card className="h-full">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Предпросмотр
                      <Badge variant="outline" className="ml-2">
                        {previewMode === 'desktop' ? 'Десктоп' : 
                         previewMode === 'tablet' ? 'Планшет' : 'Мобильный'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="h-full p-4">
                    {previewHtml ? (
                      <LivePreviewFrame
                        html={previewHtml}
                        mode={previewMode}
                        onModeChange={previewDevice}
                        toolbar={null}
                        className="h-full"
                        minHeight={600}
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <Eye className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Предпросмотр загружается...</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            // Create Mode Layout - Modern step-by-step wizard
            <div className="space-y-8">
              <Card className="max-w-5xl mx-auto shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
                <CardHeader className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 rounded-t-xl">
                  <div className="text-center">
                    <div className="space-y-2">
                      <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                        {steps[currentStep].title}
                      </CardTitle>
                      <p className="text-gray-600">
                        {steps[currentStep].description}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Progress Steps */}
                  <div className="flex items-center justify-center mt-8 px-4">
                    <div className="flex items-center justify-center space-x-2 md:space-x-4 w-full max-w-3xl">
                      {steps.map((step, index) => {
                        const Icon = step.icon;
                        return (
                          <div key={step.id} className="flex items-center justify-center">
                            <div className="flex flex-col items-center space-y-2 text-center">
                              <div className={`
                                flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-105
                                ${index <= currentStep 
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg ring-4 ring-purple-200' 
                                  : 'bg-gray-200 text-gray-400'
                                }
                              `}>
                                {index < currentStep ? (
                                  <motion.div
                                    initial={{ scale: 0, rotate: -180 }}
                                    animate={{ scale: 1, rotate: 0 }}
                                    className="text-white"
                                  >
                                    ✓
                                  </motion.div>
                                ) : index === currentStep ? (
                                  <Icon className="w-5 h-5" />
                                ) : (
                                  <span className="text-sm font-bold">{index + 1}</span>
                                )}
                              </div>
                              <span className={`text-xs font-medium text-center max-w-[80px] leading-tight ${
                                index <= currentStep ? 'text-purple-600' : 'text-gray-400'
                              }`}>
                                {step.title}
                              </span>
                            </div>
                            
                            {index < steps.length - 1 && (
                              <div className={`
                                h-1 w-8 md:w-16 mx-2 md:mx-3 rounded-full transition-all duration-500
                                ${index < currentStep 
                                  ? 'bg-gradient-to-r from-purple-500 to-blue-500' 
                                  : 'bg-gray-200'
                                }
                              `} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardHeader>

                              <CardContent className="min-h-[500px] relative">
                  {/* Full-screen loading overlay */}
                  {isGenerating && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-gradient-to-br from-purple-50/95 to-blue-50/95 backdrop-blur-sm rounded-xl z-50 flex items-center justify-center"
                    >
                      <div className="text-center space-y-6 p-8 w-full max-w-md mx-auto">
                        {/* Animated logo/icon */}
                        <div className="flex justify-center">
                          <div className="relative w-24 h-24">
                            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl animate-pulse"></div>
                            <div className="absolute inset-2 bg-white rounded-xl flex items-center justify-center">
                              <Sparkles className="w-8 h-8 text-purple-500 animate-bounce" />
                            </div>
                          </div>
                        </div>
                        
                        {/* Enhanced loading text */}
                        <div className="space-y-3 text-center">
                          <h3 className="text-2xl font-bold text-gray-800">
                            Создаём ваш сайт
                          </h3>
                          <p className="text-gray-600 mx-auto">
                            Наша ИИ генерирует уникальный дизайн специально для вашего события
                          </p>
                        </div>
                        
                        {/* Advanced progress */}
                        <div className="space-y-4 w-full">
                          <div className="bg-white/80 rounded-full p-1 shadow-inner mx-auto">
                            <div 
                              className="h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transition-all duration-500 ease-out relative overflow-hidden"
                              style={{ width: `${generationProgress}%` }}
                            >
                              <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                            </div>
                          </div>
                          <div className="text-center space-y-2">
                            <p className="text-lg font-semibold text-purple-600">
                              {Math.round(generationProgress)}%
                            </p>
                            {generationStatus && (
                              <p className="text-sm text-gray-600 animate-pulse">
                                {generationStatus}
                              </p>
                            )}
                          </div>
                        </div>
                        
                        {/* Loading steps indicator */}
                        <div className="space-y-3 text-sm text-center">
                          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${
                            generationProgress >= 20 ? 'text-green-600 font-medium' : 
                            generationProgress > 5 ? 'text-purple-600 font-medium animate-pulse' : 'text-gray-400'
                          }`}>
                            {generationProgress >= 20 ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : generationProgress > 5 ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            )}
                            Анализ контента
                          </div>
                          
                          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${
                            generationProgress >= 45 ? 'text-green-600 font-medium' : 
                            generationProgress > 20 ? 'text-purple-600 font-medium animate-pulse' : 'text-gray-400'
                          }`}>
                            {generationProgress >= 45 ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : generationProgress > 20 ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            )}
                            Выбор цветовой схемы
                          </div>
                          
                          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${
                            generationProgress >= 70 ? 'text-green-600 font-medium' : 
                            generationProgress > 45 ? 'text-purple-600 font-medium animate-pulse' : 'text-gray-400'
                          }`}>
                            {generationProgress >= 70 ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : generationProgress > 45 ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            )}
                            Создание макета
                          </div>
                          
                          <div className={`flex items-center justify-center gap-2 transition-all duration-500 ${
                            generationProgress >= 90 ? 'text-green-600 font-medium' : 
                            generationProgress > 70 ? 'text-purple-600 font-medium animate-pulse' : 'text-gray-400'
                          }`}>
                            {generationProgress >= 90 ? (
                              <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-xs">✓</span>
                              </div>
                            ) : generationProgress > 70 ? (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <div className="w-5 h-5 bg-gray-300 rounded-full"></div>
                            )}
                            Финальная оптимизация
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                <AnimatePresence mode="wait">
                  {/* Шаг 1: Тип события */}
                  {currentStep === 0 && (
                    <motion.div
                      key="step-0"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-6"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Выберите тип вашего события</h3>
                        <p className="text-gray-600">Это поможет нам создать идеальный дизайн для вашего мероприятия</p>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {eventTypes.map((type) => (
                          <motion.div
                            key={type.value}
                            whileHover={{ scale: 1.05, y: -5 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setValue('event_type', type.value)}
                            className={`
                              p-8 rounded-2xl border-2 cursor-pointer transition-all text-center relative overflow-hidden group
                              ${watchedValues.event_type === type.value
                                ? 'border-purple-500 bg-gradient-to-br from-purple-50 to-blue-50 shadow-xl ring-4 ring-purple-200' 
                                : 'border-gray-200 hover:border-purple-300 hover:shadow-lg bg-white'
                              }
                            `}
                                                      >
                            <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${type.color} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                              {type.icon}
                            </div>
                            <h4 className="font-bold text-lg text-gray-900 mb-2">{type.label}</h4>
                            {watchedValues.event_type === type.value && (
                              <div className="absolute top-3 right-3">
                                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-sm">✓</span>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 2: Детали события */}
                  {currentStep === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-8"
                    >
                      <div className="text-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">Расскажите о вашем событии</h3>
                        <p className="text-gray-600">Эти детали помогут создать персональный и привлекательный сайт</p>
                      </div>
                      
                      <div className="space-y-3">
                        <Label htmlFor="event_title" className="text-base font-semibold text-gray-700">
                          Название события *
                        </Label>
                        <Input
                          {...register('event_title')}
                          placeholder="Например: 'День рождения Анны' или 'Корпоративная вечеринка 2024'"
                          className="text-lg font-medium h-12 border-2 focus:border-purple-500 focus:ring-purple-200"
                        />
                        {errors.event_title && (
                          <p className="text-sm text-red-600 flex items-center gap-1">
                            <span>⚠️</span>
                            {errors.event_title.message}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <Label htmlFor="event_date" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-purple-500" />
                            Дата события
                          </Label>
                          <Input
                            {...register('event_date')}
                            type="date"
                            className="h-12 border-2 focus:border-purple-500 focus:ring-purple-200 rounded-xl"
                          />
                        </div>

                        <div className="space-y-3">
                          <Label htmlFor="event_time" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-500" />
                            Время
                          </Label>
                          <Input
                            {...register('event_time')}
                            type="time"
                            className="h-12 border-2 focus:border-purple-500 focus:ring-purple-200 rounded-xl"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="venue_name">Место проведения</Label>
                          <Input
                            {...register('venue_name')}
                            placeholder="Название места проведения"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="venue_address">Адрес</Label>
                          <Input
                            {...register('venue_address')}
                            placeholder="Полный адрес места проведения"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">Описание события *</Label>
                        <Textarea
                          {...register('description')}
                          placeholder="Расскажите о вашем событии, его особенностях и атмосфере..."
                          rows={4}
                        />
                        {errors.description && (
                          <p className="text-sm text-red-600">{errors.description.message}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="additional_info">Дополнительная информация</Label>
                        <Textarea
                          {...register('additional_info')}
                          placeholder="Дресс-код, подарки, парковка и другие важные детали..."
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="contact_name">Контактное лицо</Label>
                          <Input
                            {...register('contact_name')}
                            placeholder="Имя"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact_phone">Телефон</Label>
                          <Input
                            {...register('contact_phone')}
                            placeholder="+7 (999) 123-45-67"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="contact_email">Email</Label>
                          <Input
                            {...register('contact_email')}
                            type="email"
                            placeholder="email@example.com"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Шаг 3: Интерактивный Дизайн-Студия */}
                  {currentStep === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="h-[calc(100vh-200px)] flex gap-6"
                    >
                      {/* Левая панель - Контролы дизайна */}
                      <div className="w-1/2 space-y-6 overflow-y-auto pr-4">
                        {/* AI Ассистент Header */}
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl flex items-center justify-center">
                              <Wand2 className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-bold text-gray-900">AI Дизайн-Ассистент</h3>
                              <p className="text-sm text-gray-600">Умные рекомендации стилей</p>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={generateAISuggestions}
                              disabled={isGeneratingAI}
                              className="flex items-center gap-2"
                            >
                              {isGeneratingAI ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                              ) : (
                                <Lightbulb className="w-4 h-4" />
                              )}
                              Новые идеи
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={generateRandomStyle}
                              className="flex items-center gap-2"
                            >
                              <Shuffle className="w-4 h-4" />
                              Случайный
                            </Button>
                          </div>
                        </div>

                        {/* AI Рекомендации */}
                        {aiSuggestions.length > 0 && (
                          <div className="space-y-4">
                            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-purple-500" />
                              Рекомендуемые стили
                            </h4>
                            <div className="space-y-3">
                              {aiSuggestions.map((suggestion) => (
                                <motion.div
                                  key={suggestion.id}
                                  whileHover={{ scale: 1.02 }}
                                  className="bg-white rounded-xl p-4 border border-gray-200 hover:border-purple-300 cursor-pointer transition-all"
                                  onClick={() => applyAISuggestion(suggestion)}
                                >
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h5 className="font-semibold text-gray-900">{suggestion.name}</h5>
                                      <p className="text-sm text-gray-600">{suggestion.description}</p>
                                    </div>
                                    <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                      <Star className="w-3 h-3" />
                                      {suggestion.popularity}%
                                    </div>
                                  </div>
                                  
                                  <div className="flex gap-2 mb-3">
                                    {suggestion.tags.map((tag, index) => (
                                      <Badge key={index} variant="secondary" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  
                                  <p className="text-xs text-gray-500 italic">"{suggestion.aiReason}"</p>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Вкладки кастомизации дизайна */}
                        <Tabs defaultValue="colors" className="w-full">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="colors">
                              <Palette className="w-4 h-4" />
                            </TabsTrigger>
                            <TabsTrigger value="typography">
                              <Type className="w-4 h-4" />
                            </TabsTrigger>
                            <TabsTrigger value="layout">
                              <Layout className="w-4 h-4" />
                            </TabsTrigger>
                            <TabsTrigger value="effects">
                              <Sparkles className="w-4 h-4" />
                            </TabsTrigger>
                          </TabsList>

                          {/* Вкладка Цвета */}
                          <TabsContent value="colors" className="space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                              {Object.entries(designCustomization.colorPalette).map(([key, color]) => (
                                <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                  <Label className="capitalize font-medium">
                                    {key === 'primary' ? 'Основной' : 
                                     key === 'secondary' ? 'Вторичный' :
                                     key === 'accent' ? 'Акцент' :
                                     key === 'background' ? 'Фон' : 'Текст'}
                                  </Label>
                                  <div className="flex items-center gap-2">
                                    <div 
                                      className="w-8 h-8 rounded-lg border-2 border-white shadow-sm cursor-pointer"
                                      style={{ backgroundColor: color }}
                                      onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'color';
                                        input.value = color;
                                        input.onchange = (e) => {
                                          const newColor = (e.target as HTMLInputElement).value;
                                          setDesignCustomization(prev => ({
                                            ...prev,
                                            colorPalette: {
                                              ...prev.colorPalette,
                                              [key]: newColor
                                            }
                                          }));
                                        };
                                        input.click();
                                      }}
                                    />
                                    <span className="text-xs font-mono text-gray-500">{color}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          {/* Вкладка Типографика */}
                          <TabsContent value="typography" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label>Размер шрифта</Label>
                                <Slider
                                  value={[designCustomization.typography.fontSize]}
                                  onValueChange={([value]) => 
                                    setDesignCustomization(prev => ({
                                      ...prev,
                                      typography: { ...prev.typography, fontSize: value }
                                    }))
                                  }
                                  min={12}
                                  max={24}
                                  step={1}
                                  className="mt-2"
                                />
                                <span className="text-sm text-gray-500">{designCustomization.typography.fontSize}px</span>
                              </div>
                              
                              <div>
                                <Label>Высота строки</Label>
                                <Slider
                                  value={[designCustomization.typography.lineHeight]}
                                  onValueChange={([value]) => 
                                    setDesignCustomization(prev => ({
                                      ...prev,
                                      typography: { ...prev.typography, lineHeight: value }
                                    }))
                                  }
                                  min={1.2}
                                  max={2.0}
                                  step={0.1}
                                  className="mt-2"
                                />
                                <span className="text-sm text-gray-500">{designCustomization.typography.lineHeight}</span>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Вкладка Макет */}
                          <TabsContent value="layout" className="space-y-4">
                            <div className="space-y-4">
                              <div>
                                <Label>Отступы</Label>
                                <Slider
                                  value={[designCustomization.layout.spacing]}
                                  onValueChange={([value]) => 
                                    setDesignCustomization(prev => ({
                                      ...prev,
                                      layout: { ...prev.layout, spacing: value }
                                    }))
                                  }
                                  min={16}
                                  max={64}
                                  step={4}
                                  className="mt-2"
                                />
                                <span className="text-sm text-gray-500">{designCustomization.layout.spacing}px</span>
                              </div>
                              
                              <div>
                                <Label>Скругление углов</Label>
                                <Slider
                                  value={[designCustomization.layout.borderRadius]}
                                  onValueChange={([value]) => 
                                    setDesignCustomization(prev => ({
                                      ...prev,
                                      layout: { ...prev.layout, borderRadius: value }
                                    }))
                                  }
                                  min={0}
                                  max={32}
                                  step={2}
                                  className="mt-2"
                                />
                                <span className="text-sm text-gray-500">{designCustomization.layout.borderRadius}px</span>
                              </div>
                            </div>
                          </TabsContent>

                          {/* Вкладка Эффекты */}
                          <TabsContent value="effects" className="space-y-4">
                            <div className="space-y-4">
                              <div className="flex items-center justify-between">
                                <Label>Анимации</Label>
                                <Switch
                                  checked={designCustomization.animations.enabled}
                                  onCheckedChange={(enabled) =>
                                    setDesignCustomization(prev => ({
                                      ...prev,
                                      animations: { ...prev.animations, enabled }
                                    }))
                                  }
                                />
                              </div>
                              
                              {designCustomization.animations.enabled && (
                                <div>
                                  <Label>Скорость анимаций</Label>
                                  <Slider
                                    value={[designCustomization.animations.speed]}
                                    onValueChange={([value]) => 
                                      setDesignCustomization(prev => ({
                                        ...prev,
                                        animations: { ...prev.animations, speed: value }
                                      }))
                                    }
                                    min={0.3}
                                    max={2.0}
                                    step={0.1}
                                    className="mt-2"
                                  />
                                  <span className="text-sm text-gray-500">{designCustomization.animations.speed}x</span>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                        </Tabs>

                        {/* Базовые опции */}
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="style_preferences">Дополнительные пожелания по стилю</Label>
                            <Textarea
                              {...register('style_preferences')}
                              placeholder="Любые особые пожелания к дизайну и стилю сайта..."
                              rows={3}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="target_audience">Целевая аудитория</Label>
                            <Select
                              onValueChange={(value) => setValue('target_audience', value)}
                              defaultValue={watchedValues.target_audience}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Выберите аудиторию" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="family_friends">Семья и друзья</SelectItem>
                                <SelectItem value="colleagues">Коллеги</SelectItem>
                                <SelectItem value="young_adults">Молодёжь</SelectItem>
                                <SelectItem value="adults">Взрослые</SelectItem>
                                <SelectItem value="seniors">Старшее поколение</SelectItem>
                                <SelectItem value="mixed">Смешанная аудитория</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Правая панель - Живой превью */}
                      <div className="w-1/2 bg-gray-50 rounded-2xl p-6 flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            Живой превью
                          </h4>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Monitor className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Tablet className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Smartphone className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* Содержимое живого превью */}
                        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
                          <div className="h-full flex flex-col">
                            {/* Заголовок */}
                            <div 
                              className="p-6 text-white"
                              style={{ 
                                backgroundColor: designCustomization.colorPalette.primary,
                                borderRadius: `${designCustomization.layout.borderRadius}px ${designCustomization.layout.borderRadius}px 0 0`
                              }}
                            >
                              <h1 
                                className="text-2xl font-bold mb-2"
                                style={{ 
                                  fontSize: `${designCustomization.typography.fontSize * 1.5}px`,
                                  lineHeight: designCustomization.typography.lineHeight,
                                  color: designCustomization.colorPalette.text === '#1F2937' ? '#FFFFFF' : designCustomization.colorPalette.text
                                }}
                              >
                                {watchedValues.event_title || 'Ваше событие'}
                              </h1>
                              <p 
                                className="opacity-90"
                                style={{ 
                                  fontSize: `${designCustomization.typography.fontSize}px`,
                                  lineHeight: designCustomization.typography.lineHeight
                                }}
                              >
                                {watchedValues.description || 'Описание вашего события'}
                              </p>
                              <button
                                className="mt-4 px-6 py-2 rounded-lg font-medium"
                                style={{
                                  backgroundColor: designCustomization.colorPalette.accent,
                                  borderRadius: `${designCustomization.layout.borderRadius}px`,
                                  color: '#FFFFFF'
                                }}
                              >
                                Принять участие
                              </button>
                            </div>
                            
                            {/* Контент */}
                            <div 
                              className="flex-1 p-6"
                              style={{ 
                                backgroundColor: designCustomization.colorPalette.background,
                                color: designCustomization.colorPalette.text,
                                padding: `${designCustomization.layout.spacing}px`
                              }}
                            >
                              <div className="space-y-6">
                                <div>
                                  <h3 
                                    className="font-semibold mb-2"
                                    style={{ 
                                      fontSize: `${designCustomization.typography.fontSize * 1.25}px`,
                                      color: designCustomization.colorPalette.primary
                                    }}
                                  >
                                    О событии
                                  </h3>
                                  <p 
                                    style={{ 
                                      fontSize: `${designCustomization.typography.fontSize}px`,
                                      lineHeight: designCustomization.typography.lineHeight
                                    }}
                                  >
                                    {watchedValues.description || 'Подробности о вашем событии будут отображены здесь.'}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div 
                                    className="p-4 rounded-lg"
                                    style={{ 
                                      backgroundColor: designCustomization.colorPalette.secondary + '20',
                                      borderRadius: `${designCustomization.layout.borderRadius}px`
                                    }}
                                  >
                                    <h4 
                                      className="font-medium mb-1"
                                      style={{ color: designCustomization.colorPalette.secondary }}
                                    >
                                      Дата
                                    </h4>
                                    <p className="text-sm">
                                      {watchedValues.event_date || 'Дата события'}
                                    </p>
                                  </div>
                                  <div 
                                    className="p-4 rounded-lg"
                                    style={{ 
                                      backgroundColor: designCustomization.colorPalette.accent + '20',
                                      borderRadius: `${designCustomization.layout.borderRadius}px`
                                    }}
                                  >
                                    <h4 
                                      className="font-medium mb-1"
                                      style={{ color: designCustomization.colorPalette.accent }}
                                    >
                                      Время
                                    </h4>
                                    <p className="text-sm">
                                      {watchedValues.event_time || 'Время события'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>

              {/* Навигация */}
              <div className="p-8 border-t bg-gray-50/80 rounded-b-xl">
                <div className="grid grid-cols-3 items-center gap-4">
                  <div className="flex justify-start">
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                      className={`flex items-center gap-2 h-12 px-6 border-2 transition-all duration-300 ${
                        currentStep === 0 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:border-purple-300 hover:bg-purple-50'
                      }`}
                    >
                      <ArrowLeft className="w-5 h-5" />
                      Назад
                    </Button>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-purple-200">
                      <span className="text-sm font-medium text-gray-700">
                        Шаг {currentStep + 1} из {steps.length}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button
                      onClick={nextStep}
                      disabled={!canProceed()}
                      className={`flex items-center gap-2 h-12 px-8 bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600 transform transition-all duration-300 shadow-lg ${
                        canProceed() ? 'hover:scale-105 hover:shadow-xl' : 'opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {currentStep === steps.length - 1 ? (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Создать сайт
                        </>
                      ) : (
                        <>
                          Далее
                          <ArrowRight className="w-5 h-5" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
              </Card>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default Builder;
