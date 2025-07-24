"""
Custom exceptions and error handlers for FluentAI API
Following FastAPI best practices for machine-readable error responses
"""

from fastapi import HTTPException, status
from typing import Dict, Any, Optional
from enum import Enum


class ErrorCode(Enum):
    # Authentication errors
    INVALID_CREDENTIALS = "auth.invalid_credentials"
    EMAIL_ALREADY_EXISTS = "auth.email_already_exists"
    USER_NOT_FOUND = "auth.user_not_found"
    INVALID_TOKEN = "auth.invalid_token"
    TOKEN_EXPIRED = "auth.token_expired"
    INSUFFICIENT_PERMISSIONS = "auth.insufficient_permissions"
    EMAIL_NOT_VERIFIED = "auth.email_not_verified"
    
    # Validation errors
    VALIDATION_ERROR = "validation.error"
    REQUIRED_FIELD = "validation.required_field"
    INVALID_EMAIL = "validation.invalid_email"
    INVALID_PASSWORD = "validation.invalid_password"
    PASSWORD_TOO_SHORT = "validation.password_too_short"
    PASSWORD_TOO_WEAK = "validation.password_too_weak"
    
    # Site/RSVP errors
    SITE_NOT_FOUND = "site.not_found"
    SITE_NOT_PUBLISHED = "site.not_published"
    SITE_ACCESS_DENIED = "site.access_denied"
    RSVP_SUBMISSION_FAILED = "rsvp.submission_failed"
    RSVP_ALREADY_SUBMITTED = "rsvp.already_submitted"
    
    # Database errors
    DATABASE_ERROR = "database.error"
    DATABASE_CONNECTION_ERROR = "database.connection_error"
    
    # External service errors
    GOOGLE_OAUTH_ERROR = "oauth.google_error"
    EMAIL_SERVICE_ERROR = "email.service_error"
    
    # Rate limiting
    RATE_LIMIT_EXCEEDED = "rate_limit.exceeded"
    
    # General errors
    INTERNAL_SERVER_ERROR = "server.internal_error"
    SERVICE_UNAVAILABLE = "server.service_unavailable"
    NOT_FOUND = "server.not_found"
    METHOD_NOT_ALLOWED = "server.method_not_allowed"


class LocalizedHTTPException(HTTPException):
    """Custom HTTPException with localized error messages"""
    
    def __init__(
        self,
        error_code: ErrorCode,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        headers: Optional[Dict[str, str]] = None,
        **kwargs
    ):
        self.error_code = error_code
        self.localized_messages = self._get_localized_messages()
        super().__init__(status_code=status_code, detail=self.localized_messages, headers=headers, **kwargs)
    
    def _get_localized_messages(self) -> Dict[str, str]:
        """Get localized error messages for all supported languages"""
        return {
            "ru": self._get_russian_message(),
            "en": self._get_english_message(),
            "kk": self._get_kazakh_message()
        }
    
    def _get_russian_message(self) -> str:
        """Get Russian error message"""
        messages = {
            ErrorCode.INVALID_CREDENTIALS: "Неверный email или пароль",
            ErrorCode.EMAIL_ALREADY_EXISTS: "Пользователь с таким email уже существует",
            ErrorCode.USER_NOT_FOUND: "Пользователь не найден",
            ErrorCode.INVALID_TOKEN: "Недействительный токен",
            ErrorCode.TOKEN_EXPIRED: "Токен истек",
            ErrorCode.INSUFFICIENT_PERMISSIONS: "Недостаточно прав",
            ErrorCode.EMAIL_NOT_VERIFIED: "Email не подтвержден",
            ErrorCode.VALIDATION_ERROR: "Ошибка валидации данных",
            ErrorCode.REQUIRED_FIELD: "Обязательное поле",
            ErrorCode.INVALID_EMAIL: "Неверный формат email",
            ErrorCode.INVALID_PASSWORD: "Неверный пароль",
            ErrorCode.PASSWORD_TOO_SHORT: "Пароль должен содержать минимум 8 символов",
            ErrorCode.PASSWORD_TOO_WEAK: "Пароль слишком простой",
            ErrorCode.SITE_NOT_FOUND: "Сайт не найден",
            ErrorCode.SITE_NOT_PUBLISHED: "Сайт не опубликован",
            ErrorCode.SITE_ACCESS_DENIED: "Нет доступа к сайту",
            ErrorCode.RSVP_SUBMISSION_FAILED: "Ошибка при отправке RSVP",
            ErrorCode.RSVP_ALREADY_SUBMITTED: "RSVP уже отправлен",
            ErrorCode.DATABASE_ERROR: "Ошибка базы данных",
            ErrorCode.DATABASE_CONNECTION_ERROR: "Ошибка подключения к базе данных",
            ErrorCode.GOOGLE_OAUTH_ERROR: "Ошибка Google OAuth",
            ErrorCode.EMAIL_SERVICE_ERROR: "Ошибка сервиса email",
            ErrorCode.RATE_LIMIT_EXCEEDED: "Превышен лимит запросов",
            ErrorCode.INTERNAL_SERVER_ERROR: "Внутренняя ошибка сервера",
            ErrorCode.SERVICE_UNAVAILABLE: "Сервис временно недоступен",
            ErrorCode.NOT_FOUND: "Ресурс не найден",
            ErrorCode.METHOD_NOT_ALLOWED: "Метод не разрешен"
        }
        return messages.get(self.error_code, "Неизвестная ошибка")
    
    def _get_english_message(self) -> str:
        """Get English error message"""
        messages = {
            ErrorCode.INVALID_CREDENTIALS: "Invalid email or password",
            ErrorCode.EMAIL_ALREADY_EXISTS: "User with this email already exists",
            ErrorCode.USER_NOT_FOUND: "User not found",
            ErrorCode.INVALID_TOKEN: "Invalid token",
            ErrorCode.TOKEN_EXPIRED: "Token expired",
            ErrorCode.INSUFFICIENT_PERMISSIONS: "Insufficient permissions",
            ErrorCode.EMAIL_NOT_VERIFIED: "Email not verified",
            ErrorCode.VALIDATION_ERROR: "Validation error",
            ErrorCode.REQUIRED_FIELD: "Required field",
            ErrorCode.INVALID_EMAIL: "Invalid email format",
            ErrorCode.INVALID_PASSWORD: "Invalid password",
            ErrorCode.PASSWORD_TOO_SHORT: "Password must be at least 8 characters",
            ErrorCode.PASSWORD_TOO_WEAK: "Password is too weak",
            ErrorCode.SITE_NOT_FOUND: "Site not found",
            ErrorCode.SITE_NOT_PUBLISHED: "Site not published",
            ErrorCode.SITE_ACCESS_DENIED: "Access denied to site",
            ErrorCode.RSVP_SUBMISSION_FAILED: "Failed to submit RSVP",
            ErrorCode.RSVP_ALREADY_SUBMITTED: "RSVP already submitted",
            ErrorCode.DATABASE_ERROR: "Database error",
            ErrorCode.DATABASE_CONNECTION_ERROR: "Database connection error",
            ErrorCode.GOOGLE_OAUTH_ERROR: "Google OAuth error",
            ErrorCode.EMAIL_SERVICE_ERROR: "Email service error",
            ErrorCode.RATE_LIMIT_EXCEEDED: "Rate limit exceeded",
            ErrorCode.INTERNAL_SERVER_ERROR: "Internal server error",
            ErrorCode.SERVICE_UNAVAILABLE: "Service temporarily unavailable",
            ErrorCode.NOT_FOUND: "Resource not found",
            ErrorCode.METHOD_NOT_ALLOWED: "Method not allowed"
        }
        return messages.get(self.error_code, "Unknown error")
    
    def _get_kazakh_message(self) -> str:
        """Get Kazakh error message"""
        messages = {
            ErrorCode.INVALID_CREDENTIALS: "Қате email немесе құпия сөз",
            ErrorCode.EMAIL_ALREADY_EXISTS: "Бұл email-мен пайдаланушы бұрыннан бар",
            ErrorCode.USER_NOT_FOUND: "Пайдаланушы табылмады",
            ErrorCode.INVALID_TOKEN: "Жарамсыз токен",
            ErrorCode.TOKEN_EXPIRED: "Токен мерзімі өтті",
            ErrorCode.INSUFFICIENT_PERMISSIONS: "Жеткіліксіз рұқсаттар",
            ErrorCode.EMAIL_NOT_VERIFIED: "Email расталмаған",
            ErrorCode.VALIDATION_ERROR: "Деректерді тексеру қатесі",
            ErrorCode.REQUIRED_FIELD: "Міндетті өріс",
            ErrorCode.INVALID_EMAIL: "Қате email пішімі",
            ErrorCode.INVALID_PASSWORD: "Қате құпия сөз",
            ErrorCode.PASSWORD_TOO_SHORT: "Құпия сөз кемінде 8 таңба болуы керек",
            ErrorCode.PASSWORD_TOO_WEAK: "Құпия сөз тым әлсіз",
            ErrorCode.SITE_NOT_FOUND: "Сайт табылмады",
            ErrorCode.SITE_NOT_PUBLISHED: "Сайт жарияланмаған",
            ErrorCode.SITE_ACCESS_DENIED: "Сайтқа кіруге рұқсат жоқ",
            ErrorCode.RSVP_SUBMISSION_FAILED: "RSVP жіберу қатесі",
            ErrorCode.RSVP_ALREADY_SUBMITTED: "RSVP бұрыннан жіберілген",
            ErrorCode.DATABASE_ERROR: "Дерекқор қатесі",
            ErrorCode.DATABASE_CONNECTION_ERROR: "Дерекқорға қосылу қатесі",
            ErrorCode.GOOGLE_OAUTH_ERROR: "Google OAuth қатесі",
            ErrorCode.EMAIL_SERVICE_ERROR: "Email сервисі қатесі",
            ErrorCode.RATE_LIMIT_EXCEEDED: "Сұраулар шегі асылды",
            ErrorCode.INTERNAL_SERVER_ERROR: "Сервердің ішкі қатесі",
            ErrorCode.SERVICE_UNAVAILABLE: "Сервис уақытша қолжетімді емес",
            ErrorCode.NOT_FOUND: "Ресурс табылмады",
            ErrorCode.METHOD_NOT_ALLOWED: "Әдіс рұқсат етілмеген"
        }
        return messages.get(self.error_code, "Белгісіз қате")


# Convenience functions for common errors
def raise_invalid_credentials():
    """Raise error for invalid login credentials"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.INVALID_CREDENTIALS,
        status_code=status.HTTP_401_UNAUTHORIZED
    )


def raise_email_already_exists():
    """Raise error when email already exists during registration"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.EMAIL_ALREADY_EXISTS,
        status_code=status.HTTP_409_CONFLICT
    )


def raise_user_not_found():
    """Raise error when user is not found"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.USER_NOT_FOUND,
        status_code=status.HTTP_404_NOT_FOUND
    )


def raise_invalid_token():
    """Raise error for invalid token"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.INVALID_TOKEN,
        status_code=status.HTTP_401_UNAUTHORIZED
    )


def raise_token_expired():
    """Raise error for expired token"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.TOKEN_EXPIRED,
        status_code=status.HTTP_401_UNAUTHORIZED
    )


def raise_insufficient_permissions():
    """Raise error for insufficient permissions"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.INSUFFICIENT_PERMISSIONS,
        status_code=status.HTTP_403_FORBIDDEN
    )


def raise_email_not_verified():
    """Raise error when email is not verified"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.EMAIL_NOT_VERIFIED,
        status_code=status.HTTP_403_FORBIDDEN
    )


def raise_site_not_found():
    """Raise error when site is not found"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.SITE_NOT_FOUND,
        status_code=status.HTTP_404_NOT_FOUND
    )


def raise_site_not_published():
    """Raise error when site is not published"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.SITE_NOT_PUBLISHED,
        status_code=status.HTTP_404_NOT_FOUND
    )


def raise_site_access_denied():
    """Raise error when access to site is denied"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.SITE_ACCESS_DENIED,
        status_code=status.HTTP_403_FORBIDDEN
    )


def raise_rsvp_submission_failed():
    """Raise error when RSVP submission fails"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.RSVP_SUBMISSION_FAILED,
        status_code=status.HTTP_400_BAD_REQUEST
    )


def raise_google_oauth_error():
    """Raise error for Google OAuth issues"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.GOOGLE_OAUTH_ERROR,
        status_code=status.HTTP_400_BAD_REQUEST
    )


def raise_rate_limit_exceeded():
    """Raise error when rate limit is exceeded"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.RATE_LIMIT_EXCEEDED,
        status_code=status.HTTP_429_TOO_MANY_REQUESTS
    )


def raise_database_error():
    """Raise error for database issues"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.DATABASE_ERROR,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    )


def raise_internal_server_error():
    """Raise error for internal server issues"""
    raise LocalizedHTTPException(
        error_code=ErrorCode.INTERNAL_SERVER_ERROR,
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR
    ) 