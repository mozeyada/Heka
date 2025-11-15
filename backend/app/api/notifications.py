"""Notification device token endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.api.schemas import DeviceTokenCreate
from app.models.user import UserInDB
from app.db.database import get_database
from app.services.device_token_service import (
    upsert_device_token,
    revoke_device_token,
)

router = APIRouter(prefix="/api/notifications", tags=["Notifications"])


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


