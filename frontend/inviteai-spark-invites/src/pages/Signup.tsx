import { useState } from 'react';
import { useAuth } from '../hooks/use-auth';
import { Link, useNavigate } from 'react-router-dom';
import AuthCanvasBackground from '../components/AuthCanvasBackground';
import Loader from '../components/Loader';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function Signup() {
  const { signup, isLoading, error } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [wasSubmitted, setWasSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWasSubmitted(true);
    if (password !== confirm) return;
    await signup({ name, email, password });
  };

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
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Регистрация</h1>
        {/* <p className="mb-6 text-gray-500">Создайте аккаунт, чтобы начать пользоваться Invitly</p> */}
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit} autoComplete="on">
          <input
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Имя"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          <input
            type="email"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={8}
          />
          <input
            type="password"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white text-gray-900 placeholder-gray-400"
            placeholder="Повторите пароль"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            minLength={8}
          />
          {wasSubmitted && error && <div className="text-red-500 text-sm text-center">{error}</div>}
          {wasSubmitted && password !== confirm && <div className="text-red-500 text-xs text-center">Пароли не совпадают</div>}
          <button
                      type="submit" 
            className="btn btn-primary w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
                      disabled={isLoading}
          >
            {isLoading ? <LoadingSpinner className="mx-auto" /> : 'Зарегистрироваться'}
          </button>
                </form>
        <div className="flex justify-center w-full mt-4 text-sm">
          <Link to="/login" className="text-gray-600 hover:underline">Уже есть аккаунт? Войти</Link>
                </div>
      </div>
    </div>
  );
}
