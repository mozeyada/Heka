"""Notification preference and device token endpoints."""

from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.api.schemas import (
    DeviceTokenCreate,
    NotificationPreferencesResponse,
    NotificationPreferencesUpdate,
)
from app.db.database import get_database
from app.models.user import UserInDB
from app.services.device_token_service import (
    revoke_device_token,
    upsert_device_token,
)
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
