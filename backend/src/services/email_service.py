import os
from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail

SENDGRID_API_KEY = os.environ.get('SENDGRID_API_KEY')
FROM_EMAIL = os.environ.get('MAIL_FROM')

class EmailService:
    @staticmethod
    def send_verification_email(to_email: str, code: str):
        subject = 'Email Verification Code'
        html_content = f'<strong>Your verification code: {code}</strong>'
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            return response.status_code
        except Exception as e:
            raise RuntimeError(f"SendGrid error: {getattr(e, 'message', str(e))}")

    @staticmethod
    def send_code_email(to_email: str, code: str, purpose: str = 'verification'):
        if purpose == 'verification':
            subject = 'Email Verification Code'
            html_content = f'<strong>Your verification code: {code}</strong>'
        else:
            subject = 'Password Reset Code'
            html_content = f'<strong>Your password reset code: {code}</strong>'
        message = Mail(
            from_email=FROM_EMAIL,
            to_emails=to_email,
            subject=subject,
            html_content=html_content
        )
        try:
            sg = SendGridAPIClient(SENDGRID_API_KEY)
            response = sg.send(message)
            return response.status_code
        except Exception as e:
            raise RuntimeError(f"SendGrid error: {getattr(e, 'message', str(e))}")

email_service = EmailService() 