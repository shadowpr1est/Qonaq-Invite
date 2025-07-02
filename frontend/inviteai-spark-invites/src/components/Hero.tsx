import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { Plus, Play } from 'lucide-react';

const templates = [
  {
    title: 'Свадьба',
    color: 'from-pink-500 to-purple-600',
    emoji: '💕'
  },
  {
    title: 'День рождения',
    color: 'from-blue-500 to-indigo-600',
    emoji: '🎂'
  },
  {
    title: 'Корпоратив',
    color: 'from-green-500 to-teal-600',
    emoji: '🎉'
  }
];



const Hero = () => {
  const [currentTemplate, setCurrentTemplate] = useState(0);
  const { user, isInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTemplate((prev) => (prev + 1) % templates.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePrimaryAction = () => {
    if (user) {
      navigate('/builder');
    } else {
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

  const primaryButtonText = user ? 'Создать приглашение' : 'Попробовать бесплатно';
  const secondaryButtonText = user ? 'Посмотреть шаблоны' : 'Видео-демо';
  const heroTitle = user 
    ? `Привет, ${user.name.split(' ')[0]}!` 
    : 'Создайте';
  const heroSubtitle = user
    ? 'Готовы создать новое приглашение?'
    : 'приглашение за минуту';

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-16 pt-24 bg-gradient-to-br from-brand-50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column */}
        <div className="animate-fade-up">
          <h1 className="text-5xl lg:text-7xl font-bold font-display mb-6">
            <span className="text-gradient">{heroTitle}</span>
            {!user && <br />}
            {!user && heroSubtitle}
            {user && (
              <>
                <br />
                <span className="text-foreground text-4xl lg:text-5xl">
                  {heroSubtitle}
                </span>
              </>
            )}
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-lg leading-relaxed">
            {user ? (
              'Выберите шаблон и создайте красивое веб-приглашение с QR-ссылкой за несколько минут.'
            ) : (
              'Платформа, где ваши гости получают красивый веб-сайт-приглашение с QR-ссылкой — без дизайнеров и PDF-хаоса.'
            )}
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              size="lg" 
              className="ripple-effect bg-gradient-brand hover:opacity-90 text-white font-semibold px-8 py-6 text-lg"
              onClick={handlePrimaryAction}
            >
              {user && <Plus className="w-5 h-5 mr-2" />}
              {primaryButtonText}
            </Button>
            <Button 
              variant="ghost" 
              size="lg"
              className="font-semibold px-8 py-6 text-lg hover:bg-brand-100"
              onClick={handleSecondaryAction}
            >
              {!user && <Play className="w-5 h-5 mr-2" />}
              {secondaryButtonText}
            </Button>
          </div>

          {/* Персонализированная статистика для авторизованных */}
          {user && (
            <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Активные приглашения: 3</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Всего создано: 12</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Phone Mockup */}
        <div className="relative animate-fade-up cursor-tilt">
          <div className="relative mx-auto w-80 h-[600px] bg-gray-900 rounded-[3rem] p-2 shadow-2xl">
            <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
              {/* Phone Screen Content */}
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className={`w-full h-full bg-gradient-to-br ${templates[currentTemplate].color} rounded-2xl flex flex-col items-center justify-center text-white relative overflow-hidden animate-phone-reveal`}>
                  <div className="text-6xl mb-4 animate-float">
                    {templates[currentTemplate].emoji}
                  </div>
                  <h3 className="text-2xl font-bold mb-2">
                    {templates[currentTemplate].title}
                  </h3>
                  <p className="text-white/80 text-center px-4 mb-6">
                    Вы приглашены на особое событие
                  </p>
                  <Button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white border-white/30">
                    Подробнее
                  </Button>

                  {/* Decorative elements */}
                  <div className="absolute top-4 right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
                  <div className="absolute bottom-8 left-4 w-12 h-12 bg-white/10 rounded-full blur-lg"></div>
                </div>
              </div>

              {/* Phone UI Elements */}
              <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-gray-900 rounded-full"></div>
            </div>
          </div>

          {/* Template indicators */}
          <div className="flex justify-center mt-6 space-x-2">
            {templates.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  index === currentTemplate ? 'bg-brand-500 w-6' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
