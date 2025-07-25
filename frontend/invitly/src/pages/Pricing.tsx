import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check } from 'lucide-react';
import MainLayout from '@/components/MainLayout';

const plans = [
  {
    name: 'Бесплатный',
    price: '0',
    period: 'всегда',
    description: 'Идеально для личных мероприятий',
    features: [
      '5 базовых шаблонов',
      'До 3 приглашений в месяц',
      'QR-код и ссылка',
      'Базовая аналитика',
      'Поддержка через чат'
    ],
    popular: false,
    cta: 'Начать бесплатно'
  },
  {
    name: 'Премиум',
    price: '2990',
    period: 'месяц',
    description: 'Для активных организаторов',
    features: [
      '50+ премиум шаблонов',
      'Безлимитные приглашения',
      'Кастомизация дизайна',
      'Расширенная аналитика',
      'Приоритетная поддержка',
      'Без водяных знаков',
      'Экспорт в PDF/PNG'
    ],
    popular: true,
    cta: 'Попробовать 7 дней бесплатно'
  },
  {
    name: 'Бизнес',
    price: '9990',
    period: 'месяц',
    description: 'Для event-агентств и компаний',
    features: [
      'Все возможности Премиум',
      'Белый лейбл (ваш бренд)',
      'API интеграции',
      'Командная работа',
      'Персональный менеджер',
      'SLA поддержка 24/7',
      'Кастомные шаблоны'
    ],
    popular: false,
    cta: 'Связаться с нами'
  }
];

const faqItems = [
  {
    question: 'Можно ли изменить тариф в любое время?',
    answer: 'Да, вы можете повысить или понизить тариф в любое время. При повышении тарифа доплата рассчитывается пропорционально.'
  },
  {
    question: 'Есть ли скидки для студентов?',
    answer: 'Да, студентам предоставляется скидка 50% на тариф Премиум при предъявлении студенческого билета.'
  },
  {
    question: 'Что происходит с приглашениями при отмене подписки?',
    answer: 'Созданные приглашения остаются активными еще 30 дней после отмены подписки для завершения ваших мероприятий.'
  },
  {
    question: 'Возможна ли оплата за год со скидкой?',
    answer: 'Да, при годовой оплате предоставляется скидка 20%. Свяжитесь с нами для оформления.'
  }
];

const Pricing = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-brand-50 to-white pt-24 md:pt-28">
        <div className="max-w-7xl mx-auto px-4 py-16">
          {/* Header Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-6">
              Выберите свой <span className="text-gradient">тариф</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              От бесплатного базового функционала до профессиональных решений для бизнеса
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`relative ${
                  plan.popular 
                    ? 'ring-2 ring-brand-500 shadow-xl scale-105' 
                    : 'shadow-lg hover:shadow-xl transition-shadow'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-brand text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Популярный
                    </span>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">₸{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </CardHeader>
                
                <CardContent className="pt-4">
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-brand hover:opacity-90' 
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                    size="lg"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">
              Часто задаваемые вопросы о тарифах
            </h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              {faqItems.map((item, index) => (
                <Card key={index} className="shadow-sm">
                  <CardContent className="p-6">
                    <h3 className="font-semibold mb-3">{item.question}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {item.answer}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16">
            <Card className="bg-gradient-brand text-white border-0 shadow-xl">
              <CardContent className="p-12">
                <h3 className="text-3xl font-bold mb-4">Остались вопросы?</h3>
                <p className="text-xl mb-6 text-white/90">
                  Свяжитесь с нами для индивидуального предложения
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    className="bg-white text-brand-600 hover:bg-gray-100"
                  >
                    Написать в Telegram
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="bg-white text-brand-600"
                  >
                    Заказать звонок
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Pricing;
