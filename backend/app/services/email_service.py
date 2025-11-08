"""Email service for sending invitations and notifications."""

import smtplib
import os
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings
import logging

logger = logging.getLogger(__name__)


class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
    
    async def send_invitation_email(
        self,
        to_email: str,
        inviter_name: str,
        invitation_token: str
    ) -> bool:
        """Send couple invitation email."""
        
        if not self.smtp_host:
            # In development, log instead of sending
            logger.info(f"INVITATION EMAIL (DEV MODE):")
            logger.info(f"  To: {to_email}")
            logger.info(f"  From: {inviter_name}")
            logger.info(f"  Invitation Link: http://localhost:3000/invite/{invitation_token}")
            logger.info(f"  (In production, this would send an actual email)")
            return True
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = f"{inviter_name} invited you to join Heka"
            # Use display name format: "Heka <email@address.com>"
            # Gmail requires EMAIL_FROM to match SMTP_USER, but we can use a display name
            display_name = "Heka"
            if self.from_email != self.smtp_user:
                # If EMAIL_FROM doesn't match SMTP_USER, use SMTP_USER (Gmail requirement)
                msg['From'] = f'{display_name} <{self.smtp_user}>'
            else:
                msg['From'] = f'{display_name} <{self.from_email}>'
            msg['To'] = to_email
            
            # Email content
            # In development, use localhost. In production, use actual domain
            base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
            invitation_url = f"{base_url}/invite/{invitation_token}"
            
            text = f"""
Hi there!

{inviter_name} has invited you to join Heka - an AI-powered platform to help couples resolve arguments and build stronger relationships.

Click here to accept the invitation: {invitation_url}

If you don't have a Heka account yet, you'll be able to create one and automatically join {inviter_name}'s couple profile.

Best regards,
The Heka Team
"""
            
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <style>
        body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
        .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
        .button {{ display: inline-block; padding: 12px 24px; background-color: #0284c7; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; }}
        .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
    </style>
</head>
<body>
    <div class="container">
        <h2>You've been invited to Heka!</h2>
        <p>Hi there!</p>
        <p><strong>{inviter_name}</strong> has invited you to join Heka - an AI-powered platform to help couples resolve arguments and build stronger relationships.</p>
        <a href="{invitation_url}" class="button">Accept Invitation</a>
        <p>If you don't have a Heka account yet, you'll be able to create one and automatically join {inviter_name}'s couple profile.</p>
        <div class="footer">
            <p>Best regards,<br>The Heka Team</p>
        </div>
    </div>
</body>
</html>
"""
            
            # Add parts
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)
            
            # Send email
            with smtplib.SMTP(self.smtp_host, self.smtp_port) as server:
                server.starttls()
                server.login(self.smtp_user, self.smtp_password)
                server.send_message(msg)
            
            logger.info(f"Invitation email sent to {to_email}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to send invitation email: {e}")
            return False


# Singleton instance
email_service = EmailService()

