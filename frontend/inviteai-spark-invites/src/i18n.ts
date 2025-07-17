import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import kk from './locales/kk/translation.json';
import ru from './locales/ru/translation.json';
import en from './locales/en/translation.json';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      kk: { translation: kk },
      ru: { translation: ru },
      en: { translation: en },
    },
    lng: 'ru', // язык по умолчанию
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });

export default i18n; 