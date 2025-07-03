import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { User, LoginRequest, SignupRequest, GoogleOAuthRequest } from '@/lib/types';
import { useNavigate } from 'react-router-dom';
import { getErrorMessage, getErrorSuggestion } from '@/lib/utils';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  googleOAuth: (data: GoogleOAuthRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  errorSuggestion: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API базовый URL будет использоваться из api.ts

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const navigate = useNavigate();

  // Инициализация - проверка сохраненного токена
  useEffect(() => {
    const initializeAuth = async () => {
      const token = apiClient.getToken();
      
      if (token) {
        try {
          setIsLoading(true);
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
        } catch (error) {
          console.error('Ошибка проверки токена:', error);
          // Токен невалиден, удаляем его
          apiClient.logout();
        } finally {
          setIsLoading(false);
        }
      }
      
      setIsInitialized(true);
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
  };

  const clearError = () => {
    setError(null);
    setErrorSuggestion(null);
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      const response = await apiClient.login(credentials);
      
      // Устанавливаем токен в API клиенте
      apiClient.setToken(response.access_token);
      
      // Сохраняем refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Устанавливаем пользователя
      setUser(response.user);
    } catch (error) {
      console.error('Ошибка входа:', error);
      const errorMessage = getErrorMessage(error, 'login');
      const suggestion = getErrorSuggestion(error, 'login');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      const response = await apiClient.signup(data);
      
      // Устанавливаем токен в API клиенте
      apiClient.setToken(response.access_token);
      
      // Сохраняем refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Устанавливаем пользователя
      setUser(response.user);
    } catch (error) {
      console.error('Ошибка регистрации:', error);
      const errorMessage = getErrorMessage(error, 'register');
      const suggestion = getErrorSuggestion(error, 'register');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    apiClient.logout();
    clearAuthData();
    navigate('/');
  };

  const googleOAuth = async (data: GoogleOAuthRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      const response = await apiClient.googleOAuth(data);
      
      // Устанавливаем токен в API клиенте
      apiClient.setToken(response.access_token);
      
      // Сохраняем refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Устанавливаем пользователя
      setUser(response.user);
    } catch (error) {
      console.error('Ошибка Google OAuth:', error);
      const errorMessage = getErrorMessage(error, 'oauth');
      const suggestion = getErrorSuggestion(error, 'oauth');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      await apiClient.verifyEmail(token);
      
      // Обновляем статус верификации у текущего пользователя
      if (user) {
        setUser({ ...user, is_email_verified: true });
      }
    } catch (error) {
      console.error('Ошибка верификации email:', error);
      const errorMessage = getErrorMessage(error, 'verify-email');
      const suggestion = getErrorSuggestion(error, 'verify-email');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      await apiClient.resendVerificationEmail(email);
    } catch (error) {
      console.error('Ошибка повторной отправки:', error);
      const errorMessage = getErrorMessage(error, 'resend-verification');
      const suggestion = getErrorSuggestion(error, 'resend-verification');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = (updates: Partial<User>): void => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    googleOAuth,
    verifyEmail,
    resendVerificationEmail,
    logout,
    updateUser,
    isLoading,
    isInitialized,
    error,
    errorSuggestion,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 