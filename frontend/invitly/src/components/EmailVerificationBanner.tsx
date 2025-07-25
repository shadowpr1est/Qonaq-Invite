import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  X,
  RefreshCw
} from 'lucide-react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface EmailVerificationBannerProps {
  onDismiss?: () => void;
}

export const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  onDismiss
}) => {
  const { user, resendVerificationEmail, isLoading } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useLocalStorage('verification_banner_dismissed', false);

  // Показываем только если пользователь авторизован, email не верифицирован и баннер не скрыт
  if (!user || user.is_email_verified || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  const handleResendVerification = async () => {
    if (!user?.email) return;
    
    setIsResending(true);
    setResendError(null);
    
    try {
      await resendVerificationEmail(user.email);
      setResendSuccess(true);
      
      // Скрываем сообщение об успехе через 5 секунд
      setTimeout(() => {
        setResendSuccess(false);
      }, 5000);
    } catch (error) {
      setResendError('Не удалось сгенерировать код. Попробуйте позже.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ type: "spring", stiffness: 100, damping: 20 }}
        className="relative z-50 mx-4"
      >
        <Alert className="border-amber-200 bg-amber-50/90 backdrop-blur-sm shadow-sm max-w-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-amber-600 shrink-0" />
            
            <div className="flex-1 min-w-0">
                              <AlertDescription className="text-amber-800 text-sm">
                  <div className="flex items-center gap-2">
                    <span>
                      Email сервис временно недоступен. Коды верификации генерируются в логах сервера.
                          </span>
                  {!resendSuccess && !resendError && !isResending && (
                        <Button
                      variant="ghost"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResending || isLoading}
                      className="h-6 px-2 text-xs text-amber-700 hover:bg-amber-100"
                        >
                          {isResending ? (
                            <>
                              <LoadingSpinner size="sm" className="w-3 h-3 mr-1 inline-block align-middle" />
                          Отправка...
                            </>
                          ) : (
                            <>
                          <RefreshCw className="w-3 h-3 mr-1" />
                          Сгенерировать код
                            </>
                          )}
                        </Button>
                  )}
                </div>
                
                {/* Состояния отправки */}
                <AnimatePresence mode="wait">
                  {resendSuccess && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 text-green-700 text-xs mt-1"
                    >
                      <CheckCircle className="h-3 w-3" />
                      <span>Код сгенерирован в логах сервера!</span>
                    </motion.div>
                  )}
                  {resendError && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-1 text-red-700 text-xs mt-1"
                    >
                      <AlertCircle className="h-3 w-3" />
                      <span>{resendError}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>
              </AlertDescription>
            </div>
            
            {/* Кнопка закрытия */}
              <Button
                variant="ghost"
                size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0 text-amber-600 hover:bg-amber-100"
              >
              <X className="h-3 w-3" />
              </Button>
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}; 