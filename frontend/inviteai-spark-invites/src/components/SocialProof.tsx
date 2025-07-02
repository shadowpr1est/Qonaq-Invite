import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';

const testimonials = [
  {
    name: 'Айнур Жакупова',
    role: 'Организатор мероприятий',
    content: 'Создала приглашения на свадьбу за 2 минуты! Гости были в восторге от красивого дизайна и удобной QR-ссылки.',
    rating: 5,
    avatar: '👰🏻‍♀️'
  },
  {
    name: 'Марат Абдуллин',
    role: 'Предприниматель',
    content: 'Использую для всех корпоративных мероприятий. Экономит массу времени, а результат всегда профессиональный.',
    rating: 5,
    avatar: '👨🏻‍💼'
  },
  {
    name: 'Дана Сарсенова',
    role: 'Мама двоих детей',
    content: 'Детские праздники стали организовывать намного проще! Красивые приглашения готовы за минуту.',
    rating: 5,
    avatar: '👩🏻‍🦱'
  }
];

const SocialProof = () => {
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [inviteCount, setInviteCount] = useState(0);

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Count-up animation for invite counter
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const targetCount = 2451;
            const duration = 2000;
            const steps = 60;
            const increment = targetCount / steps;
            let current = 0;

            const counter = setInterval(() => {
              current += increment;
              if (current >= targetCount) {
                setInviteCount(targetCount);
                clearInterval(counter);
              } else {
                setInviteCount(Math.floor(current));
              }
            }, duration / steps);
          }
        });
      },
      { threshold: 0.5 }
    );

    const element = document.getElementById('invite-counter');
    if (element) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section id="templates" className="min-h-[70vh] flex items-center py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Testimonials Carousel */}
        <div className="space-y-6">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-8">
            Наши <span className="text-gradient">шаблоны</span> и отзывы
          </h2>

          <div className="relative">
            <Card className="border-2 border-brand-100 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-4xl">{testimonials[currentTestimonial].avatar}</div>
                  <div>
                    <h4 className="font-bold text-lg">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>

                <div className="flex mb-4">
                  {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                  ))}
                </div>

                <p className="text-lg text-foreground leading-relaxed">
                  "{testimonials[currentTestimonial].content}"
                </p>
              </CardContent>
            </Card>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                size="sm"
                onClick={prevTestimonial}
                className="w-10 h-10 rounded-full"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={nextTestimonial}
                className="w-10 h-10 rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Indicators */}
            <div className="flex justify-center gap-2 mt-4">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-brand-500 w-6' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right Column - Live Counter */}
        <div className="text-center lg:text-left">
          <div className="bg-gradient-to-r from-brand-50 to-blue-50 rounded-3xl p-12 shadow-lg">
            <div className="text-6xl mb-6">📊</div>
            <h3 className="text-2xl font-bold mb-4">Статистика в реальном времени</h3>
            
            <div id="invite-counter" className="mb-6">
              <div className="text-5xl font-bold text-gradient mb-2">
                {inviteCount.toLocaleString('ru-RU')}
              </div>
              <p className="text-xl text-muted-foreground">
                приглашений уже отправлено
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-brand-600">150+</div>
                <div className="text-sm text-muted-foreground">Шаблонов</div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm">
                <div className="text-2xl font-bold text-brand-600">98%</div>
                <div className="text-sm text-muted-foreground">Довольных</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SocialProof;
