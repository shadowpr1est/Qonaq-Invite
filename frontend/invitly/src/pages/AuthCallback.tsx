import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslation } from 'react-i18next';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, isInitialized } = useAuth();
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback');
        
        const accessToken = searchParams.get('access_token');
        const refreshToken = searchParams.get('refresh_token');
        const lang = searchParams.get('lang');
        const success = searchParams.get('success');
        const errorParam = searchParams.get('error');

        console.log('AuthCallback: URL params:', {
          hasAccessToken: !!accessToken,
          hasRefreshToken: !!refreshToken,
          lang,
          success,
          error: errorParam
        });

        // Handle error case
        if (errorParam) {
          console.error('AuthCallback: OAuth error:', errorParam);
          setError(t('auth.oauth_error'));
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }

        // Handle success case
        if (success === 'true' && accessToken && refreshToken) {
          console.log('AuthCallback: Setting tokens and fetching user');
          
          // Set language if provided
          if (lang) {
            localStorage.setItem('language', lang);
          }

          // Set tokens
          apiClient.setTokens(accessToken, refreshToken);

          // Clear URL parameters
          window.history.replaceState({}, document.title, '/auth-callback');

          // Fetch user data
          const user = await apiClient.getCurrentUser();
          console.log('AuthCallback: User fetched successfully:', user);

          // Set user in auth context
          if (setUser) {
            setUser(user);
          }

          // Redirect based on where user came from
          const fromPage = searchParams.get('from');
          if (fromPage === 'dashboard' || fromPage === 'builder') {
          navigate('/dashboard');
          } else {
            // Otherwise, go to home page
            navigate('/');
          }
        } else {
          console.error('AuthCallback: Missing required parameters');
          setError(t('auth.invalid_callback'));
          setIsProcessing(false);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        }
      } catch (error) {
        console.error('AuthCallback: Error processing callback:', error);
        setError(t('auth.processing_error'));
        setIsProcessing(false);
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };

    if (isInitialized) {
      processAuthCallback();
    }
  }, [searchParams, navigate, setUser, isInitialized, t]);

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">{error}</div>
          <div className="text-gray-600">{t('auth.redirecting_to_login')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" text={t('auth.processing_login')} />
      </div>
    </div>
  );
};

export default AuthCallback; 