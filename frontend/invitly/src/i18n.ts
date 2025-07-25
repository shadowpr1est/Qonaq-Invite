import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import kk from './locales/kk/translation.json';
import ru from './locales/ru/translation.json';
import en from './locales/en/translation.json';

// Получаем сохраненный язык из localStorage
const savedLanguage = localStorage.getItem('language') || 'ru';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      kk: { translation: kk },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: savedLanguage, // используем сохраненный язык
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 