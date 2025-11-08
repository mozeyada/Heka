"""Relationship Check-in model for MongoDB."""

from datetime import datetime, date
from typing import Optional, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class CheckInStatus(str, Enum):
    """Check-in completion status."""
    PENDING = "pending"
    COMPLETED = "completed"
    SKIPPED = "skipped"


class RelationshipCheckIn(BaseModel):
    """Weekly relationship check-in document."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    # Check-in details
    week_start_date: date  # Monday of the week
    status: CheckInStatus = CheckInStatus.PENDING
    
    # Survey responses
    responses: Optional[Dict[str, Any]] = None  # {"question1": answer, "question2": answer}
    
    # User who completed it (if completed)
    completed_by_user_id: Optional[str] = None
    completed_at: Optional[datetime] = None
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class RelationshipCheckInInDB(RelationshipCheckIn):
    """Check-in document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "RelationshipCheckInInDB":
        """Convert MongoDB document to RelationshipCheckInInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        if "completed_by_user_id" in data and isinstance(data["completed_by_user_id"], ObjectId):
            data["completed_by_user_id"] = str(data["completed_by_user_id"])
        if "week_start_date" in data and isinstance(data["week_start_date"], datetime):
            data["week_start_date"] = data["week_start_date"].date()
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert RelationshipCheckInInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        if "completed_by_user_id" in data and isinstance(data["completed_by_user_id"], str) and data["completed_by_user_id"]:
            data["completed_by_user_id"] = ObjectId(data["completed_by_user_id"])
        if "week_start_date" in data and isinstance(data["week_start_date"], date):
            data["week_start_date"] = datetime.combine(data["week_start_date"], datetime.min.time())
        return data

