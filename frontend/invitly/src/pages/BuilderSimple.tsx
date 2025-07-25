import React, { useState } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ArrowLeft,
  ArrowRight,
  Palette,
  Calendar,
  Users,
  Heart,
  Star,
  Gift,
  Home,
  Briefcase,
  GraduationCap,
  Eye,
  Sparkles,
  Zap,
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// Упрощенная схема валидации
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
  target_audience: z.string().optional(),
});

type FormData = z.infer<typeof siteFormSchema>;

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

const colorSchemes: Array<{ value: ColorScheme; label: string; gradient: string }> = [
  { value: 'romantic_pastels', label: 'Романтичные пастели', gradient: 'bg-gradient-to-r from-pink-200 via-purple-200 to-indigo-200' },
  { value: 'vibrant_celebration', label: 'Яркое торжество', gradient: 'bg-gradient-to-r from-red-400 via-teal-400 to-blue-500' },
  { value: 'elegant_neutrals', label: 'Элегантные нейтральные', gradient: 'bg-gradient-to-r from-amber-100 via-amber-200 to-amber-300' },
  { value: 'bold_modern', label: 'Смелый современный', gradient: 'bg-gradient-to-r from-slate-600 via-red-500 to-orange-500' },
  { value: 'nature_inspired', label: 'Природные', gradient: 'bg-gradient-to-r from-green-500 via-orange-500 to-purple-600' },
  { value: 'classic_black_white', label: 'Классический ч/б', gradient: 'bg-gradient-to-r from-black via-gray-500 to-white' },
];

const steps = [
  { id: 'event', title: 'Событие', description: 'Выберите тип события', icon: Calendar },
  { id: 'content', title: 'Контент', description: 'Заполните детали', icon: Users },
  { id: 'design', title: 'Дизайн', description: 'Выберите стиль', icon: Palette },
];

const BuilderSimple = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(siteFormSchema),
    defaultValues: {
      event_type: '',
      theme: '',
      event_title: '',
      description: '',
      color_preferences: '',
      target_audience: 'family_friends',
    }
  });

  const watchedValues = watch();

  const onSubmit = async (data: FormData) => {
    await createSite(data);
  };

  const createSite = async (data: FormData) => {
    setIsGenerating(true);
    setGenerationProgress(0);

    try {
      // Подготовка данных для API
      const siteRequest = {
        event_type: data.event_type,
        theme: data.theme, // Отправляем enum значение
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
        color_preferences: data.color_preferences || null,
        style_preferences: null,
        target_audience: data.target_audience || null,
      };

      console.log('Отправляем данные в backend:', siteRequest);

      // Используем метод с real-time статусами
      const generatedSite = await apiClient.generateSiteWithStatus(
        siteRequest,
        (status) => {
          setGenerationProgress(status.progress);
          setGenerationStatus(status.message);
          console.log(`${status.step}: ${status.message} (${status.progress}%)`);
        }
      );
      
      toast.success('Сайт успешно создан!');
      
      // Переход к dashboard
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
      case 1: return watchedValues.event_title && watchedValues.description;
      case 2: return watchedValues.theme;
      default: return true;
    }
  };

  if (!user) {
    return null;
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8">
          <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-purple-50/80 via-blue-50/80 to-indigo-50/80 rounded-t-xl pb-4">
              <div className="text-center">
                <div className="space-y-1">
                  <CardTitle className="text-2xl md:text-3xl font-bold text-gray-800">
                    {steps[currentStep].title}
                  </CardTitle>
                  <p className="text-gray-600">
                    {steps[currentStep].description}
                  </p>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-center mt-4 px-4">
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
              {/* Loading overlay */}
              {isGenerating && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 bg-gradient-to-br from-purple-50/95 to-blue-50/95 backdrop-blur-sm z-50 flex items-center justify-center"
                >
                  <div className="text-center space-y-8 p-8 w-full max-w-md mx-auto">
                    {/* Beautiful loading spinner */}
                    <div className="flex justify-center">
                      <LoadingSpinner 
                        size="xl" 
                        variant="gradient"
                        className="scale-125"
                      />
                    </div>
                    
                    <div className="space-y-4 text-center">
                      <motion.h3 
                        className="text-3xl font-bold text-gray-800"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        Создаём ваше приглашение
                      </motion.h3>
                      <p className="text-gray-600 text-lg">
                        Подождите, мы создаём что-то особенное для вас...
                      </p>
                    </div>
                    
                    <div className="space-y-4 w-full">
                      <div className="bg-white/90 rounded-2xl p-2 shadow-lg">
                        <div 
                          className="h-4 bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-xl transition-all duration-700 ease-out relative overflow-hidden"
                          style={{ width: `${generationProgress}%` }}
                        >
                          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-xl"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer"></div>
                        </div>
                      </div>
                      <div className="text-center space-y-2">
                        <motion.p 
                          className="text-2xl font-bold text-purple-600"
                          animate={{ scale: [1, 1.05, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {Math.round(generationProgress)}%
                        </motion.p>
                        {generationStatus && (
                          <motion.p 
                            className="text-base text-gray-700 font-medium"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            key={generationStatus}
                          >
                            {generationStatus}
                          </motion.p>
                        )}
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
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Расскажите о вашем событии</h3>
                      <p className="text-gray-600">Заполните основную информацию для создания приглашения</p>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div className="space-y-6">
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

                      {/* Превью */}
                      <div className="bg-gray-50 rounded-2xl p-6 flex flex-col">
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          Предпросмотр
                        </h4>
                        
                        <div className="flex-1 bg-white rounded-xl shadow-sm border overflow-hidden">
                          <div className="h-full flex flex-col">
                            <div className="p-6 bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                              <h1 className="text-2xl font-bold mb-2">
                                {watchedValues.event_title || 'Ваше событие'}
                              </h1>
                              <p className="opacity-90">
                                {watchedValues.description || 'Описание вашего события'}
                              </p>
                              <button className="mt-4 px-6 py-2 bg-white text-purple-600 rounded-lg font-medium">
                                Принять участие
                              </button>
                            </div>
                            
                            <div className="flex-1 p-6">
                              <div className="space-y-6">
                                <div>
                                  <h3 className="font-semibold mb-2 text-purple-600">
                                    О событии
                                  </h3>
                                  <p className="text-gray-700">
                                    {watchedValues.description || 'Подробности о вашем событии будут отображены здесь.'}
                                  </p>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-4 bg-purple-50 rounded-lg">
                                    <h4 className="font-medium mb-1 text-purple-600">
                                      Дата
                                    </h4>
                                    <p className="text-sm">
                                      {watchedValues.event_date || 'Дата события'}
                                    </p>
                                  </div>
                                  <div className="p-4 bg-blue-50 rounded-lg">
                                    <h4 className="font-medium mb-1 text-blue-600">
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
                    </div>
                  </motion.div>
                )}

                {/* Шаг 3: Дизайн */}
                {currentStep === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold text-gray-800 mb-2">Выберите стиль дизайна</h3>
                      <p className="text-gray-600">Подберите тему и цветовую схему для вашего приглашения</p>
                    </div>

                    <div className="space-y-8">
                      {/* Стили */}
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Стиль дизайна</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {themes.map((theme) => (
                            <motion.div
                              key={theme.value}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setValue('theme', theme.value)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                                watchedValues.theme === theme.value
                                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className={`h-16 rounded mb-3 ${theme.preview}`} />
                              <h5 className="font-medium text-gray-900 mb-1">{theme.label}</h5>
                              <p className="text-sm text-gray-600">{theme.description}</p>
                              {watchedValues.theme === theme.value && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      {/* Цветовые схемы */}
                      <div>
                        <h4 className="text-lg font-semibold mb-4">Цветовая схема</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {colorSchemes.map((scheme) => (
                            <motion.div
                              key={scheme.value}
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              onClick={() => setValue('color_preferences', scheme.value)}
                              className={`p-4 rounded-lg border-2 cursor-pointer transition-all relative ${
                                watchedValues.color_preferences === scheme.value
                                  ? 'border-purple-500 bg-purple-50 shadow-lg'
                                  : 'border-gray-200 hover:border-purple-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <h5 className="font-medium text-gray-900">{scheme.label}</h5>
                                <div className={`h-6 w-24 rounded-full ${scheme.gradient}`} />
                              </div>
                              {watchedValues.color_preferences === scheme.value && (
                                <div className="absolute top-2 right-2">
                                  <div className="w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                </div>
                              )}
                            </motion.div>
                          ))}
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
                    className={`flex items-center gap-2 h-12 px-6 transition-all duration-300 ${
                      !canProceed()
                        ? 'opacity-50 cursor-not-allowed bg-gray-400'
                        : 'bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg'
                    }`}
                  >
                    {currentStep === steps.length - 1 ? (
                      <>
                        <Zap className="w-5 h-5" />
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
      </div>
    </MainLayout>
  );
};

export default BuilderSimple; 