"""Email service for sending invitations and notifications."""

import asyncio
import logging
import smtplib
from dataclasses import dataclass
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


@dataclass
class EmailDeliveryResult:
    """Structured result for email delivery attempts."""

    success: bool
    status: str
    error_code: str | None = None
    error_message: str | None = None


class EmailService:
    """Service for sending emails."""
    
    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.EMAIL_FROM
        self.resend_api_key = settings.RESEND_API_KEY
        self.smtp_timeout_seconds = settings.SMTP_TIMEOUT_SECONDS
        self.frontend_url = settings.FRONTEND_URL.rstrip("/")

    def _send_message_via_smtp(self, msg: MIMEMultipart):
        """Send a message over SMTP with a bounded socket timeout."""
        with smtplib.SMTP(
            self.smtp_host,
            self.smtp_port,
            timeout=self.smtp_timeout_seconds,
        ) as server:
            server.starttls()
            server.login(self.smtp_user, self.smtp_password)
            server.send_message(msg)

    def _frontend_link(self, path: str) -> str:
        """Build an absolute frontend URL without double slashes."""
        normalized_path = path if path.startswith("/") else f"/{path}"
        return f"{self.frontend_url}{normalized_path}"

    def get_invitation_link(self, invitation_token: str) -> str:
        """Return the frontend invite URL for a pending invitation."""
        return self._frontend_link(f"/invite/{invitation_token}")

    def get_password_reset_link(self, reset_token: str) -> str:
        """Return the frontend password reset URL."""
        return self._frontend_link(f"/reset-password?token={reset_token}")

    def _mask_email(self, value: str | None) -> str | None:
        """Mask an email address for logs."""
        if not value or "@" not in value:
            return value
        local, domain = value.split("@", 1)
        if len(local) <= 2:
            masked_local = f"{local[0]}***" if local else "***"
        else:
            masked_local = f"{local[:2]}***{local[-1]}"
        return f"{masked_local}@{domain}"

    def _smtp_snapshot(self) -> dict:
        """Safe SMTP snapshot for diagnostics without leaking secrets."""
        return {
            "smtp_host": self.smtp_host,
            "smtp_port": self.smtp_port,
            "smtp_user": self._mask_email(self.smtp_user),
            "email_from": self._mask_email(self.from_email),
            "smtp_password_present": bool(self.smtp_password),
            "smtp_timeout_seconds": self.smtp_timeout_seconds,
            "frontend_url": self.frontend_url,
        }

    def _resend_snapshot(self) -> dict:
        """Safe Resend snapshot for diagnostics without leaking secrets."""
        return {
            "resend_api_key_present": bool(self.resend_api_key),
            "email_from": self.from_email,
            "frontend_url": self.frontend_url,
        }

    def _classify_email_error(self, exc: Exception) -> tuple[str, str]:
        """Classify SMTP failures into actionable categories."""
        if isinstance(exc, asyncio.TimeoutError):
            return "smtp_timeout", "SMTP connection or delivery timed out"
        if isinstance(exc, smtplib.SMTPAuthenticationError):
            return "smtp_auth_failed", "SMTP authentication failed"
        if isinstance(exc, smtplib.SMTPConnectError):
            return "smtp_connect_failed", "SMTP connection could not be established"
        if isinstance(exc, smtplib.SMTPServerDisconnected):
            return "smtp_server_disconnected", "SMTP server disconnected unexpectedly"
        if isinstance(exc, smtplib.SMTPRecipientsRefused):
            return "smtp_recipient_refused", "Recipient was refused by the SMTP provider"
        if isinstance(exc, smtplib.SMTPSenderRefused):
            return "smtp_sender_refused", "Sender address was refused by the SMTP provider"
        if isinstance(exc, smtplib.SMTPException):
            return "smtp_error", str(exc)
        if isinstance(exc, httpx.TimeoutException):
            return "resend_timeout", "Resend API request timed out"
        if isinstance(exc, httpx.ConnectError):
            return "resend_connect_failed", "Could not connect to Resend API"
        if isinstance(exc, httpx.HTTPStatusError):
            body = exc.response.text.strip()
            message = body[:300] if body else f"HTTP {exc.response.status_code}"
            return "resend_api_error", message
        if isinstance(exc, httpx.HTTPError):
            return "resend_http_error", str(exc)
        if isinstance(exc, OSError):
            return "network_error", str(exc)
        return "unknown_error", str(exc)

    async def _send_via_resend(
        self,
        *,
        to_email: str,
        subject: str,
        text: str,
        html: str,
        kind: str,
    ) -> EmailDeliveryResult:
        """Send email through Resend's HTTPS API."""
        logger.info(
            "email_delivery_attempt kind=%s transport=resend to=%s resend=%s",
            kind,
            self._mask_email(to_email),
            self._resend_snapshot(),
        )

        try:
            async with httpx.AsyncClient(
                base_url="https://api.resend.com",
                timeout=self.smtp_timeout_seconds + 2,
                headers={
                    "Authorization": f"Bearer {self.resend_api_key}",
                    "Content-Type": "application/json",
                    "User-Agent": "heka-backend/0.1.0",
                },
            ) as client:
                response = await client.post(
                    "/emails",
                    json={
                        "from": self.from_email,
                        "to": [to_email],
                        "subject": subject,
                        "text": text,
                        "html": html,
                    },
                )
                response.raise_for_status()
                payload = response.json()

            logger.info(
                "email_delivery_succeeded kind=%s transport=resend to=%s email_id=%s",
                kind,
                self._mask_email(to_email),
                payload.get("id"),
            )
            return EmailDeliveryResult(success=True, status="sent")
        except Exception as exc:
            error_code, safe_message = self._classify_email_error(exc)
            logger.exception(
                "email_delivery_failed kind=%s transport=resend to=%s error_code=%s error_message=%s resend=%s",
                kind,
                self._mask_email(to_email),
                error_code,
                safe_message,
                self._resend_snapshot(),
            )
            return EmailDeliveryResult(
                success=False,
                status="pending_retry",
                error_code=error_code,
                error_message=safe_message,
            )
    
    async def send_invitation_email(
        self,
        to_email: str,
        inviter_name: str,
        invitation_token: str
    ) -> EmailDeliveryResult:
        """Send couple invitation email."""
        
        if not self.smtp_host and not self.resend_api_key:
            # In development, log instead of sending
            logger.info("INVITATION EMAIL (DEV MODE):")
            logger.info(f"  To: {to_email}")
            logger.info(f"  From: {inviter_name}")
            logger.info(f"  Invitation Link: {self.get_invitation_link(invitation_token)}")
            logger.info("  (In production, this would send an actual email)")
            return EmailDeliveryResult(success=True, status="dev_log_only")
        
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
            
            invitation_url = self.get_invitation_link(invitation_token)
            
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

            if self.resend_api_key:
                return await self._send_via_resend(
                    to_email=to_email,
                    subject=msg['Subject'],
                    text=text,
                    html=html,
                    kind="invitation",
                )

            # Add parts
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)

            logger.info(
                "email_delivery_attempt kind=invitation transport=smtp to=%s smtp=%s",
                self._mask_email(to_email),
                self._smtp_snapshot(),
            )
            
            # Keep SMTP off the async event loop and fail fast if the mail server stalls.
            await asyncio.wait_for(
                asyncio.to_thread(self._send_message_via_smtp, msg),
                timeout=self.smtp_timeout_seconds + 2,
            )
            
            logger.info("email_delivery_succeeded kind=invitation transport=smtp to=%s", self._mask_email(to_email))
            return EmailDeliveryResult(success=True, status="sent")
            
        except Exception as e:
            error_code, safe_message = self._classify_email_error(e)
            logger.exception(
                "email_delivery_failed kind=invitation transport=smtp to=%s error_code=%s error_message=%s smtp=%s",
                self._mask_email(to_email),
                error_code,
                safe_message,
                self._smtp_snapshot(),
            )
            return EmailDeliveryResult(
                success=False,
                status="pending_retry",
                error_code=error_code,
                error_message=safe_message,
            )

    async def send_password_reset_email(
        self,
        to_email: str,
        user_name: str,
        reset_token: str
    ) -> EmailDeliveryResult:
        """Send password reset email."""
        
        if not self.smtp_host and not self.resend_api_key:
            # In development, log instead of sending
            logger.info("PASSWORD RESET EMAIL (DEV MODE):")
            logger.info(f"  To: {to_email}")
            logger.info(f"  Reset Link: {self.get_password_reset_link(reset_token)}")
            logger.info("  (In production, this would send an actual email)")
            return EmailDeliveryResult(success=True, status="dev_log_only")
        
        try:
            # Create message
            msg = MIMEMultipart('alternative')
            msg['Subject'] = "Reset your Heka password"
            
            display_name = "Heka"
            if self.from_email != self.smtp_user:
                msg['From'] = f'{display_name} <{self.smtp_user}>'
            else:
                msg['From'] = f'{display_name} <{self.from_email}>'
            msg['To'] = to_email
            
            reset_url = self.get_password_reset_link(reset_token)
            
            text = f"""
Hi {user_name},

We received a request to reset the password for your Heka account.

Click the link below to set a new password:
{reset_url}

If you didn't request this, you can safely ignore this email.

Best regards,
The Heka Team
"""
            
            html = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:Arial,sans-serif;line-height:1.6;color:#333;">
    <div style="max-width:600px;margin:40px auto;background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:700;">Heka</h1>
        </div>
        <div style="padding:40px;">
            <h2 style="margin:0 0 16px;color:#111827;font-size:20px;font-weight:600;">Reset your password</h2>
            <p style="margin:0 0 12px;color:#374151;">Hi {user_name},</p>
            <p style="margin:0 0 28px;color:#374151;">We received a request to reset the password for your Heka account. Click the button below to set a new password.</p>
            <div style="text-align:center;margin:28px 0;">
                <a href="{reset_url}" style="display:inline-block;background-color:#4f46e5;color:#ffffff !important;text-decoration:none;padding:14px 32px;border-radius:8px;font-size:16px;font-weight:600;letter-spacing:0.3px;">Reset Password</a>
            </div>
            <p style="margin:28px 0 0;color:#6b7280;font-size:14px;">If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            <p style="margin:8px 0 0;color:#6b7280;font-size:14px;">This link expires in <strong>1 hour</strong>.</p>
        </div>
        <div style="padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
            <p style="margin:0;color:#9ca3af;font-size:12px;">Best regards,<br>The Heka Team</p>
        </div>
    </div>
</body>
</html>
"""

            if self.resend_api_key:
                return await self._send_via_resend(
                    to_email=to_email,
                    subject=msg['Subject'],
                    text=text,
                    html=html,
                    kind="password_reset",
                )

            # Add parts
            part1 = MIMEText(text, 'plain')
            part2 = MIMEText(html, 'html')
            msg.attach(part1)
            msg.attach(part2)

            logger.info(
                "email_delivery_attempt kind=password_reset transport=smtp to=%s smtp=%s",
                self._mask_email(to_email),
                self._smtp_snapshot(),
            )
            
            await asyncio.wait_for(
                asyncio.to_thread(self._send_message_via_smtp, msg),
                timeout=self.smtp_timeout_seconds + 2,
            )
            
            logger.info("email_delivery_succeeded kind=password_reset transport=smtp to=%s", self._mask_email(to_email))
            return EmailDeliveryResult(success=True, status="sent")
            
        except Exception as e:
            error_code, safe_message = self._classify_email_error(e)
            logger.exception(
                "email_delivery_failed kind=password_reset transport=smtp to=%s error_code=%s error_message=%s smtp=%s",
                self._mask_email(to_email),
                error_code,
                safe_message,
                self._smtp_snapshot(),
            )
            return EmailDeliveryResult(
                success=False,
                status="pending_retry",
                error_code=error_code,
                error_message=safe_message,
            )


# Singleton instance
email_service = EmailService()
