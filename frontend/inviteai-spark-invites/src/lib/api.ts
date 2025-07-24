import { API_BASE_URL } from './constants';
import { tokenManager } from './tokenManager';
import { ErrorHandler } from './errorHandler';
import type { 
  User, 
  LoginRequest, 
  SignupRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest,
  GoogleOAuthRequest,
  AuthResponse,
  EmailVerificationCodeRequest,
  EmailVerificationCodeConfirm,
  PasswordResetCodeRequest,
  PasswordResetCodeConfirm,
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
  message?: string;
  success?: boolean;
  error?: string | ApiError;
}

class ApiClient {
  private baseURL: string;
  public authToken: string | null = null;
  private pendingRequests: Map<string, Promise<any>> = new Map();

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('access_token');
    }
  }

  private async getToken(): Promise<string | null> {
    if (typeof window !== 'undefined') {
      // Автоматически обновляем токен если нужно
      return await tokenManager.ensureValidToken();
    }
    return this.authToken;
  }

  setToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  setTokens(accessToken: string, refreshToken: string) {
    console.log('Setting tokens in apiClient:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
    this.authToken = accessToken;
    tokenManager.setTokens(accessToken, refreshToken);
  }

  removeToken() {
    this.authToken = null;
    tokenManager.clearTokens();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    // Создаем уникальный ключ для запроса
    const requestKey = `${options.method || 'GET'}:${endpoint}:${JSON.stringify(options.body || '')}`;
    
    // Если такой запрос уже выполняется, возвращаем существующий промис
    if (this.pendingRequests.has(requestKey)) {
      return this.pendingRequests.get(requestKey)!;
    }

    // Создаем новый промис для запроса
    const requestPromise = this._makeRequest<T>(endpoint, options, requireAuth);
    this.pendingRequests.set(requestKey, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      // Удаляем запрос из pending после завершения
      this.pendingRequests.delete(requestKey);
    }
  }

  private async _makeRequest<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    console.log('_makeRequest:', { url, requireAuth, method: options.method });
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requireAuth) {
      const token = await this.getToken();
      console.log('_makeRequest token:', { hasToken: !!token });
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      console.log('_makeRequest making fetch to:', url);
      const response = await fetch(url, config);
      console.log('_makeRequest response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('_makeRequest error response:', { status: response.status, data: errorData });
        const error = {
          response: {
            status: response.status,
            data: errorData
          }
        };
        
        // Handle specific error types
        if (ErrorHandler.isNetworkError(error)) {
          throw new Error('Network error');
        }
        
        if (ErrorHandler.isAuthError(error)) {
          // Handle auth errors - redirect to login
          this.removeToken();
          window.location.href = '/login';
          throw error;
        }
        
        throw error;
      }

      const data = await response.json();
      console.log('_makeRequest success data:', data);
      return data;
    } catch (error) {
      console.error('_makeRequest catch error:', error);
      // Re-throw the error for handling by the calling code
      throw error;
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request('/v1/auth/forgot-password-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request('/v1/auth/reset-password-with-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Google OAuth
  async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
    return this.request('/v1/auth/google-oauth', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Email Verification (Legacy)
  async verifyEmail(token: string): Promise<{ message: string; success: boolean }> {
    return this.request('/v1/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false);
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request('/v1/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  // ========================================================================
  // 6-DIGIT CODE METHODS (NEW)
  // ========================================================================

  // Email Verification with 6-digit Code
  async requestVerificationCode(data: EmailVerificationCodeRequest): Promise<{ message: string; success: boolean }> {
    return this.request('/v1/auth/resend-verification-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async verifyEmailCode(data: EmailVerificationCodeConfirm): Promise<{ message: string; success: boolean }> {
    return this.request('/v1/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Password Reset with 6-digit Code
  async requestPasswordResetCode(data: PasswordResetCodeRequest): Promise<{ message: string; success: boolean }> {
    return this.request('/v1/auth/forgot-password-request', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async resetPasswordWithCode(data: PasswordResetCodeConfirm): Promise<{ message: string; success: boolean }> {
    return this.request('/v1/auth/reset-password-with-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // User Methods
  private getUserPromise: Promise<User> | null = null;
  private getUserPromiseTime: number = 0;

  async getCurrentUser(): Promise<User> {
    console.log('getCurrentUser called');
    const now = Date.now();
    const cacheTime = 5000; // 5 секунд кэш

    // Если есть активный запрос и он не старше 5 секунд, возвращаем его
    if (this.getUserPromise && (now - this.getUserPromiseTime) < cacheTime) {
      console.log('Returning cached user promise');
      return this.getUserPromise;
    }

    // Создаем новый запрос
    console.log('Making new user request to /v1/auth/me');
    this.getUserPromise = this.request('/v1/auth/me');
    this.getUserPromiseTime = now;

    try {
      const result = await this.getUserPromise;
      console.log('getCurrentUser result:', result);
      return result;
    } catch (error) {
      console.error('getCurrentUser error:', error);
      // Очищаем промис при ошибке
      this.getUserPromise = null;
      throw error;
    }
  }

  async updateProfile(data: { name: string; bio?: string }): Promise<{ data?: User; error?: ApiError }> {
    try {
      const user = await this.request<User>('/v1/user/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return { data: user };
    } catch (error) {
      return { error: { detail: error instanceof Error ? error.message : 'Ошибка обновления профиля' } };
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ data?: { message: string }; error?: ApiError }> {
    try {
      const result = await this.request<{ message: string }>('/v1/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
      });
      return { data: result };
    } catch (error) {
      return { error: { detail: error instanceof Error ? error.message : 'Ошибка изменения пароля' } };
    }
  }

  async getStats(): Promise<{ data?: any; error?: ApiError }> {
    try {
      // Заглушка для статистики - можно реализовать позже
      const stats = {
        total_analyses: 0,
        completed_analyses: 0,
        average_score: 0,
        total_practice_time: 0,
        current_streak: 0,
        best_streak: 0,
        improvement_rate: 0,
        join_date: new Date().toISOString(),
      };
      return { data: stats };
    } catch (error) {
      return { error: { detail: error instanceof Error ? error.message : 'Ошибка загрузки статистики' } };
    }
  }

  async getSiteStats(siteId: string): Promise<{ data?: any; error?: ApiError }> {
    try {
      const response = await this.request(`/v1/sites/${siteId}/stats`, {
        method: 'GET',
      });
      return { data: response };
    } catch (error: any) {
      return { error: { detail: error instanceof Error ? error.message : 'Ошибка загрузки статистики сайта' } };
    }
  }

  // Site Generation Methods
  async generateSite(data: SiteGenerationRequest): Promise<GeneratedSite> {
    return this.request('/v1/sites/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async generateSiteWithStatus(
    data: SiteGenerationRequest,
    onStatusUpdate?: (status: GenerationStatus) => void
  ): Promise<GeneratedSite> {
    const generationId = Math.random().toString(36).substring(7);
    
    // Create WebSocket connection for status updates
    if (onStatusUpdate) {
      const token = this.getToken();
      if (!token) {
          console.error("No auth token found for WebSocket connection.");
          // Optionally, reject the promise or handle the unauthenticated state
          return Promise.reject(new Error("Authentication token is not available."));
      }

      const wsUrl = `${this.baseURL.replace(/^http/, 'ws')}/v1/sites/generation-status/${generationId}?token=${token}`;
      const ws = new WebSocket(wsUrl);
      
      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          if (message.type === 'status_update' && message.data) {
            onStatusUpdate(message.data);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      // Clean up WebSocket after generation
      setTimeout(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.close();
        }
      }, 60000); // Close after 60 seconds
    }
    
    // Make the generation request with generation_id
    return this.request(`/v1/sites/generate?generation_id=${generationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserSites(page: number = 1, limit: number = 10): Promise<UserSitesResponse> {
    return this.request(`/v1/sites/my-sites?skip=${(page - 1) * limit}&limit=${limit}`);
  }

  async getSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/v1/sites/${siteId}`);
  }

  async updateSite(siteId: string, data: SiteUpdate): Promise<GeneratedSite> {
    return this.request(`/v1/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSite(siteId: string): Promise<{ message: string }> {
    return this.request(`/v1/sites/${siteId}`, {
      method: 'DELETE',
    });
  }

  async publishSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/v1/sites/${siteId}/publish`, {
      method: 'POST',
    });
  }

  async unpublishSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/v1/sites/${siteId}/unpublish`, {
      method: 'POST',
    });
  }

  // Analytics Methods
  async trackEvent(data: AnalyticsEvent): Promise<{ success: boolean }> {
    return this.request('/v1/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Generation Status
  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    return this.request(`/v1/sites/task/${taskId}`);
  }

  // Public site access (no auth required)
  async getPublicSite(slug: string): Promise<GeneratedSite> {
    return this.request(`/v1/sites/public/${slug}`, {}, false);
  }

  async incrementSiteView(siteId: string): Promise<{ success: boolean }> {
    return this.request(`/v1/sites/${siteId}/view`, {
      method: 'POST',
    }, false);
  }

  // RSVP
  async sendRSVP(siteId: string, data: { guest_name?: string; guest_email?: string; response: string; comment?: string }): Promise<any> {
    return this.request(`/v1/sites/${siteId}/rsvp`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Utility methods
  logout() {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    // Проверяем токен в памяти и в localStorage
    const hasAuthToken = !!this.authToken;
    const hasLocalToken = typeof window !== 'undefined' && !!localStorage.getItem('access_token');
    
    console.log('isAuthenticated check:', { hasAuthToken, hasLocalToken });
    
    if (this.authToken) return true;
    if (typeof window !== 'undefined') {
      const localToken = localStorage.getItem('access_token');
      return !!localToken;
    }
    return false;
  }

  // Helper method for non-JSON requests
  async requestFile(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string> || {}),
    };

    if (requireAuth && this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.blob();
  }
}

export const apiClient = new ApiClient();

// Backward compatibility - alias для старого API
export const userApi = apiClient; 