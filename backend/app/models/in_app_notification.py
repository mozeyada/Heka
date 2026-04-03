"""In-app notification model for MongoDB."""

from datetime import datetime
from typing import Any, Dict, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class InAppNotification(BaseModel):
    """Notification delivered inside the app experience."""

    id: Optional[str] = Field(None, alias="_id")
    user_id: str
    category: str
    title: str
    body: str
    resource_type: Optional[str] = None
    resource_id: Optional[str] = None
    action_path: Optional[str] = None
    actor_user_id: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)
    read_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    class Config:
        populate_by_name = True


class InAppNotificationInDB(InAppNotification):
    """Notification document as stored in MongoDB."""

    @classmethod
    def from_mongo(cls, data: dict) -> "InAppNotificationInDB":
        data = dict(data)
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        for key in ("user_id", "resource_id", "actor_user_id"):
            if key in data and isinstance(data[key], ObjectId):
                data[key] = str(data[key])
        return cls(**data)

    def to_mongo(self) -> dict:
        data = self.model_dump(exclude={"id"})
        if self.id:
            data["_id"] = ObjectId(self.id)
        for key in ("user_id", "resource_id", "actor_user_id"):
            if key in data and isinstance(data[key], str):
                try:
                    data[key] = ObjectId(data[key])
                except Exception:
                    # Keep non-ObjectId strings (e.g. external identifiers) as-is.
                    pass
        return data
