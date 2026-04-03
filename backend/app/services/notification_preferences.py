"""Notification preference defaults and normalization helpers."""

from copy import deepcopy
from typing import Any, Dict

from app.models.user import default_notification_preferences


def get_default_notification_preferences() -> Dict[str, Any]:
    """Return a safe copy of the default notification preferences."""
    return default_notification_preferences()


def normalize_notification_preferences(raw_preferences: Dict[str, Any] | None) -> Dict[str, Any]:
    """Merge raw stored preferences into the current supported structure."""
    normalized = get_default_notification_preferences()
    if not isinstance(raw_preferences, dict):
        return normalized

    relationship_raw = raw_preferences.get("relationship_notifications", {})
    if isinstance(relationship_raw, dict):
        for key, defaults in normalized["relationship_notifications"].items():
            raw_value = relationship_raw.get(key, {})
            if not isinstance(raw_value, dict):
                continue
            for channel in defaults:
                value = raw_value.get(channel)
                if isinstance(value, bool):
                    normalized["relationship_notifications"][key][channel] = value

    # Account-critical emails are always on, but keep the shape explicit.
    normalized["account_emails"] = deepcopy(normalized["account_emails"])
    return normalized

