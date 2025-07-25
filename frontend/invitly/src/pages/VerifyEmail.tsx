import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/hooks/use-auth';
import MainLayout from '@/components/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Mail,
  ArrowRight,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

type VerificationState = 'loading' | 'success' | 'error' | 'invalid';

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyEmail, user } = useAuth();
  const [state, setState] = useState<VerificationState>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const token = searchParams.get('token');

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        setState('invalid');
        setErrorMessage(t('auth.verify_email.errors.code_invalid'));
        return;
      }

      try {
        await verifyEmail(token);
        setState('success');
      } catch (error: any) {
        setState('error');
        setErrorMessage(error.message || t('auth.verify_email.errors.network_error'));
      }
    };

    verifyToken();
  }, [token, verifyEmail]);

  const renderContent = () => {
    switch (state) {
      case 'loading':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {t('auth.verify_email.title')}...
              </h2>
              <p className="text-gray-600">
                {t('auth.verify_email.subtitle')}
              </p>
            </div>
          </motion.div>
        );

      case 'success':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                🎉 {t('auth.verify_email.success_message')}!
              </h2>
              <p className="text-gray-600 mb-4">
                {t('auth.verify_email.success_message')}. 
                {t('auth.verify_email.subtitle')}
              </p>
              {user && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                    <Mail className="w-4 h-4" />
                    <span className="font-medium">{user.email}</span>
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                <div className="flex items-center gap-2">
                  <Home className="w-4 h-4" />
                  Перейти на главную
                </div>
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/builder')}
                className="w-full"
                size="lg"
              >
                <div className="flex items-center gap-2">
                  Создать первое приглашение
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Button>
            </div>
          </motion.div>
        );

      case 'error':
      case 'invalid':
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center space-y-6"
          >
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Ошибка верификации
              </h2>
              <p className="text-gray-600 mb-4">
                {errorMessage}
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-red-700">
                  Возможные причины:
                </p>
                <ul className="text-sm text-red-600 mt-2 space-y-1">
                  <li>• Ссылка устарела или недействительна</li>
                  <li>• Email уже был подтвержден ранее</li>
                  <li>• Произошла техническая ошибка</li>
                </ul>
              </div>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={() => navigate('/login')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                size="lg"
              >
                Войти в аккаунт
              </Button>
              <Button 
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full"
                size="lg"
              >
                Вернуться на главную
              </Button>
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 100, 
            damping: 20,
            delay: 0.1
          }}
          className="relative z-10"
        >
          <Card className="w-full max-w-[480px] shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center px-8 py-8">
              <CardTitle className="text-3xl font-bold text-gray-900 mb-2">
                Подтверждение Email
              </CardTitle>
            </CardHeader>
            
            <CardContent className="px-8 py-8">
              {renderContent()}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default VerifyEmail; 