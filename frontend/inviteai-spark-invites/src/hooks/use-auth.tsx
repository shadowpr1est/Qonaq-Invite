import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
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
import { getErrorMessage, getErrorSuggestion } from '@/lib/utils';

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
  errorSuggestion: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorSuggestion, setErrorSuggestion] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize auth state on mount
  useEffect(() => {
    const initializeAuth = async () => {
        try {
        if (apiClient.isAuthenticated()) {
          const userData = await apiClient.getCurrentUser();
          setUser(userData);
        }
        } catch (error) {
        console.error('Failed to initialize auth:', error);
          apiClient.logout();
        } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
  }, []);

  const clearAuthData = () => {
    setUser(null);
    setError(null);
    setErrorSuggestion(null);
  };

  const clearError = (): void => {
    setError(null);
    setErrorSuggestion(null);
  };

  const login = async (credentials: LoginRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      const response = await apiClient.login(credentials);
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Save refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Login failed:', error);
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
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Save refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Signup failed:', error);
      const errorMessage = getErrorMessage(error, 'signup');
      const suggestion = getErrorSuggestion(error, 'signup');
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
      
      // Set token in API client
      apiClient.setToken(response.access_token);
      
      // Save refresh token
      if (typeof window !== 'undefined') {
        localStorage.setItem('refresh_token', response.refresh_token);
      }
      
      // Set user
      setUser(response.user);
    } catch (error) {
      console.error('Google OAuth failed:', error);
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
      
      // Update email verification status for current user
      if (user) {
        setUser({ ...user, is_email_verified: true });
      }
    } catch (error) {
      console.error('Email verification failed:', error);
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
      console.error('Resend verification failed:', error);
      const errorMessage = getErrorMessage(error, 'resend-verification');
      const suggestion = getErrorSuggestion(error, 'resend-verification');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
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
    setErrorSuggestion(null);
    try {
      await apiClient.requestVerificationCode({ email });
    } catch (error) {
      console.error('Request verification code failed:', error);
      const errorMessage = getErrorMessage(error, 'request-verification-code');
      const suggestion = getErrorSuggestion(error, 'request-verification-code');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyEmailCode = async (email: string, code: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      await apiClient.verifyEmailCode({ email, code });
      
      // Update email verification status for current user
      if (user) {
        setUser({ ...user, is_email_verified: true });
      }
    } catch (error) {
      console.error('Email code verification failed:', error);
      const errorMessage = getErrorMessage(error, 'verify-email-code');
      const suggestion = getErrorSuggestion(error, 'verify-email-code');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const requestPasswordResetCode = async (email: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      await apiClient.requestPasswordResetCode({ email });
    } catch (error) {
      console.error('Request password reset code failed:', error);
      const errorMessage = getErrorMessage(error, 'request-password-reset-code');
      const suggestion = getErrorSuggestion(error, 'request-password-reset-code');
      setError(errorMessage);
      setErrorSuggestion(suggestion);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const resetPasswordWithCode = async (email: string, code: string, newPassword: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    setErrorSuggestion(null);
    try {
      await apiClient.resetPasswordWithCode({ email, code, new_password: newPassword });
    } catch (error) {
      console.error('Reset password with code failed:', error);
      const errorMessage = getErrorMessage(error, 'reset-password-with-code');
      const suggestion = getErrorSuggestion(error, 'reset-password-with-code');
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
    requestVerificationCode,
    verifyEmailCode,
    requestPasswordResetCode,
    resetPasswordWithCode,
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