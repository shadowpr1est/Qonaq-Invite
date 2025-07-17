import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import AuthCanvasBackground from '../components/AuthCanvasBackground';
import Loader from '../components/Loader';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { apiClient } from '@/lib/api';

export default function Login() {
  const { login, isLoading, error, googleOAuth, setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  // Classic OAuth: handle tokens in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');
    if (accessToken && refreshToken) {
      // Save tokens and fetch user info
      apiClient.setToken(accessToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', refreshToken);
      }
      // Optionally, fetch user info and set user
      apiClient.getCurrentUser().then(user => {
        setUser && setUser(user);
        window.location.replace('/dashboard');
      });
    }
  }, []);

  // Classic OAuth button handler
  const handleClassicGoogleLogin = async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL}/auth/google-login-url`);
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      alert('Ошибка Google OAuth: не удалось получить ссылку входа.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login({ email, password });
    navigate('/dashboard');
  };

    return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <AuthCanvasBackground />
      <div className="z-10 w-full max-w-md mx-auto p-8 bg-white rounded-2xl shadow-xl flex flex-col items-center animate-fade-in border border-gray-100">
        <Link to="/" className="mb-10 flex flex-col items-center select-none group">
          <img src="/logo.png" alt="Invitly Logo" className="w-[100px] h-[100px] drop-shadow-lg" />
          <span
            className="block text-4xl font-extrabold bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-700 bg-clip-text text-transparent leading-[1.2] mt-2 pb-2 group-hover:opacity-90 transition"
            style={{ fontFamily: 'Manrope, sans-serif', fontWeight: 800, letterSpacing: '0.04em', marginTop: '-10px' }}
          >
            Invitly AI
          </span>
        </Link>
        {/* <Link to="/" className="mb-4 text-sm text-gray-400 hover:text-indigo-500 transition-colors">← На главную</Link> */}
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Вход</h1>
        <div className="w-full flex flex-col gap-2 mb-4">
          <button
            type="button"
            className="w-full h-12 text-base font-medium border-2 border-blue-200 hover:border-blue-400 transition-all duration-200 rounded-lg flex items-center justify-center gap-3 bg-white text-blue-700 font-semibold"
            onClick={handleClassicGoogleLogin}
            disabled={isLoading}
            aria-label="Войти через Google (классический OAuth)"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span>Войти через Google</span>
          </button>
          <div className="flex items-center my-2">
            <div className="flex-grow h-px bg-gray-200" />
            <span className="mx-2 text-gray-400 text-xs">или</span>
            <div className="flex-grow h-px bg-gray-200" />
          </div>
        </div>
        {/* <p className="mb-6 text-gray-500">Добро пожаловать! Введите email и пароль.</p> */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="on">
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <button
                      type="submit" 
            className="btn btn-primary w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
                      disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner className="mx-auto" /> : 'Войти'}
          </button>
                </form>
        <div className="flex justify-between w-full mt-4 text-sm">
          <Link to="/forgot-password" className="text-indigo-600 hover:underline">Забыли пароль?</Link>
          <Link to="/signup" className="text-gray-600 hover:underline">Регистрация</Link>
                </div>
      </div>
    </div>
  );
}
