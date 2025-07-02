import React, { useState, useCallback } from 'react';

interface Props {}

interface FormData {
  name: string;
  email: string;
  message: string;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

// Modern React component with v0.dev patterns
const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <section className={`py-20 px-6 ${className}`}>
    <div className="max-w-6xl mx-auto">
      {children}
    </div>
  </section>
);

const GlassButton: React.FC<ButtonProps> = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary',
  disabled = false 
}) => {
  const baseClasses = "px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform";
  const variantClasses = variant === 'primary' 
    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:scale-105 hover:shadow-2xl"
    : "bg-white/20 backdrop-blur-xl border border-white/30 text-white hover:bg-white/30";
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
};

const WeddingInvitation: React.FC<Props> = () => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus('error');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus('success');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  }, [formData]);
  
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSubmitStatus('idle');
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Hero Section */}
      <Section className="min-h-screen flex items-center justify-center text-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 bg-gradient-conic from-purple-500 via-pink-500 to-purple-500 opacity-20 animate-spin-slow"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.3),transparent_50%)]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <h1 className="text-6xl md:text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200 mb-8 tracking-tight">
            Свадьба Алексея и Марии
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed max-w-3xl mx-auto">
            Приглашаем вас на нашу волшебную свадебную церемонию. Празднуем любовь, создаем воспоминания на всю жизнь.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <GlassButton variant="primary">Подтвердить участие</GlassButton>
            <GlassButton variant="secondary">Подробности</GlassButton>
          </div>
        </div>
      </Section>

      {/* About Section */}
      <Section className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 backdrop-blur-xl">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-white mb-8">Наша История</h2>
          <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-4xl mx-auto">
            История нашей любви началась 5 лет назад в маленькой кофейне в центре города. 
            Сегодня мы готовы сделать следующий шаг в нашем путешествии и хотим разделить это особенное мгновение с самыми близкими людьми.
          </p>
        </div>
      </Section>

      {/* Features Section */}
      <Section>
        <h2 className="text-5xl font-bold text-center text-white mb-16">Детали События</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { 
              title: "Церемония", 
              description: "14:00 - Торжественная церемония в Саду Роз",
              icon: "💒"
            },
            { 
              title: "Банкет", 
              description: "17:00 - Праздничный банкет в ресторане 'Золотая Осень'",
              icon: "🥂"
            },
            { 
              title: "Танцы", 
              description: "20:00 - Танцы до утра под звездным небом",
              icon: "💃"
            }
          ].map((feature, index) => (
            <div 
              key={index}
              className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 group"
            >
              <div className="text-4xl mb-4 text-center">{feature.icon}</div>
              <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-200 transition-colors text-center">
                {feature.title}
              </h3>
              <p className="text-gray-300 leading-relaxed text-center">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Section>

      {/* Contact Section */}
      <Section className="bg-gradient-to-r from-slate-900/50 to-purple-900/50 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-5xl font-bold text-center text-white mb-12">Подтвердить Участие</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="text"
                name="name"
                placeholder="Ваше имя"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            
            <div>
              <input
                type="email"
                name="email"
                placeholder="Ваш email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                required
              />
            </div>
            
            <div>
              <textarea
                name="message"
                placeholder="Пожелания молодоженам"
                value={formData.message}
                onChange={handleInputChange}
                rows={6}
                className="w-full px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
                required
              />
            </div>
            
            <div className="text-center">
              <GlassButton 
                type="submit" 
                disabled={isSubmitting}
                variant="primary"
              >
                {isSubmitting ? 'Отправка...' : 'Подтвердить участие'}
              </GlassButton>
              
              {submitStatus === 'success' && (
                <p className="mt-4 text-green-400">Спасибо! Ваше участие подтверждено!</p>
              )}
              {submitStatus === 'error' && (
                <p className="mt-4 text-red-400">Ошибка отправки. Проверьте все поля.</p>
              )}
            </div>
          </form>
        </div>
      </Section>

      {/* Footer */}
      <footer className="py-12 bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-white/60 text-lg">
            © 2024 Свадьба Алексея и Марии. Создано с любовью ❤️
          </p>
          <p className="text-white/40 text-sm mt-2">
            Generated with v0.dev-inspired React architecture
          </p>
        </div>
      </footer>
    </div>
  );
};

export default WeddingInvitation; 