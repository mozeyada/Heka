"""Service utilities for managing device push tokens."""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.device_token import DeviceToken


async def upsert_device_token(
    *,
    db: AsyncIOMotorDatabase,
    user_id: str,
    device_id: str,
    token: str,
    platform: str,
    user_agent: Optional[str] = None,
) -> DeviceToken:
    """Create or update a device token for a user/device combo."""

    existing = await db.device_tokens.find_one(
        {"user_id": ObjectId(user_id), "device_id": device_id}
    )

    data = {
        "user_id": ObjectId(user_id),
        "device_id": device_id,
        "token": token,
        "platform": platform,
        "user_agent": user_agent,
        "revoked_at": None,
        "updated_at": datetime.utcnow(),
    }

    if existing:
        await db.device_tokens.update_one(
            {"_id": existing["_id"]},
            {"$set": data},
        )
        existing.update(data)
        return DeviceToken.from_mongo(existing)

    document = DeviceToken(
        user_id=user_id,
        device_id=device_id,
        platform=platform,
        token=token,
        user_agent=user_agent,
    )
    result = await db.device_tokens.insert_one(document.to_mongo())
    document.id = str(result.inserted_id)
    return document


async def revoke_device_token(
    *,
    db: AsyncIOMotorDatabase,
    user_id: str,
    device_id: str,
) -> None:
    """Soft-revoke a device token."""

    await db.device_tokens.update_one(
        {"user_id": ObjectId(user_id), "device_id": device_id},
        {"$set": {"revoked_at": datetime.utcnow()}},
    )


