import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { 
  Mail, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  X,
  RefreshCw
} from 'lucide-react';

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

  // Показываем только если пользователь авторизован и email не верифицирован
  if (!user || user.is_email_verified) {
    return null;
  }

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
      setResendError('Не удалось отправить письмо. Попробуйте позже.');
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
        className="relative z-50"
      >
        <Alert className="border-amber-200 bg-amber-50 shadow-md">
          <div className="flex items-start gap-3">
            <Mail className="h-5 w-5 text-amber-600 mt-0.5" />
            
            <div className="flex-1 min-w-0">
              <AlertDescription className="text-amber-800">
                <div className="space-y-2">
                  <div className="font-medium">
                    📧 Подтвердите ваш email адрес
                  </div>
                  <div className="text-sm">
                    Мы отправили письмо с подтверждением на{' '}
                    <span className="font-medium">{user.email}</span>.
                    Пожалуйста, проверьте почту и перейдите по ссылке для активации аккаунта.
                  </div>
                  
                  {/* Состояния отправки */}
                  <AnimatePresence mode="wait">
                    {resendSuccess ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 text-green-700 bg-green-100 px-3 py-2 rounded-md"
                      >
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Письмо отправлено повторно!
                        </span>
                      </motion.div>
                    ) : resendError ? (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex items-center gap-2 text-red-700 bg-red-100 px-3 py-2 rounded-md"
                      >
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{resendError}</span>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-3 pt-1"
                      >
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleResendVerification}
                          disabled={isResending || isLoading}
                          className="h-8 text-amber-700 border-amber-300 hover:bg-amber-100"
                        >
                          {isResending ? (
                            <>
                              <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                              Отправляем...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="w-3 h-3 mr-2" />
                              Отправить повторно
                            </>
                          )}
                        </Button>
                        
                        <span className="text-xs text-amber-600">
                          Не получили письмо? Проверьте спам.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </AlertDescription>
            </div>
            
            {/* Кнопка закрытия */}
            {onDismiss && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0 text-amber-600 hover:bg-amber-100"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Alert>
      </motion.div>
    </AnimatePresence>
  );
}; 