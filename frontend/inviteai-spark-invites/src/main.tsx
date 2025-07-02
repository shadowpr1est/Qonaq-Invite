import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initResizeObserverErrorSuppression } from './lib/resizeObserverUtils';
import { initGA } from './lib/analytics';

// Инициализируем Google Analytics
initGA();

// Безопасный обработчик ошибок (предотвращает рекурсию)
const handleError = (error: unknown, errorInfo?: { componentStack: string }) => {
  try {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';
    
    console.error('Application error:', errorMessage);
    if (errorStack) {
      console.error('Stack trace:', errorStack);
    }
    if (errorInfo) {
      console.error('Component stack:', errorInfo.componentStack);
    }
  } catch (loggingError) {
    // Если даже логирование не работает, выводим базовое сообщение
    try {
      console.error('Critical error in error handler');
    } catch {
      // Если совсем ничего не работает, просто молча игнорируем
    }
  }
};

// Инициализируем подавление ResizeObserver ошибок
initResizeObserverErrorSuppression();

// Глобальный обработчик необработанных ошибок
window.addEventListener('error', (event) => {
  // Подавляем ResizeObserver loop ошибки в глобальном обработчике
  const errorMessage = event.error?.message || event.message || '';
  if (typeof errorMessage === 'string' && errorMessage.includes('ResizeObserver loop')) {
    event.preventDefault(); // Предотвращаем показ ошибки в консоли
    return false;
  }
  
  handleError(event.error || event.message);
});

// Обработчик необработанных промисов
window.addEventListener('unhandledrejection', (event) => {
  handleError(event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
