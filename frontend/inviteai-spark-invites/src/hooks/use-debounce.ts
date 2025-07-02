import { useState, useEffect } from 'react';

export const useDebounce = <T>(value: T, delay: number): T => {
  // Состояние для хранения дебаунсированного значения
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Устанавливаем дебаунсированное значение после задержки
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Очищаем таймаут при изменении value или delay
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Перезапускаем только при изменении value или delay

  return debouncedValue;
}; 