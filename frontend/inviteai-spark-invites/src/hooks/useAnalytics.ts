import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView, trackEvent, setUserProperties } from '../lib/analytics';

// Хук для автоматического отслеживания страниц
export const usePageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);
};

// Хук для отслеживания событий
export const useAnalytics = () => {
  const trackButtonClick = (buttonName: string, page?: string) => {
    trackEvent('click', 'engagement', `${page || 'unknown'}_${buttonName}`);
  };

  const trackFormSubmit = (formName: string) => {
    trackEvent('submit', 'form', formName);
  };

  const trackUserAction = (action: string, category: string = 'user_action') => {
    trackEvent(action, category);
  };

  const setUser = (userId: string, properties?: Record<string, any>) => {
    setUserProperties(userId, properties);
  };

  return {
    trackButtonClick,
    trackFormSubmit, 
    trackUserAction,
    setUser,
  };
}; 