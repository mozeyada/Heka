"""Subscription service for managing subscriptions."""

import logging
from datetime import datetime, timedelta
from typing import Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.sanitization import couple_id_query
from app.models.subscription import (
    SubscriptionInDB,
    SubscriptionStatus,
    SubscriptionTier,
    UsageLimit,
)

logger = logging.getLogger(__name__)


class SubscriptionService:
    """Service for managing subscriptions."""

    @staticmethod
    def _persistable_fields(subscription: SubscriptionInDB) -> dict:
        """Return subscription fields safe to use in a $set update."""
        return subscription.model_dump(exclude={"id"})

    @staticmethod
    def _normalize_subscription(subscription: SubscriptionInDB) -> SubscriptionInDB:
        """Normalize inconsistent subscription fields into a coherent state."""
        changed = False
        now = datetime.utcnow()

        if (
            subscription.status in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}
            and subscription.tier in {SubscriptionTier.STARTER, SubscriptionTier.PREMIUM}
        ):
            if subscription.trial_start is not None:
                subscription.trial_start = None
                changed = True
            if subscription.trial_end is not None:
                subscription.trial_end = None
                changed = True

        if subscription.status in {
            SubscriptionStatus.ACTIVE,
            SubscriptionStatus.PAST_DUE,
            SubscriptionStatus.TRIAL,
        }:
            if subscription.current_period_start is None:
                subscription.current_period_start = now
                changed = True
            if subscription.current_period_end is None:
                default_days = (
                    UsageLimit.FREE_TRIAL_DAYS
                    if subscription.status == SubscriptionStatus.TRIAL
                    else 30
                )
                subscription.current_period_end = subscription.current_period_start + timedelta(days=default_days)
                changed = True

        if (
            subscription.status in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}
            and subscription.cancelled_at is not None
        ):
            subscription.cancelled_at = None
            changed = True

        if subscription.status == SubscriptionStatus.EXPIRED and subscription.cancel_at_period_end:
            subscription.cancel_at_period_end = False
            changed = True

        if changed:
            subscription.updated_at = now

        return subscription
    
    @staticmethod
    async def get_or_create_subscription(
        couple_id: str,
        db: AsyncIOMotorDatabase
    ) -> SubscriptionInDB:
        """Get existing subscription or create a free trial subscription."""
        # Check if subscription exists
        sub_doc = await db.subscriptions.find_one({"couple_id": couple_id_query(couple_id)})
        
        if sub_doc:
            subscription = SubscriptionInDB.from_mongo(sub_doc)
            original = subscription.model_copy(deep=True)
            normalized = SubscriptionService._normalize_subscription(subscription)
            if normalized.model_dump() != original.model_dump():
                await db.subscriptions.update_one(
                    {"_id": ObjectId(normalized.id)},
                    {"$set": SubscriptionService._persistable_fields(normalized)}
                )
            return normalized
        
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
        sub_doc = await db.subscriptions.find_one({"couple_id": couple_id_query(couple_id)})
        if sub_doc:
            subscription = SubscriptionInDB.from_mongo(sub_doc)
            original = subscription.model_copy(deep=True)
            normalized = SubscriptionService._normalize_subscription(subscription)
            if normalized.model_dump() != original.model_dump():
                await db.subscriptions.update_one(
                    {"_id": ObjectId(normalized.id)},
                    {"$set": SubscriptionService._persistable_fields(normalized)}
                )
            return normalized
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
        subscription = SubscriptionInDB.from_mongo(updated_doc)
        original = subscription.model_copy(deep=True)
        normalized = SubscriptionService._normalize_subscription(subscription)
        if normalized.model_dump() != original.model_dump():
            await db.subscriptions.update_one(
                {"_id": ObjectId(subscription_id)},
                {"$set": SubscriptionService._persistable_fields(normalized)}
            )
        return normalized
    
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
        """Check if subscription grants access (paid, grace-period, or trial)."""
        if subscription.status in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}:
            return True
        if subscription.status == SubscriptionStatus.TRIAL:
            return SubscriptionService.is_trial_active(subscription)
        return False
    
    @staticmethod
    def get_argument_limit(subscription: SubscriptionInDB) -> int:
        """Get argument limit for subscription tier."""
        if subscription.status == SubscriptionStatus.TRIAL:
            if subscription.tier == SubscriptionTier.STARTER:
                return UsageLimit.STARTER_MONTHLY_ARGS
            if subscription.tier == SubscriptionTier.PREMIUM:
                return UsageLimit.PREMIUM_MONTHLY_ARGS  # Unlimited
            return UsageLimit.FREE_TRIAL_ARGS
        if subscription.status in {SubscriptionStatus.ACTIVE, SubscriptionStatus.PAST_DUE}:
            if subscription.tier == SubscriptionTier.STARTER:
                return UsageLimit.STARTER_MONTHLY_ARGS
            if subscription.tier == SubscriptionTier.PREMIUM:
                return UsageLimit.PREMIUM_MONTHLY_ARGS  # Unlimited
        return 0  # No subscription


subscription_service = SubscriptionService()
