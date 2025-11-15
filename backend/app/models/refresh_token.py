"""Refresh token model for MongoDB."""

from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field


class RefreshToken(BaseModel):
    """Refresh token data stored in MongoDB."""

    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    token_hash: str
    device_id: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    replaced_by_token_id: Optional[str] = None

    class Config:
        populate_by_name = True

    @classmethod
    def from_mongo(cls, data: dict) -> "RefreshToken":
        if not data:
            raise ValueError("No refresh token data to deserialize")
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "user_id" in data and isinstance(data["user_id"], ObjectId):
            data["user_id"] = str(data["user_id"])
        if (
            "replaced_by_token_id" in data
            and isinstance(data["replaced_by_token_id"], ObjectId)
        ):
            data["replaced_by_token_id"] = str(data["replaced_by_token_id"])
        return cls(**data)

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"}, by_alias=True)
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "user_id" in data and isinstance(data["user_id"], str):
            data["user_id"] = ObjectId(data["user_id"])
        if (
            "replaced_by_token_id" in data
            and data["replaced_by_token_id"]
            and isinstance(data["replaced_by_token_id"], str)
        ):
            data["replaced_by_token_id"] = ObjectId(data["replaced_by_token_id"])
        return data


def compute_expiry(days: int) -> datetime:
    """Helper to compute expiry datetime."""
    return datetime.utcnow() + timedelta(days=days)


