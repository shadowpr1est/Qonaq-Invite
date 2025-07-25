import logging
from typing import Optional

logger = logging.getLogger(__name__)

class EmailServiceStub:
    """Email service stub that simulates email sending but doesn't actually send emails"""
    
    def __init__(self):
        logger.info("Email service initialized in STUB mode - emails will not be sent")
    
    def send_verification_email(self, email: str, code: str) -> None:
        """Simulate sending verification email"""
        logger.info(f"[STUB] Verification email would be sent to {email} with code: {code}")
        logger.info("Email service is temporarily unavailable. Please contact support.")
    
    def send_password_reset_email(self, email: str, code: str) -> None:
        """Simulate sending password reset email"""
        logger.info(f"[STUB] Password reset email would be sent to {email} with code: {code}")
        logger.info("Email service is temporarily unavailable. Please contact support.")

# Create singleton instance
email_service = EmailServiceStub() 