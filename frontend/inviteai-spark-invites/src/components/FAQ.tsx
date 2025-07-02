
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: 'Сколько стоит создание приглашения?',
    answer: 'Базовые шаблоны абсолютно бесплатны. Премиум-шаблоны и дополнительные функции доступны от 990 тенге.',
    category: 'Оплата'
  },
  {
    question: 'Можно ли изменить текст в приглашении?',
    answer: 'Да, все тексты полностью редактируются. Вы можете изменить название события, дату, время, место и добавить личное сообщение.',
    category: 'Общее'
  },
  {
    question: 'Поддерживается ли казахский язык?',
    answer: 'Конечно! Наш сервис полностью поддерживает казахский и русский языки, включая все специальные символы (Ә, Қ, Ұ и др.).',
    category: 'Общее'
  },
  {
    question: 'Как гости будут получать приглашения?',
    answer: 'Вы получите уникальную ссылку и QR-код, которые можно отправить через WhatsApp, Telegram, SMS или любым другим способом.',
    category: 'Общее'
  },
  {
    question: 'Есть ли аналитика по приглашениям?',
    answer: 'Да, в премиум-версии доступна статистика: кто просмотрел приглашение, кто подтвердил участие и другие полезные данные.',
    category: 'Общее'
  },
  {
    question: 'Безопасны ли мои данные?',
    answer: 'Мы используем современные методы шифрования и не передаём ваши данные третьим лицам. Все приглашения хранятся в защищённой среде.',
    category: 'Приватность'
  },
  {
    question: 'Можно ли удалить приглашение?',
    answer: 'Да, вы можете удалить приглашение в любое время через личный кабинет. Все связанные данные будут полностью удалены.',
    category: 'Приватность'
  },
  {
    question: 'Какие способы оплаты доступны?',
    answer: 'Принимаем карты Visa/Mastercard, Kaspi Gold, а также мобильные платежи. Все платежи проходят через защищённые каналы.',
    category: 'Оплата'
  }
];

const categories = ['Общее', 'Оплата', 'Приватность'];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Общее');

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="min-h-[70vh] py-16 bg-gradient-to-b from-white to-brand-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-6">
            Часто задаваемые <span className="text-gradient">вопросы</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            Ответы на популярные вопросы о нашем сервисе
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category
                  ? 'bg-gradient-brand text-white shadow-lg'
                  : 'bg-white text-muted-foreground hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Accordion */}
        <motion.div layout className="space-y-4 mb-12">
          <AnimatePresence mode="wait">
            {filteredFaqs.map((faq, index) => (
              <motion.div
                key={`${activeCategory}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                layout
              >
                <Card className="border-brand-100 shadow-sm hover:shadow-md transition-shadow rounded-2xl overflow-hidden">
                  <CardContent className="p-0">
                    <button
                      onClick={() => toggleFAQ(index)}
                      className="w-full p-6 text-left flex items-center justify-between hover:bg-brand-50/50 transition-colors"
                    >
                      <h3 className="text-lg font-semibold pr-4">{faq.question}</h3>
                      <motion.div
                        animate={{ rotate: openIndex === index ? 45 : 0 }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                      >
                        <Plus className="w-5 h-5 text-brand-500" />
                      </motion.div>
                    </button>
                    
                    <AnimatePresence>
                      {openIndex === index && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{
                            type: "spring",
                            stiffness: 100,
                            damping: 20
                          }}
                          className="overflow-hidden"
                        >
                          <motion.div
                            initial={{ y: -10 }}
                            animate={{ y: 0 }}
                            exit={{ y: -10 }}
                            transition={{ type: "spring", stiffness: 100, damping: 20 }}
                            className="px-6 pb-6"
                          >
                            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Contact CTA */}
        <div className="text-center">
          <Button 
            variant="outline"
            className="bg-white border-brand-200 text-brand-600 hover:bg-brand-50 px-6 py-3 rounded-full font-medium shadow-sm"
          >
            Не нашли ответа? Напишите нам
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
