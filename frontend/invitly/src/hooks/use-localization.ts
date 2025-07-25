import { useTranslation } from 'react-i18next';

export const useLocalization = () => {
  const { t, i18n } = useTranslation();
  
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language);
    localStorage.setItem('language', language);
  };
  
  const currentLanguage = i18n.language;
  
  const isLanguage = (language: string) => {
    return currentLanguage === language;
  };
  
  return {
    t,
    changeLanguage,
    currentLanguage,
    isLanguage,
    i18n
  };
}; 