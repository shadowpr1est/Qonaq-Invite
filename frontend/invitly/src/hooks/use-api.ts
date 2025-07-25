import { useState, useCallback } from 'react';
import { useQuery, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: any;
}

const baseUrl = import.meta.env.VITE_API_URL || '/api';

// Базовая функция для API запросов
const apiRequest = async <T>(
  url: string, 
  options?: RequestInit
): Promise<T> => {
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError({
      message: errorData.message || `HTTP error! status: ${response.status}`,
      status: response.status,
      code: errorData.code,
    });
  }

  return response.json();
};

// Хук для GET запросов
export const useApiQuery = <T>(
  key: string[],
  url: string,
  options?: Omit<UseQueryOptions<T, ApiError>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<T, ApiError>({
    queryKey: key,
    queryFn: () => apiRequest<T>(url),
    ...options,
  });
};

// Хук для POST/PUT/DELETE запросов
export const useApiMutation = <TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseMutationOptions<TData, ApiError, TVariables>
) => {
  return useMutation<TData, ApiError, TVariables>({
    mutationFn,
    ...options,
  });
};

// Специализированные хуки для auth
export const useAuthApi = () => {
  const login = useApiMutation(
    async (credentials: { email: string; password: string }) => 
      apiRequest<{ token: string; user: any }>('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      })
  );

  const register = useApiMutation(
    async (userData: { name: string; email: string; password: string }) =>
      apiRequest<{ message: string }>('/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
      })
  );

  return { login, register };
};

// Хук для обработки ошибок
export const useErrorHandler = () => {
  const [error, setError] = useState<ApiError | null>(null);

  const handleError = useCallback((error: ApiError) => {
    setError(error);
    console.error('API Error:', error);
    
    // Здесь можно добавить логику для показа уведомлений
    // toast.error(error.message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, handleError, clearError };
}; 