import { API_BASE_URL } from './constants';
import type { 
  User, 
  LoginRequest, 
  SignupRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  GoogleOAuthRequest,
  AuthResponse,
  SiteGenerationRequest,
  GeneratedSite,
  UserSitesResponse,
  SiteUpdate,
  SiteStatistics,
  AnalyticsEvent,
  GenerationStatus
} from './types';

// Интерфейсы для API ответов
export interface ApiError {
  detail: string;
  status_code?: number;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: ApiError;
}

class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('access_token');
    }
  }

  public setToken(token: string | null) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('access_token', token);
      } else {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = 'Произошла ошибка';
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorData.message || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        throw new Error(errorMessage);
      }

      return response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Неизвестная ошибка сети');
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async signup(data: SignupRequest): Promise<{ access_token: string; refresh_token: string; user: User }> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request('/auth/profile');
  }

  // Google OAuth
  async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
    return this.request('/auth/google-oauth', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Email Verification
  async verifyEmail(token: string): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  }

  async resendVerificationEmail(email: string): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Refresh Token
  async refreshToken(refreshToken: string): Promise<{ access_token: string; refresh_token: string }> {
    return this.request(`/auth/refresh?refresh_token=${refreshToken}`, {
      method: 'POST',
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Sites endpoints
  async generateSite(request: SiteGenerationRequest): Promise<GeneratedSite> {
    return this.request('/sites/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Enhanced generation with real-time status
  async generateSiteWithStatus(
    request: SiteGenerationRequest,
    onStatusUpdate: (status: GenerationStatus) => void
  ): Promise<GeneratedSite> {
    // Имитация реалистичного прогресса
    const simulateProgress = async () => {
      const steps = [
        { progress: 5, message: 'Инициализация генерации...', delay: 500 },
        { progress: 15, message: 'Анализ типа события...', delay: 800 },
        { progress: 25, message: 'Подбор цветовой схемы...', delay: 1000 },
        { progress: 40, message: 'Создание структуры сайта...', delay: 1200 },
        { progress: 55, message: 'Генерация контента...', delay: 1500 },
        { progress: 70, message: 'Применение дизайна...', delay: 1000 },
        { progress: 85, message: 'Оптимизация для мобильных...', delay: 800 },
        { progress: 95, message: 'Финальная обработка...', delay: 600 },
      ];

      for (const step of steps) {
        await new Promise(resolve => setTimeout(resolve, step.delay));
        onStatusUpdate({
          step: step.message,
          progress: step.progress,
          message: step.message
        });
        }
      };
      
    // Запускаем имитацию прогресса
    const progressSimulation = simulateProgress();
    
    try {
      // Запускаем реальную генерацию
      const result = await this.generateSite(request);
      
      // Дожидаемся завершения имитации прогресса
      await progressSimulation;
      
      // Финальное обновление
      onStatusUpdate({
        step: 'completed',
        progress: 100,
        message: 'Сайт готов!'
      });

      // Небольшая задержка перед возвратом результата
      await new Promise(resolve => setTimeout(resolve, 500));
      
      return result;
    } catch (error) {
      onStatusUpdate({
        step: 'error',
        progress: 0,
        message: 'Ошибка генерации'
      });
      throw error;
    }
  }

  async getMySites(skip: number = 0, limit: number = 100): Promise<UserSitesResponse> {
    return this.request(`/sites/my-sites?skip=${skip}&limit=${limit}`);
  }

  async getSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}`);
  }

  async updateSite(siteId: string, update: SiteUpdate): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(update),
    });
  }

  async deleteSite(siteId: string): Promise<{ message: string }> {
    return this.request(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  }

  async getSiteStatistics(siteId: string): Promise<SiteStatistics> {
    return this.request(`/sites/${siteId}/statistics`);
  }

  // Public endpoints (no auth required)
  async getPublicSite(slug: string): Promise<string> {
    const response = await fetch(`${this.baseURL}/sites/public/${slug}`);
    if (!response.ok) {
      throw new Error('Сайт не найден');
    }
    return response.text();
  }

  // ANALYTICS - DISABLED
  // async recordAnalytics(slug: string, event: AnalyticsEvent): Promise<void> {
  //   try {
  //     await fetch(`${this.baseURL}/sites/public/${slug}/analytics`, {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(event),
  //     });
  //   } catch (error) {
  //     // Silently fail analytics - don't break user experience
  //     console.warn('Failed to record analytics:', error);
  //   }
  // }
  
  // Stub function to prevent errors
  async recordAnalytics(slug: string, event: AnalyticsEvent): Promise<void> {
    // Analytics disabled - do nothing
    if (import.meta.env.DEV) {
      console.log('Analytics disabled:', slug, event);
    }
  }

  // Utility methods
  logout() {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  getToken(): string | null {
    return this.authToken;
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export individual functions for easier usage
export const {
  login,
  signup,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  updateProfile,
  generateSite,
  getMySites,
  getSite,
  updateSite,
  deleteSite,
  getSiteStatistics,
  getPublicSite,
  recordAnalytics,
  logout,
  isAuthenticated,
  setToken,
} = apiClient;

// Вспомогательные функции для конкретных API endpoints
export const authApi = {
  login: (email: string, password: string) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    return apiClient.postForm('/auth/login', formData, false);
  },
  
  register: (name: string, email: string, password: string) => 
    apiClient.post('/auth/register', { name, email, password, confirmPassword: password }, false),
  
  logout: () => apiClient.post('/auth/logout'),
  
  refreshToken: (refreshToken: string) => 
    apiClient.post('/auth/refresh', { refresh_token: refreshToken }, false),
  
  getProfile: () => apiClient.get('/auth/profile'),
};

export const userApi = {
  getProfile: () => apiClient.get('/user/profile'),
  updateProfile: (data: any) => apiClient.put('/user/profile', data),
  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return apiClient.postForm('/user/avatar', formData);
  },
  getStats: () => apiClient.get('/user/stats'),
  changePassword: (currentPassword: string, newPassword: string) => 
    apiClient.post('/user/change-password', { currentPassword, newPassword }),
}; 