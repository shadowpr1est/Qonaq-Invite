
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Heart, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import Container from '@/components/ui/container';

const Footer = () => {
  const { t } = useTranslation();

  const footerSections = [
    {
      title: t('footer.company'),
      links: [
        { label: t('footer.about'), href: '/about' },
        { label: t('footer.careers'), href: '/careers' },
        { label: t('footer.contact'), href: '/contact' }
      ]
    },
    {
      title: t('footer.product'),
      links: [
        { label: t('footer.features'), href: '/features' },
        { label: t('footer.pricing'), href: '/pricing' },
        { label: t('footer.templates'), href: '/templates' }
      ]
    },
    {
      title: t('footer.support'),
      links: [
        { label: t('footer.help'), href: '/help' },
        { label: t('footer.docs'), href: '/docs' },
        { label: t('footer.status'), href: '/status' }
      ]
    },
    {
      title: t('footer.legal'),
      links: [
        { label: t('footer.privacy'), href: '/privacy' },
        { label: t('footer.terms'), href: '/terms' },
        { label: t('footer.cookies'), href: '/cookies' }
      ]
    }
  ];

  const socialLinks = [
    { icon: Facebook, href: '#', label: 'Facebook' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Instagram, href: '#', label: 'Instagram' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' }
  ];

  const contactInfo = [
    { icon: Mail, text: 'alisher.arginbekov@mail.ru', href: 'mailto:alisher.arginbekov@mail.ru' },
    { icon: Phone, text: '+7 (708) 168-81-42', href: 'tel:+77081688142' },
    { icon: MapPin, text: 'Алматы, Казахстан', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"></div>
      </div>

      <Container className="relative z-10">
        <div className="py-16 lg:py-20">
          {/* Main footer content */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-12">
            {/* Left column - Brand and description */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-lg">I</span>
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  Invitly AI
                </span>
              </div>
              
              <p className="text-lg text-gray-300 leading-relaxed max-w-md">
                {t('hero.description')}
              </p>

              {/* Contact information */}
              <div className="space-y-3">
                {contactInfo.map((contact, index) => (
                  <motion.a
                    key={index}
                    href={contact.href}
                    className="flex items-center gap-3 text-gray-300 hover:text-white transition-colors duration-200"
                    whileHover={{ x: 5 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <contact.icon className="w-4 h-4" />
                    <span>{contact.text}</span>
                  </motion.a>
                ))}
              </div>

              {/* Social links */}
              <div className="flex items-center gap-4 pt-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all duration-200"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ delay: index * 0.1 }}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </motion.div>

            {/* Right column - Footer links */}
            <motion.div 
              className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {footerSections.map((section, sectionIndex) => (
                <div key={section.title} className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    {section.title}
                  </h3>
                  <ul className="space-y-3">
                    {section.links.map((link, linkIndex) => (
                      <motion.li
                        key={link.label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ 
                          duration: 0.3, 
                          delay: (sectionIndex * 0.1) + (linkIndex * 0.05) 
                        }}
                        viewport={{ once: true }}
                      >
                        <a
                          href={link.href}
                          className="text-gray-300 hover:text-white transition-colors duration-200"
                        >
                          {link.label}
                        </a>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Bottom section */}
          <motion.div 
            className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-400 text-sm">
              {t('footer.copyright')}
            </p>
            
          
          </motion.div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
