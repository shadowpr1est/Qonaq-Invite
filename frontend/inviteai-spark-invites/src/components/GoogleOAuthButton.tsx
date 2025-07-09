import React, { useEffect, useState, useCallback } from 'react';
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

// Global flag to track Google initialization
let isGoogleInitialized = false;
let initializationPromise: Promise<void> | null = null;

export const GoogleOAuthButton: React.FC<GoogleOAuthButtonProps> = ({
  mode,
  className = '',
  disabled = false
}) => {
  const { googleOAuth, isLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [googleReady, setGoogleReady] = useState(false);

  const handleCredentialResponse = useCallback(async (response: any) => {
    try {
      // Decode JWT token from Google
      const payload = JSON.parse(atob(response.credential.split('.')[1]));
      
      // Create object for backend
      const googleData = {
        email: payload.email,
        name: payload.name,
        google_id: payload.sub,
        avatar: payload.picture,
      };

      // Send data to backend
      await googleOAuth(googleData);
      
      // Navigate to home after successful authentication
      navigate('/');
    } catch (error) {
      console.error('Google OAuth error:', error);
      toast({
        title: 'Ошибка Google OAuth',
        description: 'Не удалось войти через Google. Попробуйте другой способ или позже.',
        variant: 'destructive',
      });
    }
  }, [googleOAuth, navigate, toast]);

  const initializeGoogle = useCallback(async (): Promise<void> => {
    if (isGoogleInitialized) {
      return;
    }

    if (initializationPromise) {
      return initializationPromise;
    }

    initializationPromise = new Promise<void>((resolve, reject) => {
      if (typeof window === 'undefined' || !GOOGLE_CLIENT_ID) {
        reject(new Error('Google Client ID not configured'));
        return;
      }

      // Check if google library is already loaded
      if (window.google && window.google.accounts) {
        try {
          window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleCredentialResponse,
            auto_select: false,
            cancel_on_tap_outside: true,
            use_fedcm_for_prompt: true,
          });
          isGoogleInitialized = true;
          resolve();
        } catch (error) {
          reject(error);
        }
        return;
      }

      // Wait for library to load
      const checkInterval = setInterval(() => {
        if (window.google && window.google.accounts) {
          clearInterval(checkInterval);
          try {
            window.google.accounts.id.initialize({
              client_id: GOOGLE_CLIENT_ID,
              callback: handleCredentialResponse,
              auto_select: false,
              cancel_on_tap_outside: true,
              use_fedcm_for_prompt: true,
            });
            isGoogleInitialized = true;
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      }, 100);

      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error('Google library failed to load'));
      }, 10000);
    });

    return initializationPromise;
  }, [handleCredentialResponse]);

  useEffect(() => {
    const setupGoogle = async () => {
      try {
        await initializeGoogle();
        setGoogleReady(true);
      } catch (error) {
        console.error('Failed to initialize Google OAuth:', error);
        toast({
          title: 'Ошибка инициализации',
          description: 'Не удалось загрузить Google OAuth. Попробуйте обновить страницу.',
          variant: 'destructive',
        });
      }
    };

    setupGoogle();
  }, [initializeGoogle, toast]);

  const handleGoogleAuth = useCallback(async () => {
    if (!googleReady || !window.google || !window.google.accounts || disabled || isLoading) {
      return;
    }

    try {
      // Dismiss any existing prompts first
      window.google.accounts.id.disableAutoSelect();
      
      // Small delay to ensure clean state
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Show the prompt
      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed()) {
          const reason = notification.getNotDisplayedReason ? notification.getNotDisplayedReason() : 'unknown';
          
          // Don't show error for expected cases
          if (reason === 'credential_returned' || reason === 'opt_out_or_no_session') {
            return;
          }
          
          console.warn('Google One Tap not displayed:', reason);
          
          // Fallback to popup if one-tap doesn't work
          if (reason === 'suppressed_by_user' || reason === 'unregistered_origin') {
            // Try renderButton as fallback
            const buttonDiv = document.createElement('div');
            buttonDiv.style.display = 'none';
            document.body.appendChild(buttonDiv);
            
            try {
              window.google.accounts.id.renderButton(buttonDiv, {
                type: 'popup',
                theme: 'outline',
                size: 'large',
                click_listener: () => {
                  document.body.removeChild(buttonDiv);
                }
              });
              
              // Trigger click programmatically
              setTimeout(() => {
                const button = buttonDiv.querySelector('div[role="button"]') as HTMLElement;
                if (button) {
                  button.click();
                }
              }, 100);
            } catch (fallbackError) {
              console.error('Fallback button error:', fallbackError);
              document.body.removeChild(buttonDiv);
              toast({
                title: 'Google One Tap недоступен',
                description: 'Попробуйте перезагрузить страницу или использовать другой браузер.',
                variant: 'destructive',
              });
            }
          } else {
            toast({
              title: 'Google One Tap недоступен',
              description: 'Возможно, заблокированы cookies или есть ограничения браузера.',
              variant: 'destructive',
            });
          }
        }
        
        if (notification.isDismissedMoment()) {
          const dismissMethod = notification.getDismissedReason ? notification.getDismissedReason() : 'unknown';
          if (dismissMethod === 'credential_returned') {
            // This is normal, user selected a credential
            return;
          }
          console.log('Google One Tap dismissed:', dismissMethod);
        }
        
        if (notification.getSkippedReason && notification.getSkippedReason()) {
          console.log('Google One Tap skipped:', notification.getSkippedReason());
        }
      });
    } catch (error) {
      console.error('Error showing Google prompt:', error);
      toast({
        title: 'Ошибка Google OAuth',
        description: 'Не удалось открыть окно авторизации Google.',
        variant: 'destructive',
      });
    }
  }, [googleReady, disabled, isLoading, toast]);

  return (
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
  );
}; 