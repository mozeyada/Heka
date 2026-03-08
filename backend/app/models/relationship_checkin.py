"""Relationship Check-in model for MongoDB."""

from datetime import date, datetime
from enum import Enum
from typing import Any, Dict, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class CheckInStatus(str, Enum):
    """Check-in completion status."""
    PENDING = "pending"
    AWAITING_PARTNER = "awaiting_partner"  # One partner completed, waiting for the other
    COMPLETED = "completed"
    SKIPPED = "skipped"


class RelationshipCheckIn(BaseModel):
    """Weekly relationship check-in document."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    # Check-in details
    week_start_date: date  # Monday of the week
    status: CheckInStatus = CheckInStatus.PENDING
    
    # Survey responses mapped by user_id
    user_responses: Dict[str, Dict[str, Any]] = Field(default_factory=dict)
    
    # Tracking
    completed_by: List[str] = Field(default_factory=list)  # List of user_ids who completed it
    completed_at: Optional[datetime] = None
    
    # Partner Harmony Report
    ai_harmony_report: Optional[str] = None
    
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
        data = dict(data)
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        if "completed_by" in data and isinstance(data["completed_by"], list):
            data["completed_by"] = [str(uid) for uid in data["completed_by"]]
        # Handle legacy completed_by_user_id
        if "completed_by_user_id" in data:
            if data["completed_by_user_id"] and str(data["completed_by_user_id"]) not in data.get("completed_by", []):
                data.setdefault("completed_by", []).append(str(data["completed_by_user_id"]))
            del data["completed_by_user_id"]
            
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
        if "completed_by" in data and isinstance(data["completed_by"], list):
            data["completed_by"] = [ObjectId(uid) for uid in data["completed_by"] if uid]
        if "week_start_date" in data and isinstance(data["week_start_date"], date):
            data["week_start_date"] = datetime.combine(data["week_start_date"], datetime.min.time())
        return data

