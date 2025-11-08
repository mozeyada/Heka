"""Argument model for MongoDB."""

from datetime import datetime
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class ArgumentCategory(str, Enum):
    """Argument categories."""
    FINANCES = "finances"
    COMMUNICATION = "communication"
    VALUES = "values"
    INTIMACY = "intimacy"
    FAMILY = "family"
    LIFESTYLE = "lifestyle"
    FUTURE_PLANS = "future_plans"
    OTHER = "other"


class ArgumentPriority(str, Enum):
    """Argument priority levels."""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"


class ArgumentStatus(str, Enum):
    """Argument resolution status."""
    DRAFT = "draft"
    ACTIVE = "active"
    ANALYZED = "analyzed"
    RESOLVED = "resolved"
    ARCHIVED = "archived"


class Argument(BaseModel):
    """Argument document model."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    title: str
    category: ArgumentCategory
    priority: ArgumentPriority = ArgumentPriority.MEDIUM
    status: ArgumentStatus = ArgumentStatus.DRAFT
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class ArgumentInDB(Argument):
    """Argument document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "ArgumentInDB":
        """Convert MongoDB document to ArgumentInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert ArgumentInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        return data
