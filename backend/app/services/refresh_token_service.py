"""Service helpers for refresh token lifecycle."""

from datetime import datetime
import hashlib
import secrets
from typing import Optional, Tuple
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.models.refresh_token import RefreshToken, compute_expiry


class RefreshTokenError(Exception):
    """Base exception for refresh token issues."""


def _hash_token(raw_token: str) -> str:
    """Generate SHA-256 hash of refresh token for storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def _generate_raw_token() -> str:
    """Generate cryptographically secure token string."""
    # 48 bytes gives 64+ char urlsafe token
    return secrets.token_urlsafe(48)


async def create_refresh_token(
    user_id: str,
    db: AsyncIOMotorDatabase,
    *,
    device_id: Optional[str] = None,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> str:
    """
    Create and persist a new refresh token for a user.
    Any active token for the same device is revoked before issuing a new one.
    Returns the raw token string for client consumption.
    """
    # Revoke existing tokens for same user & device to prevent duplicates
    query = {"user_id": ObjectId(user_id)}
    if device_id:
        query["device_id"] = device_id
    await db.refresh_tokens.update_many(
        {**query, "revoked_at": None},
        {
            "$set": {
                "revoked_at": datetime.utcnow(),
                "replaced_by_token_id": None,
            }
        },
    )

    raw_token = _generate_raw_token()
    token = RefreshToken(
        user_id=user_id,
        token_hash=_hash_token(raw_token),
        device_id=device_id,
        user_agent=user_agent,
        ip_address=ip_address,
        expires_at=compute_expiry(settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    result = await db.refresh_tokens.insert_one(token.to_mongo())
    token.id = str(result.inserted_id)
    return raw_token


async def verify_and_rotate_refresh_token(
    raw_token: str,
    db: AsyncIOMotorDatabase,
    *,
    device_id: Optional[str] = None,
    user_agent: Optional[str] = None,
    ip_address: Optional[str] = None,
) -> Tuple[str, str]:
    """
    Verify an incoming refresh token, rotate it, and return (user_id, new_refresh_token).
    Raises RefreshTokenError if the token is invalid, expired, revoked, or device mismatch.
    """
    token_hash = _hash_token(raw_token)
    token_doc = await db.refresh_tokens.find_one({"token_hash": token_hash})
    if not token_doc:
        raise RefreshTokenError("refresh token not found")

    token = RefreshToken.from_mongo(token_doc)

    if token.revoked_at:
        raise RefreshTokenError("refresh token revoked")

    if token.expires_at <= datetime.utcnow():
        # Soft revoke expired token
        await db.refresh_tokens.update_one(
            {"_id": ObjectId(token.id)},
            {"$set": {"revoked_at": datetime.utcnow()}},
        )
        raise RefreshTokenError("refresh token expired")

    if token.device_id and device_id and token.device_id != device_id:
        raise RefreshTokenError("device mismatch")

    # Rotate the token
    new_raw_token = _generate_raw_token()
    new_token = RefreshToken(
        user_id=token.user_id,
        token_hash=_hash_token(new_raw_token),
        device_id=device_id or token.device_id,
        user_agent=user_agent or token.user_agent,
        ip_address=ip_address or token.ip_address,
        expires_at=compute_expiry(settings.REFRESH_TOKEN_EXPIRE_DAYS),
    )
    insert_result = await db.refresh_tokens.insert_one(new_token.to_mongo())
    new_token.id = str(insert_result.inserted_id)

    await db.refresh_tokens.update_one(
        {"_id": ObjectId(token.id)},
        {
            "$set": {
                "revoked_at": datetime.utcnow(),
                "replaced_by_token_id": ObjectId(new_token.id),
            }
        },
    )

    return token.user_id, new_raw_token


async def revoke_tokens_for_user(user_id: str, db: AsyncIOMotorDatabase) -> None:
    """Revoke all refresh tokens for a user."""
    await db.refresh_tokens.update_many(
        {"user_id": ObjectId(user_id), "revoked_at": None},
        {"$set": {"revoked_at": datetime.utcnow()}},
    )


