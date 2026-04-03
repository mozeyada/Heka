"""Relationship Goal model for MongoDB."""

import uuid
from datetime import date, datetime
from enum import Enum
from typing import List, Optional

from bson import ObjectId
from pydantic import BaseModel, Field


class GoalStatus(str, Enum):
    """Goal status."""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    ARCHIVED = "archived"
    CANCELLED = "cancelled"


class GoalProgress(BaseModel):
    """Progress entry for a goal."""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: Optional[str] = None  # User who made the update
    date: date
    notes: Optional[str] = None
    progress_value: Optional[float] = None  # 0.0 to 1.0 (0% to 100%)
    reactions: List[dict] = Field(default_factory=list)  # [{"user_id": "...", "emoji": "❤️"}]


class RelationshipGoal(BaseModel):
    """Relationship goal document."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    # Goal details
    title: str
    description: Optional[str] = None
    status: GoalStatus = GoalStatus.ACTIVE
    
    # Goal tracking
    target_date: Optional[date] = None
    progress: List[GoalProgress] = []
    
    # Metrics
    created_by_user_id: str  # User who created the goal
    progress_updates: int = 0  # Number of progress updates
    hidden_for_user_ids: List[str] = Field(default_factory=list)
    archived_for_user_ids: List[str] = Field(default_factory=list)
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None
    
    class Config:
        populate_by_name = True


class RelationshipGoalInDB(RelationshipGoal):
    """Goal document as stored in MongoDB."""

    @classmethod
    def from_mongo(cls, data: dict) -> "RelationshipGoalInDB":
        """Convert MongoDB document to RelationshipGoalInDB."""
        data = data.copy()
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        if "created_by_user_id" in data and isinstance(data["created_by_user_id"], ObjectId):
            data["created_by_user_id"] = str(data["created_by_user_id"])
        if data.get("hidden_for_user_ids") is None:
            data["hidden_for_user_ids"] = []
        elif "hidden_for_user_ids" in data:
            data["hidden_for_user_ids"] = [str(user_id) for user_id in data["hidden_for_user_ids"]]
        if data.get("archived_for_user_ids") is None:
            data["archived_for_user_ids"] = []
        elif "archived_for_user_ids" in data:
            data["archived_for_user_ids"] = [str(user_id) for user_id in data["archived_for_user_ids"]]
        if "target_date" in data and isinstance(data["target_date"], datetime):
            data["target_date"] = data["target_date"].date()
        # Convert progress entries
        if data.get("progress") is None:
            data["progress"] = []
        elif "progress" in data and data["progress"]:
            progress_list = []
            for p in data["progress"]:
                p = dict(p)
                if isinstance(p.get("date"), datetime):
                    p["date"] = p["date"].date()
                if isinstance(p.get("date"), str):
                    p["date"] = datetime.fromisoformat(p["date"].replace("Z", "+00:00")).date()
                if p.get("reactions") is None:
                    p["reactions"] = []
                progress_list.append(GoalProgress(**p))
            data["progress"] = progress_list
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert RelationshipGoalInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        if "created_by_user_id" in data and isinstance(data["created_by_user_id"], str):
            data["created_by_user_id"] = ObjectId(data["created_by_user_id"])
        if "target_date" in data and isinstance(data["target_date"], date) and data["target_date"]:
            data["target_date"] = datetime.combine(data["target_date"], datetime.min.time())
        # Convert progress dates
        if "progress" in data:
            progress_list = []
            for p in data["progress"]:
                p_dict = p if isinstance(p, dict) else p.model_dump()
                if isinstance(p_dict.get("date"), date):
                    p_dict["date"] = datetime.combine(p_dict["date"], datetime.min.time())
                progress_list.append(p_dict)
            data["progress"] = progress_list
        return data
