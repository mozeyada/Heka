"""Perspective model for MongoDB."""

from datetime import datetime
from typing import Optional

from bson import ObjectId
from pydantic import BaseModel, Field

from app.core.crypto import decrypt_text, encrypt_text


class Perspective(BaseModel):
    """User's perspective on an argument."""
    
    id: Optional[str] = Field(None, alias="_id")
    argument_id: str  # ObjectId reference to Argument
    user_id: str  # ObjectId reference to User
    
    content: str
    sentiment_score: Optional[float] = None  # For future AI analysis
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class PerspectiveInDB(Perspective):
    """Perspective document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "PerspectiveInDB":
        """Convert MongoDB document to PerspectiveInDB."""
        data = dict(data)
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "argument_id" in data and isinstance(data["argument_id"], ObjectId):
            data["argument_id"] = str(data["argument_id"])
        if "user_id" in data and isinstance(data["user_id"], ObjectId):
            data["user_id"] = str(data["user_id"])
        if "content" in data:
            data["content"] = decrypt_text(data["content"])
        return cls(**data)

    def to_mongo(self) -> dict:
        """Convert PerspectiveInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "argument_id" in data and isinstance(data["argument_id"], str):
            data["argument_id"] = ObjectId(data["argument_id"])
        if "user_id" in data and isinstance(data["user_id"], str):
            data["user_id"] = ObjectId(data["user_id"])
        if "content" in data:
            data["content"] = encrypt_text(data["content"])
        return data
