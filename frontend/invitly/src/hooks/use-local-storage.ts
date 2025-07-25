import { useState, useCallback, useEffect } from 'react';

type SetValue<T> = T | ((val: T) => T);

export const useLocalStorage = <T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] => {
  // Состояние для хранения значения
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Получаем значение из localStorage
      const item = window.localStorage.getItem(key);
      // Парсим JSON или возвращаем initialValue, если его нет
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // При ошибке возвращаем initialValue
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Функция для установки значения
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Разрешаем передачу функции как в useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        // Сохраняем в состояние
        setStoredValue(valueToStore);
        // Сохраняем в localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Функция для удаления значения
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      window.localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Слушаем изменения в других вкладках
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}; 