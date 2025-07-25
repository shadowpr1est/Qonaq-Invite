import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import AuthCanvasBackground from '../components/AuthCanvasBackground';
import Loader from '../components/Loader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useTranslation } from 'react-i18next';
import { ErrorHandler } from '@/lib/errorHandler';
import { apiClient } from '@/lib/api';

export default function Signup() {
  const { signup, isLoading, error, verifyEmailCode, resendVerificationEmail, setUser, user, isInitialized } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Redirect if already authenticated - but only if user came from specific pages
  useEffect(() => {
    if (isInitialized && user) {
      // Check if user came from a specific page that requires dashboard redirect
      const fromPage = new URLSearchParams(window.location.search).get('from');
      if (fromPage === 'dashboard' || fromPage === 'builder') {
      navigate('/dashboard');
      } else {
        // Otherwise, let user stay on current page or go to home
        navigate('/');
      }
    }
  }, [user, isInitialized, navigate]);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);
    if (password !== confirm) return;
    try {
      await signup({ name, email, password });
      setShowVerificationModal(true);
    } catch (error) {
      // Error is already handled by the auth hook
      console.error('Signup failed:', error);
    }
  };

  const handleVerificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setVerificationError('');
    try {
      await verifyEmailCode(email, verificationCode);
      setShowVerificationModal(false);
      // Check if user came from a specific page that requires dashboard redirect
      const fromPage = new URLSearchParams(window.location.search).get('from');
      if (fromPage === 'dashboard' || fromPage === 'builder') {
      navigate('/dashboard');
      } else {
        // Otherwise, let user stay on current page or go to home
        navigate('/');
      }
    } catch (error) {
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setVerificationError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setVerificationCode(value);
    setVerificationError('');
  };

  const handleClassicGoogleLogin = async () => {
    try {
      // Сохраняем текущий язык в URL для восстановления после OAuth
      const currentLang = localStorage.getItem('language') || 'ru';
      const fromPage = new URLSearchParams(window.location.search).get('from');
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/v1/auth/google-login-url?lang=${currentLang}&from=${fromPage || ''}`);
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      ErrorHandler.handleNetworkError(e, t);
    }
  };

  const resendCode = async () => {
    try {
      await resendVerificationEmail(email);
      // Показать уведомление об успешной отправке (можно добавить toast)
    } catch (error) {
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setVerificationError(errorMessage);
    }
  };

  // Don't render if user is already authenticated
  if (!isInitialized) {
    return <Loader />;
  }

  if (user) {
    return <Loader />; // Will redirect to dashboard
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <AuthCanvasBackground />
      <div className="z-10 w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center animate-fade-in border border-gray-100">
        {/* Логотип и текст Invitly: не группировать, минимальный отступ, текст не урезан */}
        <Link to="/" className="mb-10 flex flex-col items-center select-none group">
          <img src="/logo.png" alt="Invitly Logo" className="w-[100px] h-[100px] drop-shadow-lg" />
          <span
            className="block text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-700 bg-clip-text text-transparent leading-[1.2] mt-2 pb-2 group-hover:opacity-90 transition"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, marginTop: '-10px' }}
          >
            Invitly AI
          </span>
        </Link>
        {/* <Link to="/" className="mb-4 text-sm text-gray-400 hover:text-indigo-500 transition-colors">← На главную</Link> */}
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('auth.signup.title')}</h1>
        <div className="w-full flex flex-col gap-2 mb-4">
          <button
            type="button"
            className="w-full h-12 text-base font-medium border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 rounded-lg flex items-center justify-center gap-3 bg-white text-blue-700 font-semibold"
            onClick={handleClassicGoogleLogin}
            disabled={isLoading}
            aria-label="Зарегистрироваться через Google (классический OAuth)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>{t('auth.signup.continue_with_google')}</span>
          </button>
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">{t('auth.signup.or')}</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
        </div>
        {/* <p className="mb-6 text-gray-500">Создайте аккаунт, чтобы начать пользоваться Invitly</p> */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="on">
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder={t('auth.signup.full_name')}
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder={t('auth.signup.email')}
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder={t('auth.signup.password')}
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder={t('auth.signup.confirm_password')}
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
          />
          {wasSubmitted && error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {wasSubmitted && password !== confirm && <div className="text-red-500 text-xs text-center">{t('auth.signup.errors.passwords_not_match')}</div>}
          <button
            type="submit" 
            className="btn btn-primary w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
            disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner size="sm" className="mx-auto" /> : t('auth.signup.signup_button')}
          </button>
        </form>
        <div className="flex justify-center w-full mt-4 text-sm">
          <Link to="/login" className="text-gray-600 hover:underline">{t('auth.signup.have_account')} {t('auth.signup.login_link')}</Link>
        </div>
      </div>

      {/* Модальное окно для верификации */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('auth.verify_email.title')}</h2>
              <p className="text-gray-600 text-sm">
                Мы отправили код подтверждения на<br />
                <span className="font-semibold text-gray-900">{email}</span>
              </p>
            </div>
            
            <form onSubmit={handleVerificationSubmit} className="space-y-4">
              <div>
                <label htmlFor="verification-code" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.verify_email.code')}
                </label>
                <input
                  id="verification-code"
                  type="text"
                  className="w-full px-4 py-3 text-center text-2xl font-mono rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400 tracking-widest"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  maxLength={6}
                  required
                  autoComplete="off"
                  autoFocus
                />
              </div>
              
              {verificationError && (
                <div className="text-red-500 text-sm text-center">{verificationError}</div>
              )}
              
              <button
                type="submit"
                className="w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
                disabled={isVerifying || verificationCode.length !== 6}
              >
                {isVerifying ? <LoadingSpinner className="mx-auto" /> : t('common.confirm')}
              </button>
            </form>
            
            <div className="text-center mt-4 text-sm text-gray-600">
              Не получили код?{' '}
              <button
                onClick={resendCode}
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Отправить повторно
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}