"""Device push token model."""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field


class DevicePlatform(str):
    IOS = "ios"
    ANDROID = "android"


class DeviceToken(BaseModel):
    """Device push token stored in MongoDB."""

    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    device_id: str
    platform: str
    token: str
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    revoked_at: Optional[datetime] = None

    class Config:
        populate_by_name = True

    @classmethod
    def from_mongo(cls, data: dict) -> "DeviceToken":
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "user_id" in data and isinstance(data["user_id"], ObjectId):
            data["user_id"] = str(data["user_id"])
        return cls(**data)

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"}, by_alias=True)
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "user_id" in data and isinstance(data["user_id"], str):
            data["user_id"] = ObjectId(data["user_id"])
        data["updated_at"] = datetime.utcnow()
        return data


