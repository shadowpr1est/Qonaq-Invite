
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('general');
  const { t } = useTranslation();

  const categories = [
    { key: 'general', label: t('faq.categories.general') },
    { key: 'payment', label: t('faq.categories.payment') },
    { key: 'privacy', label: t('faq.categories.privacy') }
  ];

  const faqs = [
    {
      question: t('faq.questions.0.question'),
      answer: t('faq.questions.0.answer'),
      category: 'payment'
    },
    {
      question: t('faq.questions.1.question'),
      answer: t('faq.questions.1.answer'),
      category: 'general'
    },
    {
      question: t('faq.questions.2.question'),
      answer: t('faq.questions.2.answer'),
      category: 'general'
    },
    {
      question: t('faq.questions.3.question'),
      answer: t('faq.questions.3.answer'),
      category: 'general'
    },
    {
      question: t('faq.questions.4.question'),
      answer: t('faq.questions.4.answer'),
      category: 'general'
    },
    {
      question: t('faq.questions.5.question'),
      answer: t('faq.questions.5.answer'),
      category: 'privacy'
    },
    {
      question: t('faq.questions.6.question'),
      answer: t('faq.questions.6.answer'),
      category: 'privacy'
    },
    {
      question: t('faq.questions.7.question'),
      answer: t('faq.questions.7.answer'),
      category: 'payment'
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq => faq.category === activeCategory);

  return (
    <section className="min-h-[70vh] py-16 bg-gradient-to-b from-white to-brand-50">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-bold font-display mb-6">
            {t('faq.title').split(' ').slice(0, 2).join(' ')} <span className="text-gradient">{t('faq.title').split(' ').slice(2).join(' ')}</span>
          </h2>
          <p className="text-xl text-muted-foreground">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category) => (
            <button
              key={category.key}
              onClick={() => setActiveCategory(category.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeCategory === category.key
                  ? 'bg-gradient-brand text-white shadow-lg'
                  : 'bg-white text-muted-foreground hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category.label}
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
            {t('faq.cta')}
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
