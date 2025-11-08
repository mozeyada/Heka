"""Subscription service for managing subscriptions."""

from datetime import datetime, timedelta
from app.models.subscription import SubscriptionInDB, SubscriptionTier, SubscriptionStatus, UsageLimit
from app.models.couple import CoupleInDB, CoupleStatus
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class SubscriptionService:
    """Service for managing subscriptions."""
    
    @staticmethod
    async def get_or_create_subscription(
        couple_id: str,
        db: AsyncIOMotorDatabase
    ) -> SubscriptionInDB:
        """Get existing subscription or create a free trial subscription."""
        # Check if subscription exists
        sub_doc = await db.subscriptions.find_one({"couple_id": ObjectId(couple_id)})
        
        if sub_doc:
            return SubscriptionInDB.from_mongo(sub_doc)
        
        # Create free trial subscription
        trial_start = datetime.utcnow()
        trial_end = trial_start + timedelta(days=UsageLimit.FREE_TRIAL_DAYS)
        
        subscription = SubscriptionInDB(
            couple_id=couple_id,
            tier=SubscriptionTier.FREE,
            status=SubscriptionStatus.TRIAL,
            trial_start=trial_start,
            trial_end=trial_end,
            current_period_start=trial_start,
            current_period_end=trial_end
        )
        
        result = await db.subscriptions.insert_one(subscription.to_mongo())
        subscription.id = str(result.inserted_id)
        
        logger.info(f"Created free trial subscription for couple {couple_id}")
        return subscription
    
    @staticmethod
    async def get_subscription(
        couple_id: str,
        db: AsyncIOMotorDatabase
    ) -> Optional[SubscriptionInDB]:
        """Get subscription for a couple."""
        sub_doc = await db.subscriptions.find_one({"couple_id": ObjectId(couple_id)})
        if sub_doc:
            return SubscriptionInDB.from_mongo(sub_doc)
        return None
    
    @staticmethod
    async def update_subscription(
        subscription_id: str,
        updates: dict,
        db: AsyncIOMotorDatabase
    ) -> SubscriptionInDB:
        """Update subscription."""
        updates["updated_at"] = datetime.utcnow()
        await db.subscriptions.update_one(
            {"_id": ObjectId(subscription_id)},
            {"$set": updates}
        )
        
        updated_doc = await db.subscriptions.find_one({"_id": ObjectId(subscription_id)})
        return SubscriptionInDB.from_mongo(updated_doc)
    
    @staticmethod
    def is_trial_active(subscription: SubscriptionInDB) -> bool:
        """Check if trial is still active."""
        if subscription.status != SubscriptionStatus.TRIAL:
            return False
        if not subscription.trial_end:
            return False
        return datetime.utcnow() < subscription.trial_end
    
    @staticmethod
    def is_subscription_active(subscription: SubscriptionInDB) -> bool:
        """Check if subscription is active (paid or trial)."""
        if subscription.status == SubscriptionStatus.ACTIVE:
            return True
        if subscription.status == SubscriptionStatus.TRIAL:
            return SubscriptionService.is_trial_active(subscription)
        return False
    
    @staticmethod
    def get_argument_limit(subscription: SubscriptionInDB) -> int:
        """Get argument limit for subscription tier."""
        if subscription.status == SubscriptionStatus.TRIAL:
            return UsageLimit.FREE_TRIAL_ARGS
        if subscription.tier == SubscriptionTier.BASIC:
            return UsageLimit.BASIC_MONTHLY_ARGS  # Unlimited
        if subscription.tier == SubscriptionTier.PREMIUM:
            return UsageLimit.PREMIUM_MONTHLY_ARGS  # Unlimited
        return 0  # No subscription


subscription_service = SubscriptionService()

