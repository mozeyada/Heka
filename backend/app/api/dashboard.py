"""Dashboard overview endpoint for mobile/web clients."""

from fastapi import APIRouter, Depends, HTTPException, status
from typing import Optional, Dict, Any
from bson import ObjectId
from datetime import datetime, date, timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.models.user import UserInDB
from app.services.subscription_service import subscription_service
from app.services.usage_service import usage_service
from app.models.usage import UsageType
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.relationship_checkin import CheckInStatus

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

MAX_RECENT_ARGUMENTS = 5


async def _get_couple(
    user_id: str,
    db: AsyncIOMotorDatabase,
) -> Optional[CoupleInDB]:
    couple_doc = await db.couples.find_one(
        {
            "$or": [
                {"user1_id": ObjectId(user_id)},
                {"user2_id": ObjectId(user_id)},
            ],
            "status": CoupleStatus.ACTIVE.value,
        }
    )
    if not couple_doc:
        return None
    return CoupleInDB.from_mongo(couple_doc)


@router.get("/overview")
async def get_dashboard_overview(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Aggregate data for dashboard home screen."""

    couple = await _get_couple(user_id=current_user.id, db=db)
    if not couple:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found",
        )

    subscription = await subscription_service.get_or_create_subscription(couple.id, db)
    usage_count = await usage_service.get_usage_count(
        couple.id, UsageType.ARGUMENT_RESOLUTION, subscription, db
    )
    limit = subscription_service.get_argument_limit(subscription)
    period_start, period_end = usage_service.get_period_dates(subscription)

    # Recent arguments
    arguments_cursor = (
        db.arguments.find({"couple_id": ObjectId(couple.id)})
        .sort("created_at", -1)
        .limit(MAX_RECENT_ARGUMENTS)
    )
    arguments = []
    async for arg_doc in arguments_cursor:
        arguments.append(
            {
                "id": str(arg_doc["_id"]),
                "title": arg_doc.get("title", ""),
                "priority": arg_doc.get("priority", ""),
                "status": arg_doc.get("status", ""),
                "category": arg_doc.get("category", ""),
                "created_at": arg_doc.get("created_at"),
            }
        )

    # Active goals
    goals_cursor = (
        db.relationship_goals.find(
            {
                "couple_id": ObjectId(couple.id),
                "status": "active",
            }
        )
        .sort("created_at", -1)
        .limit(5)
    )
    goals = []
    async for goal_doc in goals_cursor:
        goals.append(
            {
                "id": str(goal_doc["_id"]),
                "title": goal_doc.get("title", ""),
                "status": goal_doc.get("status", ""),
                "target_date": goal_doc.get("target_date"),
            }
        )

    # Current check-in status
    today = date.today()
    week_start_date = today - timedelta(days=today.weekday())
    current_week_start = datetime.combine(week_start_date, datetime.min.time())
    checkin_doc = await db.relationship_checkins.find_one(
        {
            "couple_id": ObjectId(couple.id),
            "week_start_date": current_week_start,
        }
    )
    if not checkin_doc:
        current_checkin = {
            "status": CheckInStatus.PENDING.value,
            "completed_at": None,
        }
    elif checkin_doc:
        current_checkin = {
            "id": str(checkin_doc["_id"]),
            "status": checkin_doc.get("status", ""),
            "completed_at": checkin_doc.get("completed_at"),
        }
    else:
        current_checkin = {
            "status": CheckInStatus.PENDING.value,
            "completed_at": None,
        }

    overview: Dict[str, Any] = {
        "subscription": {
            "tier": subscription.tier.value,
            "status": subscription.status.value,
            "trial_end": subscription.trial_end,
            "period_start": subscription.current_period_start,
            "period_end": subscription.current_period_end,
        },
        "usage": {
            "count": usage_count,
            "limit": limit,
            "is_unlimited": limit == -1,
            "period_start": period_start,
            "period_end": period_end,
        },
        "arguments": arguments,
        "goals": goals,
        "current_checkin": current_checkin,
        "week_start_date": week_start_date.isoformat(),
    }

    return overview


