import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import { ErrorHandler } from '@/lib/errorHandler';
import { useTranslation } from 'react-i18next';
import type { 
  User, 
  LoginRequest, 
  SignupRequest, 
  GoogleOAuthRequest,
  EmailVerificationCodeRequest,
  EmailVerificationCodeConfirm,
  PasswordResetCodeRequest,
  PasswordResetCodeConfirm
} from '@/lib/types';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  googleOAuth: (data: GoogleOAuthRequest) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  resendVerificationEmail: (email: string) => Promise<void>;
  // New 6-digit code methods
  requestVerificationCode: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  requestPasswordResetCode: (email: string) => Promise<void>;
  resetPasswordWithCode: (email: string, code: string, newPassword: string) => Promise<void>;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('Initializing auth...');
      try {
        const isAuth = apiClient.isAuthenticated();
        console.log('isAuthenticated check result:', isAuth);
        
        if (isAuth) {
          console.log('User is authenticated, fetching user data...');
          const userData = await apiClient.getCurrentUser();
          console.log('User data fetched:', userData);
          setUser(userData);
        } else {
          console.log('User is not authenticated');
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          response: error.response
        });
        // Не выкидываем пользователя при ошибке инициализации
        // Просто очищаем токены и продолжаем
        apiClient.removeToken();
      } finally {
        console.log('Auth initialization complete');
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    setUser(null);
    setError(null);
  };

  const clearError = (): void => {
    setError(null);
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.login(credentials);
      
      // Set tokens in API client
      apiClient.setTokens(response.access_token, response.refresh_token);
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (data: SignupRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.signup(data);
      
      // Set tokens in API client
      apiClient.setTokens(response.access_token, response.refresh_token);
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
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
    try {
      const response = await apiClient.googleOAuth(data);
      
      // Set tokens in API client
      apiClient.setTokens(response.access_token, response.refresh_token);
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Google OAuth failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmail = async (token: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.verifyEmail(token);
      
      // Update email verification status for current user
      if (user) {
        setUser({ ...user, is_email_verified: true });
      }
    } catch (error) {
      console.error('Email verification failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerificationEmail = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.resendVerificationEmail(email);
    } catch (error) {
      console.error('Resend verification failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ========================================================================
  // 6-DIGIT CODE METHODS (NEW)
  // ========================================================================

  const requestVerificationCode = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.requestVerificationCode({ email });
    } catch (error) {
      console.error('Request verification code failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.verifyEmailCode({ email, code });
      
      // Update email verification status for current user
      if (user) {
        setUser({ ...user, is_email_verified: true });
      }
    } catch (error) {
      console.error('Email code verification failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordResetCode = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.requestPasswordResetCode({ email });
    } catch (error) {
      console.error('Request password reset code failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      await apiClient.resetPasswordWithCode({ email, code, new_password: newPassword });
    } catch (error) {
      console.error('Reset password with code failed:', error);
      const errorMessage = ErrorHandler.handleAuthError(error, t, false);
      setError(errorMessage);
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
    requestVerificationCode,
    verifyEmailCode,
    requestPasswordResetCode,
    resetPasswordWithCode,
    logout,
    updateUser,
    isLoading,
    isInitialized,
    error,
    clearError,
    setUser,
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