import { toast } from 'sonner';

export interface ApiError {
  error_code?: string;
  detail?: any;
  status_code?: number;
  message?: string;
}

export interface LocalizedError {
  ru: string;
  en: string;
  kk: string;
}

export class ErrorHandler {
  private static getErrorKey(error: ApiError): string {
    // Extract error code from different possible formats
    if (error.error_code) {
      return error.error_code;
    }
    
    if (typeof error.detail === 'object' && error.detail) {
      // Handle localized error format from backend
      if (error.detail.ru && error.detail.en && error.detail.kk) {
        return 'localized_error';
      }
      
      // Handle error code in detail
      if (error.detail.error_code) {
        return error.detail.error_code;
      }
    }
    
    // Fallback to status code based errors
    switch (error.status_code) {
      case 400:
        return 'validation.error';
      case 401:
        return 'auth.invalid_credentials';
      case 403:
        return 'auth.insufficient_permissions';
      case 404:
        return 'server.not_found';
      case 409:
        return 'auth.email_already_exists';
      case 429:
        return 'rate_limit.exceeded';
      case 500:
        return 'server.internal_error';
      default:
        return 'general.unknown_error';
    }
  }

  private static getLocalizedErrorMessage(error: ApiError, t: (key: string) => string): string {
    const errorKey = this.getErrorKey(error);
    
    // Handle localized error from backend
    if (errorKey === 'localized_error' && typeof error.detail === 'object') {
      const currentLang = localStorage.getItem('i18nextLng') || 'ru';
      return error.detail[currentLang as keyof LocalizedError] || error.detail.ru || 'Unknown error';
    }
    
    // Map backend error codes to frontend translation keys
    const errorCodeMap: Record<string, string> = {
      'auth.invalid_credentials': 'errors.auth.invalid_credentials',
      'auth.email_already_exists': 'errors.auth.email_already_exists',
      'auth.user_not_found': 'errors.auth.user_not_found',
      'auth.invalid_token': 'errors.auth.invalid_token',
      'auth.token_expired': 'errors.auth.token_expired',
      'auth.insufficient_permissions': 'errors.auth.insufficient_permissions',
      'auth.email_not_verified': 'errors.auth.email_not_verified',
      'validation.error': 'errors.validation.error',
      'validation.required_field': 'errors.validation.required_field',
      'validation.invalid_email': 'errors.validation.invalid_email',
      'validation.invalid_password': 'errors.validation.invalid_password',
      'validation.password_too_short': 'errors.validation.password_too_short',
      'validation.password_too_weak': 'errors.validation.password_too_weak',
      'site.not_found': 'errors.site.not_found',
      'site.not_published': 'errors.site.not_published',
      'site.access_denied': 'errors.site.access_denied',
      'rsvp.submission_failed': 'errors.rsvp.submission_failed',
      'rsvp.already_submitted': 'errors.rsvp.already_submitted',
      'database.error': 'errors.database.error',
      'database.connection_error': 'errors.database.connection_error',
      'oauth.google_error': 'errors.oauth.google_error',
      'email.service_error': 'errors.email.service_error',
      'rate_limit.exceeded': 'errors.rate_limit.exceeded',
      'server.internal_error': 'errors.server.internal_error',
      'server.service_unavailable': 'errors.server.service_unavailable',
      'server.not_found': 'errors.server.not_found',
      'server.method_not_allowed': 'errors.server.method_not_allowed',
      'general.unknown_error': 'errors.general.unknown_error',
      'general.network_error': 'errors.general.network_error',
      'general.timeout': 'errors.general.timeout'
    };
    
    const translationKey = errorCodeMap[errorKey] || 'errors.general.unknown_error';
    return t(translationKey);
  }

  static handleApiError(error: any, t: (key: string) => string, showToast: boolean = true): string {
    let errorMessage = 'errors.general.unknown_error';
    
    try {
      // Handle different error formats
      if (error?.response?.data) {
        // Axios error format
        const apiError: ApiError = error.response.data;
        errorMessage = this.getLocalizedErrorMessage(apiError, t);
      } else if (error?.detail) {
        // Direct API error format
        const apiError: ApiError = error;
        errorMessage = this.getLocalizedErrorMessage(apiError, t);
      } else if (error?.message) {
        // Generic error with message
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        // String error
        errorMessage = error;
      } else {
        // Fallback
        errorMessage = t('errors.general.unknown_error');
      }
    } catch (parseError) {
      console.error('Error parsing error:', parseError);
      errorMessage = t('errors.general.unknown_error');
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }

  static handleNetworkError(error: any, t: (key: string) => string, showToast: boolean = true): string {
    let errorMessage = t('errors.general.network_error');
    
    if (error?.code === 'NETWORK_ERROR' || error?.message?.includes('Network Error')) {
      errorMessage = t('errors.general.network_error');
    } else if (error?.code === 'TIMEOUT' || error?.message?.includes('timeout')) {
      errorMessage = t('errors.general.timeout');
    } else if (error?.response?.status === 0) {
      errorMessage = t('errors.general.network_error');
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }

  static handleValidationError(errors: Record<string, string>, t: (key: string) => string, showToast: boolean = true): void {
    const errorMessages = Object.values(errors).map(error => t(error));
    
    if (showToast && errorMessages.length > 0) {
      toast.error(errorMessages[0]);
    }
  }

  static handleAuthError(error: any, t: (key: string) => string, showToast: boolean = true): string {
    // Special handling for authentication errors
    let errorMessage = t('errors.auth.invalid_credentials');
    
    if (error?.response?.status === 401) {
      errorMessage = t('errors.auth.invalid_credentials');
    } else if (error?.response?.status === 403) {
      errorMessage = t('errors.auth.insufficient_permissions');
    } else if (error?.response?.status === 409) {
      errorMessage = t('errors.auth.email_already_exists');
    } else {
      errorMessage = this.handleApiError(error, t, false);
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }

  static handleRSVPError(error: any, t: (key: string) => string, showToast: boolean = true): string {
    let errorMessage = t('errors.rsvp.submission_failed');
    
    if (error?.response?.status === 404) {
      errorMessage = t('errors.site.not_published');
    } else if (error?.response?.status === 400) {
      errorMessage = t('errors.rsvp.submission_failed');
    } else {
      errorMessage = this.handleApiError(error, t, false);
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }

  static handleSiteError(error: any, t: (key: string) => string, showToast: boolean = true): string {
    let errorMessage = t('errors.site.not_found');
    
    if (error?.response?.status === 404) {
      errorMessage = t('errors.site.not_found');
    } else if (error?.response?.status === 403) {
      errorMessage = t('errors.site.access_denied');
    } else {
      errorMessage = this.handleApiError(error, t, false);
    }
    
    if (showToast) {
      toast.error(errorMessage);
    }
    
    return errorMessage;
  }

  static isNetworkError(error: any): boolean {
    return error?.code === 'NETWORK_ERROR' || 
           error?.message?.includes('Network Error') ||
           error?.response?.status === 0;
  }

  static isAuthError(error: any): boolean {
    return error?.response?.status === 401 || 
           error?.response?.status === 403 ||
           error?.response?.status === 409;
  }

  static isValidationError(error: any): boolean {
    return error?.response?.status === 400 || 
           error?.response?.status === 422;
  }

  static isServerError(error: any): boolean {
    return error?.response?.status >= 500;
  }
} 