import { useState } from 'react';
import { Link } from 'react-router-dom';
import AuthCanvasBackground from '../components/AuthCanvasBackground';
import Loader from '../components/Loader';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSent(true);
      setLoading(false);
    }, 1200);
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
        <h1 className="text-3xl font-bold mb-2 text-gray-900">Восстановление пароля</h1>
        {/* <p className="mb-6 text-gray-500">Введите email, и мы отправим ссылку для сброса пароля.</p> */}
        {sent ? (
          <div className="text-green-600 text-center mb-4">Письмо отправлено! Проверьте почту.</div>
        ) : (
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
            <button
                  type="submit"
              className="btn btn-primary w-full py-3 rounded-lg font-semibold text-lg bg-indigo-600 hover:bg-indigo-700 text-white transition disabled:opacity-60"
              disabled={loading}
            >
              {loading ? <Loader className="mx-auto" /> : 'Восстановить'}
            </button>
          </form>
        )}
        <div className="flex justify-center w-full mt-4 text-sm">
          <Link to="/login" className="text-gray-600 hover:underline">Вернуться к входу</Link>
              </div>
      </div>
    </div>
  );
} 