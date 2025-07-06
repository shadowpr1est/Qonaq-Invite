import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { GOOGLE_CLIENT_ID } from '@/lib/constants';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useToast } from '@/hooks/use-toast';

interface GoogleOAuthButtonProps {
  mode: 'login' | 'signup';
  className?: string;
  disabled?: boolean;
}

declare global {
  interface Window {
    google: any;
  }
}

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  mode,
  className = '',
  disabled = false
}) => {
  const { googleOAuth, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleReady, setGoogleReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Проверяем, когда библиотека Google загрузится
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (window.google && window.google.accounts) {
      setGoogleReady(true);
      // Инициализация Google OAuth только один раз
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      return;
    }

    const checkInterval = setInterval(() => {
      if (window.google && window.google.accounts) {
        setGoogleReady(true);
        // Инициализация Google OAuth только один раз
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });
        clearInterval(checkInterval);
      }
    }, 100);

    return () => clearInterval(checkInterval);
  }, []);

  const handleGoogleAuth = () => {
    if (!googleReady || typeof window.google === 'undefined') {
      setError('Google библиотека не загружена');
      toast({
        title: 'Ошибка Google OAuth',
        description: 'Google библиотека не загружена. Попробуйте обновить страницу.',
        variant: 'destructive',
      });
      return;
    }
    try {
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          toast({
            title: 'Google One Tap не отображается',
            description: 'Возможно, вы уже авторизованы, заблокированы cookies или есть ограничения браузера.',
            variant: 'destructive',
          });
        }
        if (notification.isSkippedMoment()) {
          toast({
            title: 'Google One Tap пропущен',
            description: 'Пользователь пропустил окно авторизации.',
            variant: 'destructive',
          });
        }
        if (notification.isDismissedMoment()) {
          toast({
            title: 'Google One Tap закрыт',
            description: 'Вы закрыли окно авторизации Google.',
            variant: 'destructive',
          });
        }
        // FedCM errors
        if (notification.getNotDisplayedReason && notification.getNotDisplayedReason() === 'credential_returned') {
          // credential_returned — штатная ситуация, не ошибка
          return;
        }
        if (notification.getNotDisplayedReason && notification.getNotDisplayedReason() === 'unknown_reason') {
          toast({
            title: 'Ошибка Google OAuth',
            description: 'Неизвестная ошибка при отображении окна авторизации.',
            variant: 'destructive',
          });
        }
      });
    } catch (e: any) {
      setError('Ошибка инициализации Google OAuth');
      let description = 'Не удалось открыть окно авторизации Google.';
      if (e && e.name === 'NetworkError') {
        description = 'Ошибка сети при получении токена Google. Проверьте соединение или настройки OAuth.';
      } else if (e && e.name === 'AbortError') {
        description = 'Запрос авторизации был прерван. Попробуйте ещё раз.';
      }
      toast({
        title: 'Ошибка Google OAuth',
        description,
        variant: 'destructive',
      });
    }
  };

  const handleCredentialResponse = async (response: any) => {
    try {
      // Декодируем JWT токен от Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Создаем объект для отправки на бэкенд
      const googleData = {
        email: payload.email,
        name: payload.name,
        google_id: payload.sub,
        avatar: payload.picture,
      };

      // Отправляем данные на бэкенд
      await googleOAuth(googleData);
      
      // Перенаправляем на главную после успешной авторизации
      navigate('/');
    } catch (error) {
      setError('Ошибка Google OAuth');
      toast({
        title: 'Ошибка Google OAuth',
        description: 'Не удалось войти через Google. Попробуйте другой способ или позже.',
        variant: 'destructive',
      });
      console.error('Ошибка Google OAuth:', error);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className={`w-full h-12 text-base font-medium border-2 border-gray-200 hover:border-gray-300 transition-all duration-200 ${className}`}
        onClick={handleGoogleAuth}
        disabled={disabled || isLoading || !googleReady}
      >
        {isLoading ? (
          <LoadingSpinner size="sm" variant="dots" text="Входим через Google..." />
        ) : (
          <div className="flex items-center gap-3">
            {/* Google logo */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            
            <span>
              {mode === 'login' ? 'Войти через Google' : 'Регистрация через Google'}
            </span>
          </div>
        )}
      </Button>
    </>
  );
}; 