from slowapi import Limiter
from slowapi.util import get_remote_address
from fastapi import Request

def get_user_key(request: Request) -> str:
    """Получаем ключ для rate limiting с учетом пользователя"""
    # Если есть токен, используем его для идентификации
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        return f"user:{token[:10]}"  # Используем первые 10 символов токена
    # Иначе используем IP адрес
    return get_remote_address(request)

# Инициализируем rate limiter с пользовательской функцией ключа
limiter = Limiter(
    key_func=get_user_key,
    default_limits=["200/minute", "2000/hour"],  # Базовые лимиты
    strategy="fixed-window"  # Стратегия окна
) 