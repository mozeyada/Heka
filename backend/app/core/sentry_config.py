"""Sentry error tracking configuration."""

import logging
from typing import Any, Dict

from app.config import settings

logger = logging.getLogger(__name__)

# Fields to redact from any dict in a Sentry event.
_SENSITIVE_KEYS = frozenset({
    "authorization", "password", "password_hash", "content",
    "access_token", "refresh_token", "token", "reset_password_token",
    "x-api-key", "cookie",
})


def _scrub_dict(data: Any, depth: int = 0) -> Any:
    """Recursively redact sensitive keys from a dict or list."""
    if depth > 8:
        return data
    if isinstance(data, dict):
        return {
            k: "[Filtered]" if k.lower() in _SENSITIVE_KEYS else _scrub_dict(v, depth + 1)
            for k, v in data.items()
        }
    if isinstance(data, list):
        return [_scrub_dict(item, depth + 1) for item in data]
    return data


def _before_send(event: Dict, hint: Any) -> Dict:
    """Strip PII before sending events to Sentry."""
    # Scrub request headers and body
    request = event.get("request", {})
    if "headers" in request:
        request["headers"] = _scrub_dict(request["headers"])
    if "data" in request:
        request["data"] = _scrub_dict(request["data"])

    # Scrub extra context and breadcrumb data
    if "extra" in event:
        event["extra"] = _scrub_dict(event["extra"])

    for breadcrumb in event.get("breadcrumbs", {}).get("values", []):
        if "data" in breadcrumb:
            breadcrumb["data"] = _scrub_dict(breadcrumb["data"])

    return event


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
                        level=logging.INFO,       # Capture info and above
                        event_level=logging.ERROR # Send errors as events
                    ),
                ],
                before_send=_before_send,
                release=f"heka@{settings.VERSION}",
            )
            logger.info("Sentry initialized successfully")
        except ImportError:
            logger.warning("Sentry SDK not installed. Install with: pip install sentry-sdk[fastapi]")
        except Exception as e:
            logger.error("Failed to initialize Sentry: %s", e)
    else:
        logger.info("Sentry DSN not configured, skipping initialization")
