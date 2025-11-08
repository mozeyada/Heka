"""Invitation model for MongoDB."""

from datetime import datetime, timedelta
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field, EmailStr
from enum import Enum


class InvitationStatus(str, Enum):
    """Invitation status."""
    PENDING = "pending"
    ACCEPTED = "accepted"
    EXPIRED = "expired"
    CANCELLED = "cancelled"


class Invitation(BaseModel):
    """Couple invitation document model."""
    
    id: Optional[str] = Field(None, alias="_id")
    inviter_id: str  # ObjectId reference to User (who sent invitation)
    invitee_email: EmailStr  # Email of person being invited
    
    # Invitation details
    token: str  # Unique token for invitation
    status: InvitationStatus = InvitationStatus.PENDING
    
    # Couple linking (set when invitation is accepted)
    couple_id: Optional[str] = None  # ObjectId reference to Couple
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime = Field(default_factory=lambda: datetime.utcnow() + timedelta(days=7))
    accepted_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class InvitationInDB(Invitation):
    """Invitation document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "InvitationInDB":
        """Convert MongoDB document to InvitationInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "inviter_id" in data and isinstance(data["inviter_id"], ObjectId):
            data["inviter_id"] = str(data["inviter_id"])
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert InvitationInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "inviter_id" in data and isinstance(data["inviter_id"], str):
            data["inviter_id"] = ObjectId(data["inviter_id"])
        if "couple_id" in data and isinstance(data["couple_id"], str) and data["couple_id"]:
            data["couple_id"] = ObjectId(data["couple_id"])
        return data

