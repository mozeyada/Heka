"""Couple model for MongoDB."""

from datetime import datetime, date
from typing import Optional, List
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class CoupleStatus(str, Enum):
    """Couple relationship status."""
    ACTIVE = "active"
    PAUSED = "paused"
    ENDED = "ended"


class Couple(BaseModel):
    """Couple document model."""
    
    id: Optional[str] = Field(None, alias="_id")
    
    # Two users in the couple (ObjectId references)
    user1_id: str
    user2_id: str
    
    # Relationship details
    relationship_start_date: Optional[date] = None
    status: CoupleStatus = CoupleStatus.ACTIVE
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        json_schema_extra = {
            "example": {
                "user1_id": "507f1f77bcf86cd799439011",
                "user2_id": "507f1f77bcf86cd799439012",
                "status": "active"
            }
        }


class CoupleInDB(Couple):
    """Couple document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "CoupleInDB":
        """Convert MongoDB document to CoupleInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        # Convert ObjectId to string
        if "user1_id" in data and isinstance(data["user1_id"], ObjectId):
            data["user1_id"] = str(data["user1_id"])
        if "user2_id" in data and isinstance(data["user2_id"], ObjectId):
            data["user2_id"] = str(data["user2_id"])
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert CoupleInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        # Convert string IDs to ObjectId for MongoDB
        if "user1_id" in data and isinstance(data["user1_id"], str):
            data["user1_id"] = ObjectId(data["user1_id"])
        if "user2_id" in data and isinstance(data["user2_id"], str):
            data["user2_id"] = ObjectId(data["user2_id"])
        return data
