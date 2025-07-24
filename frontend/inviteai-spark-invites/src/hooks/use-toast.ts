import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ToastType } from '@/components/Toast';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const { t } = useTranslation();

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    setToasts(prev => [...prev, newToast]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const showSuccess = useCallback((message: string, title?: string) => {
    addToast({
      type: 'success',
      title: title || t('common.success'),
      message
    });
  }, [addToast, t]);

  const showError = useCallback((message: string, title?: string) => {
    addToast({
      type: 'error',
      title: title || t('common.error'),
      message
    });
  }, [addToast, t]);

  const showWarning = useCallback((message: string, title?: string) => {
    addToast({
      type: 'warning',
      title: title || t('common.warning'),
      message
    });
  }, [addToast, t]);

  const showInfo = useCallback((message: string, title?: string) => {
    addToast({
      type: 'info',
      title: title || t('common.info'),
      message
    });
  }, [addToast, t]);

  const showNotification = useCallback((key: string, type: ToastType = 'success') => {
    const message = t(`notifications.${key}`);
    addToast({
      type,
      title: type === 'success' ? t('common.success') : t('common.error'),
      message
    });
  }, [addToast, t]);

  return {
    toasts,
    addToast,
    removeToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showNotification
  };
};
