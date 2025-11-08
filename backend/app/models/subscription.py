"""Subscription model for MongoDB."""

from datetime import datetime, date
from typing import Optional
from bson import ObjectId
from pydantic import BaseModel, Field
from enum import Enum


class SubscriptionTier(str, Enum):
    """Subscription tier levels."""
    FREE = "free"
    BASIC = "basic"
    PREMIUM = "premium"


class SubscriptionStatus(str, Enum):
    """Subscription status."""
    ACTIVE = "active"
    CANCELLED = "cancelled"
    EXPIRED = "expired"
    TRIAL = "trial"


class Subscription(BaseModel):
    """Subscription document."""
    
    id: Optional[str] = Field(None, alias="_id")
    couple_id: str  # ObjectId reference to Couple
    
    # Subscription details
    tier: SubscriptionTier = SubscriptionTier.FREE
    status: SubscriptionStatus = SubscriptionStatus.TRIAL
    
    # Billing
    stripe_subscription_id: Optional[str] = None
    stripe_customer_id: Optional[str] = None
    
    # Trial period (7 days)
    trial_start: Optional[datetime] = None
    trial_end: Optional[datetime] = None
    
    # Billing dates
    current_period_start: Optional[datetime] = None
    current_period_end: Optional[datetime] = None
    
    # Cancellation
    cancelled_at: Optional[datetime] = None
    cancel_at_period_end: bool = False
    
    # Timestamps
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True


class SubscriptionInDB(Subscription):
    """Subscription document as stored in MongoDB."""
    
    @classmethod
    def from_mongo(cls, data: dict) -> "SubscriptionInDB":
        """Convert MongoDB document to SubscriptionInDB."""
        if "_id" in data:
            data["id"] = str(data["_id"])
            del data["_id"]
        if "couple_id" in data and isinstance(data["couple_id"], ObjectId):
            data["couple_id"] = str(data["couple_id"])
        return cls(**data)
    
    def to_mongo(self) -> dict:
        """Convert SubscriptionInDB to MongoDB document."""
        data = self.model_dump(exclude={"id"})
        if hasattr(self, "id") and self.id:
            data["_id"] = ObjectId(self.id)
        if "couple_id" in data and isinstance(data["couple_id"], str):
            data["couple_id"] = ObjectId(data["couple_id"])
        return data


class UsageLimit(BaseModel):
    """Usage limits per tier."""
    FREE_TRIAL_ARGS = 5  # 5 arguments during 7-day trial
    FREE_TRIAL_DAYS = 7
    
    BASIC_MONTHLY_ARGS = -1  # Unlimited
    PREMIUM_MONTHLY_ARGS = -1  # Unlimited

