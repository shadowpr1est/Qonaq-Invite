import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional
import logging
from pathlib import Path

from src.core.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Email service for sending verification and notification emails"""
    
    def __init__(self):
        # Use settings from config
        self.smtp_server = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.sender_email = settings.SMTP_EMAIL
        self.sender_password = settings.SMTP_PASSWORD
        self.sender_name = settings.SMTP_FROM_NAME
        
    def _create_verification_email_html(self, user_name: str, verification_link: str) -> str:
        """Create beautiful HTML email for verification"""
        return f"""
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Подтвердите ваш email - Invitly</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
            <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="background: white; border-radius: 16px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #6366f1; font-size: 32px; margin: 0; font-weight: 700;">✨ Invitly</h1>
                        <p style="color: #64748b; margin: 8px 0 0 0; font-size: 16px;">Создавайте красивые приглашения</p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <span style="font-size: 32px;">📧</span>
                        </div>
                        <h2 style="color: #1e293b; font-size: 24px; margin: 0 0 10px 0;">Подтвердите ваш email</h2>
                        <p style="color: #64748b; font-size: 16px; margin: 0;">Привет, {user_name}! Осталось сделать последний шаг.</p>
                    </div>
                    
                    <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                        <p style="color: #475569; font-size: 14px; margin: 0; line-height: 1.6;">
                            Для завершения регистрации и начала создания потрясающих приглашений, пожалуйста, подтвердите ваш email адрес, нажав на кнопку ниже.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-bottom: 30px;">
                        <a href="{verification_link}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 16px 32px; border-radius: 12px; font-weight: 600; font-size: 16px; transition: all 0.3s ease;">
                            🎉 Подтвердить email
                        </a>
                    </div>
                    
                    <div style="border-top: 1px solid #e2e8f0; padding-top: 20px;">
                        <p style="color: #94a3b8; font-size: 12px; margin: 0; text-align: center; line-height: 1.6;">
                            Если кнопка не работает, скопируйте и вставьте эту ссылку в браузер:<br>
                            <a href="{verification_link}" style="color: #6366f1; word-break: break-all;">{verification_link}</a>
                        </p>
                        <p style="color: #94a3b8; font-size: 12px; margin: 16px 0 0 0; text-align: center;">
                            Если вы не регистрировались на Invitly, просто игнорируйте это письмо.
                        </p>
                    </div>
                </div>
                
                <div style="text-align: center; margin-top: 20px;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 12px; margin: 0;">
                        © 2024 Invitly. Создано с ❤️ для ваших особенных моментов.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    
    async def send_verification_email(self, to_email: str, user_name: str, verification_token: str) -> bool:
        """Send email verification email"""
        if not self.sender_email or not self.sender_password:
            logger.warning("SMTP credentials not configured. Email verification disabled.")
            # In development, just log the verification link
            verification_link = f"http://98.66.137.117/verify-email?token={verification_token}"
            logger.info(f"Email verification link for {to_email}: {verification_link}")
            return True
        
        try:
            # Create verification link
            verification_link = f"http://98.66.137.117/verify-email?token={verification_token}"
            
            # Create message
            message = MIMEMultipart("alternative")
            message["Subject"] = "Подтвердите ваш email - Invitly ✨"
            message["From"] = self.sender_email
            message["To"] = to_email
            
            # Create HTML content
            html_content = self._create_verification_email_html(user_name, verification_link)
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Create text fallback
            text_content = f"""
            Привет, {user_name}!
            
            Добро пожаловать в Invitly! 
            
            Для завершения регистрации, пожалуйста, подтвердите ваш email адрес по ссылке:
            {verification_link}
            
            Если вы не регистрировались на Invitly, просто игнорируйте это письмо.
            
            С уважением,
            Команда Invitly
            """
            text_part = MIMEText(text_content, "plain")
            message.attach(text_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            logger.info(f"Verification email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send verification email to {to_email}: {str(e)}")
            # Fallback: log the verification link
            verification_link = f"http://98.66.137.117/verify-email?token={verification_token}"
            logger.info(f"Email verification link for {to_email}: {verification_link}")
            return True  # Return True in development to not block registration
    
    async def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        """Send welcome email after verification"""
        if not self.sender_email or not self.sender_password:
            logger.info(f"Welcome email would be sent to {to_email}")
            return True
        
        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = "Добро пожаловать в Invitly! 🎉"
            message["From"] = self.sender_email
            message["To"] = to_email
            
            html_content = f"""
            <html>
            <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #6366f1;">🎉 Добро пожаловать в Invitly!</h1>
                </div>
                
                <p>Привет, {user_name}!</p>
                
                <p>Ваш email успешно подтвержден! Теперь вы можете:</p>
                <ul>
                    <li>✨ Создавать красивые приглашения</li>
                    <li>🎨 Выбирать из множества шаблонов</li>
                    <li>📊 Отслеживать отклики гостей</li>
                    <li>📱 Делиться приглашениями в социальных сетях</li>
                </ul>
                
                <div style="text-align: center; margin: 30px 0;">
                    <a href="http://98.66.137.117/builder" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: bold;">
                        Создать первое приглашение
                    </a>
                </div>
                
                <p style="color: #666; font-size: 14px;">
                    С уважением,<br>
                    Команда Invitly
                </p>
            </body>
            </html>
            """
            
            html_part = MIMEText(html_content, "html")
            message.attach(html_part)
            
            # Send email
            context = ssl.create_default_context()
            with smtplib.SMTP(self.smtp_server, self.smtp_port) as server:
                server.starttls(context=context)
                server.login(self.sender_email, self.sender_password)
                server.sendmail(self.sender_email, to_email, message.as_string())
            
            logger.info(f"Welcome email sent successfully to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send welcome email to {to_email}: {str(e)}")
            return False


# Global service instance
email_service = EmailService() 