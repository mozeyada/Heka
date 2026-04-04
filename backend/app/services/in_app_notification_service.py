"""Service utilities for storing in-app notifications."""

from datetime import datetime
from typing import Any, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.in_app_notification import (
    InAppNotification,
    InAppNotificationInDB,
)
from app.services.notification_preferences import normalize_notification_preferences


async def create_in_app_notification(
    *,
    db: AsyncIOMotorDatabase,
    recipient_user_id: str,
    preference_key: str,
    category: str,
    title: str,
    body: str,
    resource_type: Optional[str] = None,
    resource_id: Optional[str] = None,
    action_path: Optional[str] = None,
    actor_user_id: Optional[str] = None,
    metadata: Optional[dict[str, Any]] = None,
) -> Optional[InAppNotification]:
    """Persist an in-app notification if the recipient allows that category."""

    user_doc = await db.users.find_one({"_id": ObjectId(recipient_user_id)})
    if not user_doc:
        return None

    preferences = normalize_notification_preferences(user_doc.get("notification_preferences"))
    in_app_enabled = (
        preferences.get("relationship_notifications", {})
        .get(preference_key, {})
        .get("in_app", True)
    )
    if not in_app_enabled:
        return None

    notification = InAppNotificationInDB(
        user_id=recipient_user_id,
        category=category,
        title=title,
        body=body,
        resource_type=resource_type,
        resource_id=resource_id,
        action_path=action_path,
        actor_user_id=actor_user_id,
        metadata=metadata or {},
        created_at=datetime.utcnow(),
    )
    result = await db.in_app_notifications.insert_one(notification.to_mongo())
    notification.id = str(result.inserted_id)
    return notification


def serialize_in_app_notification(notification: InAppNotificationInDB) -> dict[str, Any]:
    """Convert notification model to response payload."""

    return {
        "id": notification.id,
        "category": notification.category,
        "title": notification.title,
        "body": notification.body,
        "resource_type": notification.resource_type,
        "resource_id": notification.resource_id,
        "action_path": notification.action_path,
        "actor_user_id": notification.actor_user_id,
        "metadata": notification.metadata or {},
        "is_read": notification.read_at is not None,
        "read_at": notification.read_at,
        "created_at": notification.created_at,
    }
