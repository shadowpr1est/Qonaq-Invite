import { API_BASE_URL } from './constants';
import type { 
  User, 
  LoginRequest, 
  SignupRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
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
    const generationId = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Создаем WebSocket соединение для статусов
    const wsUrl = this.baseURL.replace('http://', 'ws://').replace('https://', 'wss://');
    const websocket = new WebSocket(`${wsUrl}/sites/generation-status/${generationId}`);
    
    return new Promise((resolve, reject) => {
      let siteGeneration: Promise<GeneratedSite>;
      
      websocket.onopen = () => {
        // Запускаем генерацию с передачей generation_id как query параметр
        siteGeneration = this.request(`/sites/generate?generation_id=${generationId}`, {
          method: 'POST',
          body: JSON.stringify(request),
        });
        
        siteGeneration.then(resolve).catch(reject);
      };
      
      websocket.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status_update') {
            onStatusUpdate(message.data);
          }
        } catch (error) {
          // Suppress WebSocket parsing errors in production
          if (import.meta.env.DEV) {
            console.error('Error parsing WebSocket message:', error);
          }
        }
      };
      
      websocket.onerror = (error) => {
        if (import.meta.env.DEV) {
          console.error('WebSocket error:', error);
        }
        // Если WebSocket не работает, используем обычную генерацию
        if (!siteGeneration) {
          siteGeneration = this.generateSite(request);
          siteGeneration.then(resolve).catch(reject);
        }
      };
      
      websocket.onclose = () => {
        // WebSocket закрыт, ничего не делаем если генерация уже завершена
      };
      
      // Таймаут для WebSocket соединения
      setTimeout(() => {
        if (websocket.readyState === WebSocket.CONNECTING) {
          websocket.close();
          if (!siteGeneration) {
            siteGeneration = this.generateSite(request);
            siteGeneration.then(resolve).catch(reject);
          }
        }
      }, 5000);
    });
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