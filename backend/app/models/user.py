"""User model for MongoDB."""

from copy import deepcopy
from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional

from bson import ObjectId
from pydantic import BaseModel, EmailStr, Field


class UserRole(str, Enum):
    """User roles."""
    USER = "user"
    ADMIN = "admin"


def default_notification_preferences() -> Dict[str, Any]:
    """Return the default notification preference structure."""
    return deepcopy(
        {
            "account_emails": {
                "security_and_recovery": True,
                "billing_and_subscription": True,
                "legal_and_policy": True,
            },
            "relationship_notifications": {
                "invites": {"email": True, "in_app": True},
                "partner_activity": {"email": True, "in_app": True},
                "check_in_reminders": {"email": True, "in_app": True},
                "goal_updates": {"email": False, "in_app": True},
                "ai_insights": {"email": False, "in_app": True},
            },
        }
    )


class User(BaseModel):
    """User document model."""
    
    id: Optional[str] = Field(None, alias="_id")
    email: EmailStr
    password_hash: str
    name: str
    age: int  # For 16+ verification
    role: UserRole = UserRole.USER
    is_active: bool = True
    is_verified: bool = False
    
    # Privacy and communication settings
    privacy_settings: Dict[str, Any] = Field(default_factory=dict)
    notification_preferences: Dict[str, Any] = Field(default_factory=default_notification_preferences)
    
    # Legal acceptance tracking
    terms_accepted_at: Optional[datetime] = None
    privacy_accepted_at: Optional[datetime] = None
    terms_version: Optional[str] = None  # Track which version of terms was accepted
    privacy_version: Optional[str] = None  # Track which version of privacy policy was accepted
    
    # Password Reset
    reset_password_token: Optional[str] = None
    reset_password_expires: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe",
                "age": 25,
                "is_active": True
            }
        }


class UserInDB(User):
    """User document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "UserInDB":
        """Convert MongoDB document to UserInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert UserInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        return data
