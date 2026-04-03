"""Notification preference and device token endpoints."""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.api.schemas import (
    DeviceTokenCreate,
    InAppNotificationListResponse,
    InAppNotificationResponse,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
)
from app.db.database import get_database
from app.models.in_app_notification import InAppNotificationInDB
from app.models.user import UserInDB
from app.services.device_token_service import (
    revoke_device_token,
    upsert_device_token,
)
from app.services.in_app_notification_service import serialize_in_app_notification
from app.services.notification_preferences import normalize_notification_preferences

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


@router.get("/preferences", response_model=NotificationPreferencesResponse)
async def get_notification_preferences(
    current_user: UserInDB = Depends(get_current_user),
):
    """Return current notification preferences for the signed-in user."""

    preferences = normalize_notification_preferences(current_user.notification_preferences)
    return NotificationPreferencesResponse(**preferences)


@router.put("/preferences", response_model=NotificationPreferencesResponse)
async def update_notification_preferences(
    payload: NotificationPreferencesUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Update editable notification preferences for the signed-in user."""

    preferences = normalize_notification_preferences(current_user.notification_preferences)
    preferences["relationship_notifications"] = payload.relationship_notifications.model_dump()

    await db.users.update_one(
        {"_id": ObjectId(current_user.id)},
        {
            "$set": {
                "notification_preferences": preferences,
                "updated_at": datetime.utcnow(),
            }
        },
    )

    return NotificationPreferencesResponse(**preferences)


@router.get("/feed", response_model=InAppNotificationListResponse)
async def get_in_app_notifications(
    limit: int = 20,
    offset: int = 0,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return a paginated in-app notification feed for the signed-in user."""

    if limit < 1 or limit > 100:
        limit = 20
    if offset < 0:
        offset = 0

    cursor = (
        db.in_app_notifications.find({"user_id": ObjectId(current_user.id)})
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    items = []
    async for doc in cursor:
        items.append(
            InAppNotificationResponse(
                **serialize_in_app_notification(InAppNotificationInDB.from_mongo(doc))
            )
        )

    unread_count = await db.in_app_notifications.count_documents(
        {"user_id": ObjectId(current_user.id), "read_at": None}
    )
    return InAppNotificationListResponse(items=items, unread_count=unread_count)


@router.get("/unread-count")
async def get_unread_notification_count(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return unread in-app notification count for the signed-in user."""

    unread_count = await db.in_app_notifications.count_documents(
        {"user_id": ObjectId(current_user.id), "read_at": None}
    )
    return {"unread_count": unread_count}


@router.post("/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
async def mark_notification_read(
    notification_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Mark a single notification as read."""

    await db.in_app_notifications.update_one(
        {
            "_id": ObjectId(notification_id),
            "user_id": ObjectId(current_user.id),
        },
        {"$set": {"read_at": datetime.utcnow()}},
    )
    return None


@router.post("/read-all", status_code=status.HTTP_204_NO_CONTENT)
async def mark_all_notifications_read(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Mark every in-app notification as read for the signed-in user."""

    await db.in_app_notifications.update_many(
        {"user_id": ObjectId(current_user.id), "read_at": None},
        {"$set": {"read_at": datetime.utcnow()}},
    )
    return None


@router.post("/device", status_code=status.HTTP_204_NO_CONTENT)
async def register_device_token(
    payload: DeviceTokenCreate,
    request: Request,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Register or update a device push token for the current user."""

    user_agent = request.headers.get("user-agent")

    await upsert_device_token(
        db=db,
        user_id=str(current_user.id),
        device_id=payload.device_id,
        token=payload.token,
        platform=payload.platform,
        user_agent=user_agent,
    )
    return None


@router.delete("/device/{device_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unregister_device_token(
    device_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Remove a registered device token (e.g., logout)."""

    await revoke_device_token(
        db=db,
        user_id=str(current_user.id),
        device_id=device_id,
    )
    return None
