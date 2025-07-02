
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

const Footer = () => {
  const [scrollY, setScrollY] = useState(0);
  const [language, setLanguage] = useState('RU');

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <footer className="min-h-[40vh] bg-gradient-to-br from-brand-900 via-brand-800 to-blue-900 text-white relative overflow-hidden">
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-4 gap-12 mb-12">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-white to-brand-200 rounded-xl flex items-center justify-center">
                <span className="text-2xl font-bold text-brand-600">AI</span>
              </div>
              <h3 className="text-2xl font-bold">InviteAI</h3>
            </div>
            <p className="text-white/80 mb-6 max-w-md">
              Создавайте красивые цифровые приглашения за минуту. 
              Простой конструктор с готовыми шаблонами для любого события.
            </p>
            <div className="flex gap-4">
              <Button 
                variant="outline" 
                size="sm"
                className="text-black border-white/30 hover:bg-white/10 hover:text-white"
              >
                Telegram
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-black border-white/30 hover:bg-white/10 hover:text-white"
              >
                Instagram
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                className="text-black border-white/30 hover:bg-white/10 hover:text-white"
              >
                WhatsApp
              </Button>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="font-bold mb-4">Продукт</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="/builder" className="hover:text-white transition-colors">Конструктор</a></li>
              <li><a href="/pricing" className="hover:text-white transition-colors">Цены</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Шаблоны</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Поддержка</h4>
            <ul className="space-y-2 text-white/80">
              <li><a href="/blog" className="hover:text-white transition-colors">Блог</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Помощь</a></li>
              <li><a href="/legal" className="hover:text-white transition-colors">Условия</a></li>
              <li><a href="/legal" className="hover:text-white transition-colors">Конфиденциальность</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-white/60 text-sm">
            © 2024 InviteAI. Все права защищены.
          </p>
          
          {/* Language Switcher */}
          <div className="flex bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setLanguage('RU')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                language === 'RU' 
                  ? 'bg-white text-brand-600 font-semibold' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              RU
            </button>
            <button
              onClick={() => setLanguage('KZ')}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                language === 'KZ' 
                  ? 'bg-white text-brand-600 font-semibold' 
                  : 'text-white/80 hover:text-white'
              }`}
            >
              ҚЗ
            </button>
          </div>
        </div>
      </div>

      
    </footer>
  );
};

export default Footer;
