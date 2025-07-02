import { gtag } from 'gtag';
import { GA_MEASUREMENT_ID } from './constants';

// Инициализация GA4
export const initGA = () => {
  if (!GA_MEASUREMENT_ID) {
    console.warn('GA_MEASUREMENT_ID не настроен');
    return;
  }

  // Динамически загружаем gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // Инициализируем gtag
  window.dataLayer = window.dataLayer || [];
  function gtagFunction(...args: any[]) {
    window.dataLayer.push(args);
  }
  window.gtag = gtagFunction;

  gtag('js', new Date());
  gtag('config', GA_MEASUREMENT_ID, {
    page_title: document.title,
    page_location: window.location.href,
  });
};

// Отслеживание событий
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (!GA_MEASUREMENT_ID) return;
  
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Отслеживание просмотров страниц
export const trackPageView = (path: string) => {
  if (!GA_MEASUREMENT_ID) return;
  
  gtag('config', GA_MEASUREMENT_ID, {
    page_path: path,
  });
};

// Отслеживание пользователей
export const setUserProperties = (userId: string, properties?: Record<string, any>) => {
  if (!GA_MEASUREMENT_ID) return;
  
  gtag('config', GA_MEASUREMENT_ID, {
    user_id: userId,
    custom_map: properties,
  });
};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
} 