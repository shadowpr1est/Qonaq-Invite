/**
 * Token Manager для автоматического обновления JWT токенов
 */

interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  user: any;
}

class TokenManager {
  private isRefreshing = false;
  private refreshPromise: Promise<TokenResponse> | null = null;

  /**
   * Получает access token из localStorage
   */
  getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Получает refresh token из localStorage
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Сохраняет токены в localStorage
   */
  setTokens(accessToken: string, refreshToken: string): void {
    console.log('Setting tokens in tokenManager:', { accessToken: !!accessToken, refreshToken: !!refreshToken });
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  /**
   * Удаляет токены из localStorage
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Обновляет токены используя refresh token
   */
  async refreshTokens(): Promise<TokenResponse> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch('/api/v1/auth/refresh-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data: TokenResponse = await response.json();
      this.setTokens(data.access_token, data.refresh_token);
      return data;
    } catch (error) {
      this.clearTokens();
      throw error;
    }
  }

  /**
   * Автоматически обновляет токены если нужно
   */
  async ensureValidToken(): Promise<string | null> {
    const accessToken = this.getAccessToken();
    if (!accessToken) return null;

    // Проверяем, не истек ли токен
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      const expirationTime = payload.exp * 1000; // конвертируем в миллисекунды
      const currentTime = Date.now();
      
      // Если токен истекает в течение следующих 5 минут, обновляем его
      if (expirationTime - currentTime < 5 * 60 * 1000) {
        try {
          const data = await this.refreshTokensWithLock();
          return data.access_token;
        } catch (refreshError) {
          // Если обновление не удалось, очищаем токены и возвращаем null
          this.clearTokens();
          return null;
        }
      }
      
      return accessToken;
    } catch (error) {
      // Если не можем декодировать токен, пробуем обновить
      try {
        const data = await this.refreshTokensWithLock();
        return data.access_token;
      } catch (refreshError) {
        // Если обновление не удалось, очищаем токены и возвращаем null
        this.clearTokens();
        return null;
      }
    }
  }

  /**
   * Обновляет токены с защитой от множественных запросов
   */
  async refreshTokensWithLock(): Promise<TokenResponse> {
    if (this.isRefreshing) {
      // Если уже обновляем токены, ждем завершения
      return this.refreshPromise!;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.refreshTokens();

    try {
      const result = await this.refreshPromise;
      return result;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }
}

export const tokenManager = new TokenManager(); 