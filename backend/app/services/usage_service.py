"""Usage tracking service."""

from datetime import datetime, date, timedelta
from app.models.usage import UsageInDB, UsageType
from app.models.subscription import SubscriptionInDB, SubscriptionStatus
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import Optional
import logging

logger = logging.getLogger(__name__)


class UsageService:
    """Service for tracking and checking usage limits."""
    
    @staticmethod
    def get_period_dates(subscription: SubscriptionInDB) -> tuple:
        """Get current period start and end dates."""
        if subscription.current_period_start:
            period_start = subscription.current_period_start.date()
        else:
            period_start = date.today()
        
        if subscription.current_period_end:
            period_end = subscription.current_period_end.date()
        else:
            # Default to 30 days from start
            period_end = (datetime.combine(period_start, datetime.min.time()) + timedelta(days=30)).date()
        
        return period_start, period_end
    
    @staticmethod
    async def track_usage(
        couple_id: str,
        usage_type: UsageType,
        argument_id: Optional[str] = None,
        subscription: Optional[SubscriptionInDB] = None,
        db: AsyncIOMotorDatabase = None
    ) -> UsageInDB:
        """Track usage for a couple."""
        if not subscription:
            from app.services.subscription_service import subscription_service
            subscription = await subscription_service.get_subscription(couple_id, db)
        
        if not subscription:
            raise ValueError("Subscription not found")
        
        period_start, period_end = UsageService.get_period_dates(subscription)
        
        # Check if usage entry exists for this period
        usage_doc = await db.usages.find_one({
            "couple_id": ObjectId(couple_id),
            "usage_type": usage_type.value,
            "period_start": datetime.combine(period_start, datetime.min.time()),
            "period_end": datetime.combine(period_end, datetime.min.time()),
            "argument_id": ObjectId(argument_id) if argument_id else None
        })
        
        if usage_doc:
            # Increment count
            await db.usages.update_one(
                {"_id": usage_doc["_id"]},
                {"$inc": {"count": 1}}
            )
            updated_doc = await db.usages.find_one({"_id": usage_doc["_id"]})
            return UsageInDB.from_mongo(updated_doc)
        else:
            # Create new usage entry
            usage = UsageInDB(
                couple_id=couple_id,
                usage_type=usage_type,
                argument_id=argument_id,
                period_start=period_start,
                period_end=period_end,
                count=1
            )
            result = await db.usages.insert_one(usage.to_mongo())
            usage.id = str(result.inserted_id)
            return usage
    
    @staticmethod
    async def get_usage_count(
        couple_id: str,
        usage_type: UsageType,
        subscription: Optional[SubscriptionInDB] = None,
        db: AsyncIOMotorDatabase = None
    ) -> int:
        """Get usage count for current period."""
        if not subscription:
            from app.services.subscription_service import subscription_service
            subscription = await subscription_service.get_subscription(couple_id, db)
        
        if not subscription:
            return 0
        
        period_start, period_end = UsageService.get_period_dates(subscription)
        
        # Sum all usage entries for this period
        pipeline = [
            {
                "$match": {
                    "couple_id": ObjectId(couple_id),
                    "usage_type": usage_type.value,
                    "period_start": {"$gte": datetime.combine(period_start, datetime.min.time())},
                    "period_end": {"$lte": datetime.combine(period_end, datetime.min.time())}
                }
            },
            {
                "$group": {
                    "_id": None,
                    "total": {"$sum": "$count"}
                }
            }
        ]
        
        result = await db.usages.aggregate(pipeline).to_list(length=1)
        if result:
            return result[0].get("total", 0)
        return 0
    
    @staticmethod
    async def check_usage_limit(
        couple_id: str,
        usage_type: UsageType,
        subscription: Optional[SubscriptionInDB] = None,
        db: AsyncIOMotorDatabase = None
    ) -> tuple[bool, int, int]:
        """
        Check if usage is within limits.
        Returns: (is_allowed, current_count, limit)
        """
        if not subscription:
            from app.services.subscription_service import subscription_service
            subscription = await subscription_service.get_subscription(couple_id, db)
        
        if not subscription:
            return False, 0, 0
        
        from app.services.subscription_service import subscription_service
        limit = subscription_service.get_argument_limit(subscription)
        
        # Unlimited means -1
        if limit == -1:
            return True, 0, -1
        
        current_count = await UsageService.get_usage_count(couple_id, usage_type, subscription, db)
        is_allowed = current_count < limit
        
        return is_allowed, current_count, limit


usage_service = UsageService()

