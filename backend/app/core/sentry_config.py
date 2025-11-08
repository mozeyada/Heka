"""Sentry error tracking configuration."""

import logging
from app.config import settings

logger = logging.getLogger(__name__)

def init_sentry():
    """Initialize Sentry error tracking."""
    if settings.SENTRY_DSN:
        try:
            import sentry_sdk
            from sentry_sdk.integrations.fastapi import FastApiIntegration
            from sentry_sdk.integrations.logging import LoggingIntegration
            
            sentry_sdk.init(
                dsn=settings.SENTRY_DSN,
                environment=settings.ENVIRONMENT,
                traces_sample_rate=0.1,  # 10% of transactions
                profiles_sample_rate=0.1,  # 10% of profiles
                integrations=[
                    FastApiIntegration(),
                    LoggingIntegration(
                        level=logging.INFO,  # Capture info and above
                        event_level=logging.ERROR  # Send errors as events
                    ),
                ],
                # Set user context
                before_send=lambda event, hint: event,
                # Release tracking
                release=f"heka@{settings.VERSION}",
            )
            logger.info("Sentry initialized successfully")
        except ImportError:
            logger.warning("Sentry SDK not installed. Install with: pip install sentry-sdk[fastapi]")
        except Exception as e:
            logger.error(f"Failed to initialize Sentry: {e}")
    else:
        logger.info("Sentry DSN not configured, skipping initialization")


