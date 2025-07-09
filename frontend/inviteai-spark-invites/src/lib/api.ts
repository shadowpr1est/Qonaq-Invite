import { API_BASE_URL } from './constants';
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

  constructor() {
    this.baseURL = API_BASE_URL;
    this.loadToken();
  }

  private loadToken() {
    if (typeof window !== 'undefined') {
      this.authToken = localStorage.getItem('access_token');
    }
  }

  setToken(token: string) {
    this.authToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  removeToken() {
    this.authToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (requireAuth && this.authToken) {
      headers.Authorization = `Bearer ${this.authToken}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          detail: `HTTP ${response.status}: ${response.statusText}`
        }));
        
        throw {
          status: response.status,
          message: errorData.detail || errorData.message || 'Network error',
          data: errorData
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      if (error.status) {
        throw error;
      }
      throw {
        status: 0,
        message: 'Network error or server unavailable',
        data: null
      };
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }, false);
  }

  async signup(data: SignupRequest): Promise<AuthResponse> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async forgotPassword(data: ForgotPasswordRequest): Promise<{ message: string }> {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async resetPassword(data: ResetPasswordRequest): Promise<{ message: string }> {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Google OAuth
  async googleOAuth(data: GoogleOAuthRequest): Promise<AuthResponse> {
    return this.request('/auth/google-oauth', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Email Verification (Legacy)
  async verifyEmail(token: string): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }, false);
  }

  async resendVerificationEmail(email: string): Promise<{ message: string }> {
    return this.request('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    }, false);
  }

  // ========================================================================
  // 6-DIGIT CODE METHODS (NEW)
  // ========================================================================

  // Email Verification with 6-digit Code
  async requestVerificationCode(data: EmailVerificationCodeRequest): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/request-verification-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async verifyEmailCode(data: EmailVerificationCodeConfirm): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/verify-email-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Password Reset with 6-digit Code
  async requestPasswordResetCode(data: PasswordResetCodeRequest): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/request-password-reset-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  async resetPasswordWithCode(data: PasswordResetCodeConfirm): Promise<{ message: string; success: boolean }> {
    return this.request('/auth/reset-password-with-code', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // User Methods
  async getCurrentUser(): Promise<User> {
    return this.request('/auth/me');
  }

  // Site Generation Methods
  async generateSite(data: SiteGenerationRequest): Promise<GeneratedSite> {
    return this.request('/sites/generate', {
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
      const wsUrl = `${this.baseURL.replace('http', 'ws')}/sites/generation-status/${generationId}`;
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
    return this.request(`/sites/generate?generation_id=${generationId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getUserSites(page: number = 1, limit: number = 10): Promise<UserSitesResponse> {
    return this.request(`/sites/my-sites?skip=${(page - 1) * limit}&limit=${limit}`);
  }

  async getSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}`);
  }

  async updateSite(siteId: string, data: SiteUpdate): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSite(siteId: string): Promise<{ message: string }> {
    return this.request(`/sites/${siteId}`, {
      method: 'DELETE',
    });
  }

  async publishSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}/publish`, {
      method: 'POST',
    });
  }

  async unpublishSite(siteId: string): Promise<GeneratedSite> {
    return this.request(`/sites/${siteId}/unpublish`, {
      method: 'POST',
    });
  }

  // Analytics Methods
  async getSiteStatistics(siteId: string): Promise<SiteStatistics> {
    return this.request(`/sites/${siteId}/analytics`);
  }

  async trackEvent(data: AnalyticsEvent): Promise<{ success: boolean }> {
    return this.request('/analytics/track', {
      method: 'POST',
      body: JSON.stringify(data),
    }, false);
  }

  // Generation Status
  async getGenerationStatus(taskId: string): Promise<GenerationStatus> {
    return this.request(`/generation/status/${taskId}`);
  }

  // Public site access (no auth required)
  async getPublicSite(slug: string): Promise<GeneratedSite> {
    return this.request(`/public/sites/${slug}`, {}, false);
  }

  async incrementSiteView(siteId: string): Promise<{ success: boolean }> {
    return this.request(`/public/sites/${siteId}/view`, {
      method: 'POST',
    }, false);
  }

  // Utility methods
  logout() {
    this.removeToken();
  }

  isAuthenticated(): boolean {
    return !!this.authToken;
  }

  // Helper method for non-JSON requests
  async requestFile(
    endpoint: string,
    options: RequestInit = {},
    requireAuth: boolean = true
  ): Promise<Blob> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: HeadersInit = {
      ...options.headers,
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