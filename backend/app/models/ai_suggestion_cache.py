"""AI Suggestion Cache model for MongoDB."""

from datetime import datetime, timedelta
from typing import Any, Dict, List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class AISuggestionCache(BaseModel):
    """AI-generated suggestions cache for goals/check-ins."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    suggestion_type: str  # 'goals' or 'checkins'
    
    # Cached suggestions
    suggestions: List[Dict[str, Any]] = Field(default_factory=list)
    
    # Metadata
    linked_argument_ids: List[str] = Field(default_factory=list)  # Which arguments were analyzed
    ai_model: Optional[str] = None
    cost: Optional[float] = None
    
    # Timestamps
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    expires_at: datetime  # generated_at + 7 days
    
    class Config:
        populate_by_name = True


class AISuggestionCacheInDB(AISuggestionCache):
    """AI Suggestion Cache document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "AISuggestionCacheInDB":
        """Convert MongoDB document to AISuggestionCacheInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert AISuggestionCacheInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        return data
    
    @classmethod
    def create_new(
        cls,
        couple_id: str,
        suggestion_type: str,
        suggestions: List[Dict[str, Any]],
        linked_argument_ids: List[str],
        ai_model: Optional[str] = None,
        cost: Optional[float] = None
    ) -> "AISuggestionCacheInDB":
        """Create a new cache entry with 7-day expiration."""
        now = datetime.utcnow()
        return cls(
            couple_id=couple_id,
            suggestion_type=suggestion_type,
            suggestions=suggestions,
            linked_argument_ids=linked_argument_ids,
            ai_model=ai_model,
            cost=cost,
            generated_at=now,
            expires_at=now + timedelta(days=7)
        )

