"""Usage tracking model for MongoDB."""

from datetime import datetime, date
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class UsageType(str, Enum):
    """Types of usage."""
    ARGUMENT_RESOLUTION = "argument_resolution"
    AI_ANALYSIS = "ai_analysis"


class Usage(BaseModel):
    """Usage tracking document."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    # Usage details
    usage_type: UsageType
    argument_id: Optional[str] = None  # If tracked per argument
    
    # Period tracking
    period_start: date  # Start of billing/trial period
    period_end: date  # End of billing/trial period
    count: int = 1  # Number of uses
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class UsageInDB(Usage):
    """Usage document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "UsageInDB":
        """Convert MongoDB document to UsageInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        if "argument_id" in data and isinstance(data["argument_id"], ObjectId):
            data["argument_id"] = str(data["argument_id"])
        if "period_start" in data and isinstance(data["period_start"], datetime):
            data["period_start"] = data["period_start"].date()
        if "period_end" in data and isinstance(data["period_end"], datetime):
            data["period_end"] = data["period_end"].date()
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert UsageInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        if "argument_id" in data and isinstance(data["argument_id"], str) and data["argument_id"]:
            data["argument_id"] = ObjectId(data["argument_id"])
        if "period_start" in data and isinstance(data["period_start"], date):
            data["period_start"] = datetime.combine(data["period_start"], datetime.min.time())
        if "period_end" in data and isinstance(data["period_end"], date):
            data["period_end"] = datetime.combine(data["period_end"], datetime.min.time())
        return data

