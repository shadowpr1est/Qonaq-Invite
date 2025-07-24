import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCanvasBackground from '../components/AuthCanvasBackground';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { apiClient } from '@/lib/api';
import { useTranslation } from 'react-i18next';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiClient.forgotPassword({ email });
      setSent(true);
    } catch {
      // Можно добавить обработку ошибок
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <AuthCanvasBackground />
      <div className="z-10 w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center animate-fade-in border border-gray-100">
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900">{t('auth.forgot_password.title')}</h1>
        {/* <p className="mb-6 text-gray-500">Введите email, и мы отправим ссылку для сброса пароля.</p> */}
        {sent ? (
          <div className="text-green-600 text-center mb-4">{t('auth.forgot_password.success_message')}</div>
        ) : (
          <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="on">
            <input
                  type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
                             placeholder={t('auth.forgot_password.email')}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoFocus
            />
            <button
                  type="submit"
              className="btn btn-primary w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
              disabled={loading}
            >
                             {loading ? <LoadingSpinner className="mx-auto" /> : t('auth.forgot_password.reset_button')}
            </button>
          </form>
        )}
        <div className="flex justify-center w-full mt-4 text-sm">
                     <Link to="/login" className="text-gray-600 hover:underline">{t('auth.forgot_password.back_to_login')}</Link>
              </div>
      </div>
    </div>
  );
} 