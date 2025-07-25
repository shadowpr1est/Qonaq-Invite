
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Bell, Palette, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HowItWorks = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const { t } = useTranslation();

  const steps = [
    {
      number: 1,
      title: t('how_it_works.steps.step1.title'),
      description: t('how_it_works.steps.step1.description'),
      icon: Bell,
    },
    {
      number: 2,
      title: t('how_it_works.steps.step2.title'),
      description: t('how_it_works.steps.step2.description'),
      icon: Palette,
    },
    {
      number: 3,
      title: t('how_it_works.steps.step3.title'),
      description: t('how_it_works.steps.step3.description'),
      icon: Share2,
    }
  ];

  return (
    <section 
      id="how-it-works"
      ref={sectionRef}
      className="min-h-[120vh] flex items-center justify-center bg-gradient-to-b from-white to-brand-50 relative overflow-hidden py-16"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23a855f7' fill-opacity='1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative Blurred Blobs */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-200/20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-300/15 rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-4 relative w-full">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 100, damping: 20 }}
            className="text-4xl lg:text-6xl font-bold font-display mb-6"
          >
            {t('how_it_works.title').split(' ')[0]} <span className="text-gradient">{t('how_it_works.title').split(' ').slice(1).join(' ')}</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 100, damping: 20, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            {t('how_it_works.subtitle')}
          </motion.p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 40, scale: 0.9 }}
              animate={isInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 40, scale: 0.9 }}
              transition={{
                type: "spring",
                stiffness: 100,
                damping: 20,
                delay: index * 0.15
              }}
              className="group cursor-pointer"
            >
              <motion.div
                whileHover={{ 
                  y: -6,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
                className="bg-white/[0.03] backdrop-blur-[12px] rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-white/20 h-80 flex flex-col items-center justify-center text-center relative overflow-hidden"
              >
                {/* Glassmorphism overlay */}
                <div className="absolute inset-0 bg-white/5 rounded-2xl" />
                
                {/* Icon Circle */}
                <div className="relative mb-6 z-10">
                  <motion.div 
                    whileHover={{ 
                      scale: 1.08,
                      transition: { type: "spring", stiffness: 300, damping: 15 }
                    }}
                    className="w-20 h-20 bg-gradient-brand rounded-full flex items-center justify-center shadow-xl relative"
                  >
                    <step.icon className="w-10 h-10 text-white" />
                    
                    {/* Pulse effect on hover */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-brand rounded-full opacity-0 group-hover:opacity-30"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0, 0.3, 0]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </motion.div>
                  
                  {/* Step Number Badge */}
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-brand-400">
                    <span className="text-sm font-bold text-brand-600">{step.number}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Hover Glow Effect */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-brand opacity-0 group-hover:opacity-[0.05] rounded-2xl transition-opacity duration-500 pointer-events-none"
                  whileHover={{ opacity: 0.05 }}
                />

                {/* Ripple effect for mobile */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden md:hidden">
                  <motion.div
                    className="absolute inset-0 bg-white/10 rounded-full scale-0 group-active:scale-150 transition-transform duration-300 origin-center"
                    style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%) scale(0)' }}
                  />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
