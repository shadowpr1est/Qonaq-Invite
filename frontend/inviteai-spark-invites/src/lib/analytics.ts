// Google Analytics утилиты для отслеживания
// GA4 тег добавлен прямо в index.html

// Отслеживание событий
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};

// Отслеживание просмотров страниц
export const trackPageView = (path: string) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('config', 'G-19YR61WN34', {
    page_path: path,
  });
};

// Отслеживание пользователей
export const setUserProperties = (userId: string, properties?: Record<string, any>) => {
  if (typeof window.gtag !== 'function') return;
  
  window.gtag('config', 'G-19YR61WN34', {
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