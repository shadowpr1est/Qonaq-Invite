import { useState, useEffect } from 'react';
import { Plus, Play, Sparkles, ArrowRight, Star, Users, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

// Mock components and hooks for demo
const Button = ({ children, className = '', size = 'md', variant = 'default', onClick, ...props }) => {
  const sizeClasses = {
    lg: 'px-8 py-6 text-lg',
    md: 'px-6 py-3 text-base'
  };
  
  const variantClasses = {
    default: 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white',
    outline: 'border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 bg-white'
  };
  
  return (
    <button 
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

const Container = ({ children, className = '' }) => (
  <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ${className}`}>
    {children}
  </div>
);

import { useAuth } from '@/hooks/use-auth';

export default function Hero() {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const { user, isInitialized } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  // Get localized templates
  const localizedTemplates = [
    {
      title: t('hero.phone_templates.0.title'),
      color: 'from-pink-500 via-rose-500 to-purple-600',
      emoji: t('hero.phone_templates.0.emoji'),
      description: t('hero.phone_templates.0.description'),
      accent: 'rose'
    },
    {
      title: t('hero.phone_templates.1.title'),
      color: 'from-blue-500 via-cyan-500 to-indigo-600',
      emoji: t('hero.phone_templates.1.emoji'),
      description: t('hero.phone_templates.1.description'),
      accent: 'blue'
    },
    {
      title: t('hero.phone_templates.2.title'),
      color: 'from-green-500 via-emerald-500 to-teal-600',
      emoji: t('hero.phone_templates.2.emoji'),
      description: t('hero.phone_templates.2.description'),
      accent: 'green'
    }
  ];

  useEffect(() => {
    setIsVisible(true);
    const interval = setInterval(() => {
      setCurrentTemplate((prev) => (prev + 1) % localizedTemplates.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [localizedTemplates.length]);

  const handlePrimaryAction = () => {
    console.log('Hero primary action:', { 
      user: !!user, 
      userEmail: user?.email,
      hasLocalToken: typeof window !== 'undefined' && !!localStorage.getItem('access_token'),
      localTokenLength: typeof window !== 'undefined' ? localStorage.getItem('access_token')?.length || 0 : 0
    });
    if (user) {
      console.log('Navigating to builder as authenticated user');
      navigate('/builder');
    } else {
      console.log('Navigating to signup as unauthenticated user');
      navigate('/signup');
    }
  };

  const handleSecondaryAction = () => {
    if (user) {
      const templatesSection = document.getElementById('templates');
      if (templatesSection) {
        templatesSection.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      console.log('Open video demo');
    }
  };

  const primaryButtonText = user ? t('header.create_invitation') : t('hero.cta.try_free');
  const secondaryButtonText = user ? t('header.templates') : t('hero.cta.video_demo');
  const heroTitle = user 
    ? t('hero.phone_ui.welcome_message', { name: user.name.split(' ')[0] })
    : t('hero.title').split(' ')[0];
  const heroSubtitle = user
    ? t('header.create_invitation')
    : t('hero.title').split(' ').slice(1).join(' ');

  return (
    <section className="min-h-screen flex items-center justify-center py-16 pt-24 bg-gradient-to-br from-slate-50 via-white to-blue-50/50 overflow-hidden relative">
      {/* Floating background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-purple-200/30 to-pink-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-blue-200/30 to-cyan-200/30 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-indigo-200/20 to-purple-200/20 rounded-full blur-2xl animate-pulse delay-2000"></div>
      </div>

      <Container>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
          {/* Left Column - Content */}
          <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Заголовок с улучшенной типографикой */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200/50 px-4 py-2 rounded-full text-sm font-medium text-indigo-700">
                <Sparkles className="w-4 h-4" />
                <span>{t('hero.new_way')}</span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight">
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient">
                  {heroTitle}
                </span>
                {!user && (
                  <>
                    <br />
                    <span className="text-slate-900">{heroSubtitle}</span>
                  </>
                )}
                {user && (
                  <>
                    <br />
                    <span className="text-slate-900 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl">
                      {heroSubtitle}
                    </span>
                  </>
                )}
              </h1>
            </div>
            
            {/* Описание с улучшенной читаемостью */}
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl">
              {user ? (
                t('hero.description')
              ) : (
                t('hero.description')
              )}
            </p>

            {/* Преимущества */}
            {!user && (
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <Clock className="w-4 h-4 text-green-600" />
                  </div>
                  <span>{t('hero.features.fast')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <span>{t('hero.features.guests')}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <span>{t('hero.features.no_designer')}</span>
                </div>
              </div>
            )}

            {/* CTA кнопки с улучшенным дизайном */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold px-8 py-6 text-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-1"
                onClick={handlePrimaryAction}
              >
                {user && <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />}
                {primaryButtonText}
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="group font-semibold px-8 py-6 text-lg border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 hover:text-slate-900 transition-all duration-300 backdrop-blur-sm"
                onClick={handleSecondaryAction}
              >
                {!user && <Play className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-300" />}
                {secondaryButtonText}
              </Button>
            </div>

            {/* Персонализированная статистика для авторизованных */}
            {user && (
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500 bg-white/60 backdrop-blur-sm rounded-2xl p-4 border border-slate-200/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{t('hero.user_stats.active_invitations')}: 3</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>{t('hero.user_stats.total_created')}: 12</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>{t('hero.user_stats.total_views')}: 1,240</span>
                </div>
              </div>
            )}

            {/* Социальное доказательство */}
            {!user && (
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex -space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-cyan-500 rounded-full border-2 border-white"></div>
                  <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-teal-500 rounded-full border-2 border-white"></div>
                </div>
                <span>{t('hero.stats')}</span>
              </div>
            )}
          </div>

          {/* Right Column - Phone Mockup */}
          <div className={`relative transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="relative mx-auto w-72 sm:w-80 h-[600px] bg-slate-900 rounded-[3rem] p-2 shadow-2xl hover:shadow-3xl transition-shadow duration-500">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                {/* Phone Screen Content */}
                <div className="absolute inset-0 flex items-center justify-center p-8">
                  <div className={`w-full h-full bg-gradient-to-br ${localizedTemplates[currentTemplate].color} rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden transition-all duration-1000 transform hover:scale-105`}>
                    <div className="text-5xl sm:text-6xl mb-4 animate-bounce">
                      {localizedTemplates[currentTemplate].emoji}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 text-center">
                      {localizedTemplates[currentTemplate].title}
                    </h3>
                    <p className="text-white/90 text-center px-4 mb-2 text-sm opacity-80">
                      {localizedTemplates[currentTemplate].description}
                    </p>
                    <p className="text-white/80 text-center px-4 mb-6 text-sm sm:text-base leading-relaxed">
                      {t('hero.phone_ui.invitation_text')}
                    </p>
                    <Button 
                      className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30 transition-all duration-300 transform hover:scale-105"
                      onClick={() => console.log('Подробнее clicked')}
                    >
                      {t('hero.phone_ui.details_button')}
                    </Button>

                    {/* Enhanced decorative elements */}
                    <div className="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl animate-pulse"></div>
                    <div className="absolute bottom-8 left-4 w-16 h-16 bg-white/10 rounded-full blur-lg animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-8 w-12 h-12 bg-white/5 rounded-full blur-md animate-pulse delay-2000"></div>
                    
                    {/* Floating particles */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-20 left-10 w-2 h-2 bg-white/30 rounded-full animate-ping"></div>
                      <div className="absolute bottom-20 right-10 w-1 h-1 bg-white/40 rounded-full animate-ping delay-1000"></div>
                      <div className="absolute top-32 right-16 w-1.5 h-1.5 bg-white/25 rounded-full animate-ping delay-2000"></div>
                    </div>
                  </div>
                </div>

                {/* Phone UI Elements */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-slate-900 rounded-full"></div>
                <div className="absolute top-4 right-4 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Enhanced template indicators */}
            <div className="flex justify-center mt-8 space-x-3">
              {localizedTemplates.map((template, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTemplate(index)}
                  className={`transition-all duration-500 rounded-full ${
                    index === currentTemplate 
                      ? 'bg-gradient-to-r from-indigo-500 to-purple-600 w-8 h-3 shadow-lg' 
                      : 'bg-slate-300 hover:bg-slate-400 w-3 h-3'
                  }`}
                />
              ))}
            </div>

            {/* Template info */}
            <div className="text-center mt-4">
              <p className="text-sm text-slate-500">
                {localizedTemplates[currentTemplate].title}{t('hero.phone_ui.template_info_separator')}{localizedTemplates[currentTemplate].description}
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}