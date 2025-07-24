import os
import logging
import resend
from ..core.config import settings

logger = logging.getLogger(__name__)

# Используем настройки из config.py
resend.api_key = settings.RESEND_API_KEY
FROM_EMAIL = settings.MAIL_FROM

logger.info(f"Email service initialized with Resend. FROM_EMAIL: {FROM_EMAIL}")
logger.info(f"RESEND_API_KEY present: {bool(resend.api_key)}")

class EmailService:
    @staticmethod
    def send_verification_email(to_email: str, code: str):
        logger.info(f"Attempting to send verification email to: {to_email}")
        params: resend.Emails.SendParams = {
            "from": f"Support <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": "Email Verification Code",
            "html": f"<strong>Your verification code: {code}</strong>",
        }
        try:
            if not resend.api_key:
                raise RuntimeError("RESEND_API_KEY not set")
            email = resend.Emails.send(params)
            logger.info(f"Email sent successfully via Resend. ID: {email.get('id')}")
            return 200
        except Exception as e:
            logger.error(f"Resend error: {str(e)}")
            raise RuntimeError(f"Resend error: {str(e)}")

    @staticmethod
    def send_code_email(to_email: str, code: str, purpose: str = 'verification'):
        logger.info(f"Attempting to send {purpose} code email to: {to_email}")
        if purpose == 'verification':
            subject = 'Email Verification Code'
            html_content = f'<strong>Your verification code: {code}</strong>'
        else:
            subject = 'Password Reset Code'
            html_content = f'<strong>Your password reset code: {code}</strong>'
        
        params: resend.Emails.SendParams = {
            "from": f"Support <{FROM_EMAIL}>",
            "to": [to_email],
            "subject": subject,
            "html": html_content,
        }
        try:
            if not resend.api_key:
                raise RuntimeError("RESEND_API_KEY not set")
            email = resend.Emails.send(params)
            logger.info(f"Email sent successfully via Resend. ID: {email.get('id')}")
            return 200
        except Exception as e:
            logger.error(f"Resend error: {str(e)}")
            raise RuntimeError(f"Resend error: {str(e)}")

email_service = EmailService() 