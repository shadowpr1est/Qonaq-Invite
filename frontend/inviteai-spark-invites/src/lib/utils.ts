import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Production-ready logger that respects environment
class Logger {
  private isDevelopment = import.meta.env.DEV;
  
  info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[INFO] ${message}`, ...args);
    }
  }
  
  error(message: string, error?: Error, ...args: any[]) {
    // Always log errors, even in production
    console.error(`[ERROR] ${message}`, error || '', ...args);
  }
  
  warn(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  }
  
  debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
}

export const logger = new Logger();

/**
 * Обрабатывает ошибки API и возвращает понятные сообщения для пользователей
 */
export function getErrorMessage(error: any, context?: string): string {
  // Если это строка, возвращаем как есть
  if (typeof error === 'string') {
    return error;
  }

  // Если это объект ошибки от API
  if (error?.response?.data?.detail) {
    const detail = error.response.data.detail;
    return translateErrorMessage(detail, context);
  }

  // Если это объект ошибки от нашего API клиента
  if (error?.detail) {
    return translateErrorMessage(error.detail, context);
  }

  // Если это сетевая ошибка
  if (error?.message?.includes('Network Error') || error?.message?.includes('fetch')) {
    return 'Проблемы с подключением к серверу. Проверьте интернет-соединение и попробуйте снова.';
  }

  // Если это таймаут
  if (error?.message?.includes('timeout')) {
    return 'Время ожидания истекло. Попробуйте снова.';
  }

  // Общие HTTP ошибки
  if (error?.status || error?.response?.status) {
    const status = error.status || error.response.status;
    switch (status) {
      case 400:
        return 'Неверные данные. Проверьте введенную информацию.';
      case 401:
        return context === 'login' 
          ? 'Неверный email или пароль. Проверьте данные и попробуйте снова.'
          : 'Необходимо войти в аккаунт.';
      case 403:
        return 'У вас нет прав для выполнения этого действия.';
      case 404:
        return 'Запрашиваемая информация не найдена.';
      case 409:
        return context === 'register' 
          ? 'Пользователь с таким email уже существует.'
          : 'Конфликт данных. Попробуйте снова.';
      case 422:
        return 'Некорректные данные. Проверьте заполнение полей.';
      case 429:
        return 'Слишком много попыток. Подождите немного и попробуйте снова.';
      case 500:
        return 'Ошибка сервера. Мы уже работаем над решением.';
      case 503:
        return 'Сервис временно недоступен. Попробуйте позже.';
      default:
        return 'Произошла неожиданная ошибка. Попробуйте снова.';
    }
  }

  // Если ничего не подошло, возвращаем общее сообщение
  return getDefaultErrorMessage(context);
}

/**
 * Переводит технические сообщения об ошибках в понятные пользователю
 */
function translateErrorMessage(detail: string, context?: string): string {
  const lowerDetail = detail.toLowerCase();

  // Ошибки авторизации
  if (lowerDetail.includes('incorrect email') || lowerDetail.includes('incorrect password')) {
    return 'Неверный email или пароль. Проверьте данные и попробуйте снова.';
  }

  if (lowerDetail.includes('user not found')) {
    return 'Пользователь с таким email не найден.';
  }

  if (lowerDetail.includes('invalid token') || lowerDetail.includes('token expired')) {
    return 'Срок действия ссылки истек. Запросите восстановление пароля заново.';
  }

  // Ошибки регистрации
  if (lowerDetail.includes('already exists') || lowerDetail.includes('already registered')) {
    return 'Пользователь с таким email уже зарегистрирован. Попробуйте войти или используйте другой email.';
  }

  if (lowerDetail.includes('weak password')) {
    return 'Пароль слишком простой. Используйте более сложный пароль.';
  }

  if (lowerDetail.includes('invalid email')) {
    return 'Некорректный формат email адреса.';
  }

  // Ошибки восстановления пароля
  if (lowerDetail.includes('reset token') && lowerDetail.includes('invalid')) {
    return 'Ссылка для восстановления пароля недействительна или устарела.';
  }

  if (lowerDetail.includes('password reset')) {
    return 'Не удалось сбросить пароль. Попробуйте запросить новую ссылку.';
  }

  // Ошибки валидации
  if (lowerDetail.includes('validation')) {
    return 'Некорректно заполнены поля формы. Проверьте введенные данные.';
  }

  if (lowerDetail.includes('required field')) {
    return 'Заполните все обязательные поля.';
  }

  // Если перевод не найден, возвращаем исходное сообщение или дефолтное
  return detail || getDefaultErrorMessage(context);
}

/**
 * Возвращает дефолтное сообщение об ошибке в зависимости от контекста
 */
function getDefaultErrorMessage(context?: string): string {
  switch (context) {
    case 'login':
      return 'Не удалось войти в аккаунт. Проверьте данные и попробуйте снова.';
    case 'register':
      return 'Не удалось создать аккаунт. Попробуйте снова.';
    case 'forgot-password':
      return 'Не удалось отправить инструкции по восстановлению пароля.';
    case 'reset-password':
      return 'Не удалось сбросить пароль. Попробуйте снова.';
    default:
      return 'Произошла ошибка. Попробуйте снова.';
  }
}

/**
 * Проверяет, является ли ошибка сетевой
 */
export function isNetworkError(error: any): boolean {
  return (
    error?.message?.includes('Network Error') ||
    error?.message?.includes('fetch') ||
    error?.code === 'NETWORK_ERROR' ||
    !navigator.onLine
  );
}

/**
 * Возвращает рекомендации по устранению ошибки
 */
export function getErrorSuggestion(error: any, context?: string): string | null {
  if (isNetworkError(error)) {
    return 'Проверьте подключение к интернету и попробуйте снова.';
  }

  const status = error?.status || error?.response?.status;
  
  switch (status) {
    case 401:
      return context === 'login' 
        ? 'Забыли пароль? Воспользуйтесь восстановлением пароля.'
        : 'Попробуйте войти в аккаунт заново.';
    case 409:
      return context === 'register' 
        ? 'Возможно, вы уже регистрировались ранее. Попробуйте войти.'
        : null;
    case 429:
      return 'Подождите несколько минут перед следующей попыткой.';
    case 500:
    case 503:
      return 'Если проблема повторяется, обратитесь в поддержку.';
    default:
      return null;
  }
}
