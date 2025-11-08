"""AI Insight model for MongoDB."""

from datetime import datetime
from typing import Optional, List, Dict, Any
from bson import ObjectId
from pydantic import BaseModel, Field


class AIInsight(BaseModel):
    """AI-generated insights for an argument."""
    
    id: Optional[str] = Field(None, alias="_id")
    argument_id: str  # ObjectId reference (one-to-one relationship)
    
    # Structured AI response
    summary: Optional[str] = None
    common_ground: Optional[List[str]] = None
    disagreements: Optional[List[str]] = None
    root_causes: Optional[List[str]] = None
    suggestions: Optional[List[Dict[str, Any]]] = None
    communication_tips: Optional[List[str]] = None
    
    # Full response stored as JSON
    full_response: Optional[Dict[str, Any]] = None
    
    # Metadata
    ai_model: Optional[str] = Field(None, alias="model_used")  # "gpt-4", "gemini-2.5-flash", etc.
    cost: Optional[float] = None  # Cost of API call
    tokens_used: Optional[Dict[str, int]] = None  # {"input": X, "output": Y}
    
    # Timestamps
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class AIInsightInDB(AIInsight):
    """AI Insight document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "AIInsightInDB":
        """Convert MongoDB document to AIInsightInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "argument_id" in data and isinstance(data["argument_id"], ObjectId):
            data["argument_id"] = str(data["argument_id"])
        # Handle model_used field alias
        if "model_used" in data and "ai_model" not in data:
            data["ai_model"] = data["model_used"]
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert AIInsightInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "argument_id" in data and isinstance(data["argument_id"], str):
            data["argument_id"] = ObjectId(data["argument_id"])
        return data
