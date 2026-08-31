"""Dashboard overview endpoint for mobile/web clients."""

import logging
from collections import defaultdict
from datetime import date, datetime, timedelta
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.checkins import _build_checkin_response
from app.api.dependencies import get_current_user
from app.api.goals import _build_goal_response, _parse_goal_doc
from app.api.schemas import ArgumentResponse
from app.core.sanitization import couple_id_query
from app.db.database import get_database
from app.models.argument import ArgumentInDB
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.relationship_checkin import CheckInStatus, RelationshipCheckInInDB
from app.models.usage import UsageType
from app.models.user import UserInDB
from app.services.subscription_service import subscription_service
from app.services.usage_service import usage_service

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])
logger = logging.getLogger(__name__)

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


def _build_dashboard_argument_response(
    argument: ArgumentInDB,
    current_user: UserInDB,
    partner_id: str,
    perspective_docs: list[dict],
    insight_doc: Optional[dict],
) -> ArgumentResponse:
    """Build argument journey state using already-fetched dashboard data."""

    perspective_map = {str(doc["user_id"]): doc for doc in perspective_docs}
    current_user_has_perspective = str(current_user.id) in perspective_map
    partner_has_perspective = partner_id in perspective_map
    perspective_count = len(perspective_map)

    latest_context_at = argument.latest_context_at or argument.updated_at
    for doc in perspective_docs:
        updated_at = doc.get("updated_at") or doc.get("created_at")
        if updated_at and (latest_context_at is None or updated_at > latest_context_at):
            latest_context_at = updated_at

    insight_generated_at = insight_doc.get("generated_at") if insight_doc else None

    if perspective_count < 2:
        insight_status = "not_ready"
    elif insight_generated_at is None:
        insight_status = "ready"
    elif latest_context_at and latest_context_at > insight_generated_at:
        insight_status = "stale"
    else:
        insight_status = "current"

    archived_for_current_user = str(current_user.id) in (
        getattr(argument, "archived_for_user_ids", None) or []
    )
    resolution_acknowledgements = set(
        getattr(argument, "resolution_acknowledged_by_user_ids", None) or []
    )
    resolution_acknowledged_by_current_user = str(current_user.id) in resolution_acknowledgements
    resolution_acknowledged_by_partner = partner_id in resolution_acknowledgements
    effective_status = "archived" if archived_for_current_user else argument.status.value
    awaiting_response_from_user_id = None
    if not archived_for_current_user:
        if not current_user_has_perspective:
            awaiting_response_from_user_id = str(current_user.id)
        elif not partner_has_perspective:
            awaiting_response_from_user_id = partner_id

    return ArgumentResponse(
        id=argument.id,
        couple_id=argument.couple_id,
        title=argument.title,
        category=argument.category.value,
        priority=argument.priority.value,
        status=effective_status,
        created_by_user_id=argument.created_by_user_id,
        perspective_count=perspective_count,
        current_user_has_perspective=current_user_has_perspective,
        partner_has_perspective=partner_has_perspective,
        awaiting_response_from_user_id=awaiting_response_from_user_id,
        needs_user_response=awaiting_response_from_user_id == str(current_user.id),
        archived_for_current_user=archived_for_current_user,
        insight_status=insight_status,
        can_generate_insight=insight_status in {"ready", "stale"},
        insight_generated_at=insight_generated_at,
        latest_context_at=latest_context_at,
        resolution_acknowledged_by_current_user=resolution_acknowledged_by_current_user,
        resolution_acknowledged_by_partner=resolution_acknowledged_by_partner,
        resolution_pending=(
            not archived_for_current_user
            and argument.status.value != "resolved"
            and resolution_acknowledged_by_current_user
            and not resolution_acknowledged_by_partner
        ),
        created_at=argument.created_at,
        updated_at=argument.updated_at,
    )


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
    argument_docs = await (
        db.arguments.find(
            {
                "couple_id": couple_id_query(couple.id),
                "hidden_for_user_ids": {"$ne": current_user.id},
                "status": {"$ne": "archived"},
            }
        )
        .sort("created_at", -1)
        .limit(MAX_RECENT_ARGUMENTS)
        .to_list(length=MAX_RECENT_ARGUMENTS)
    )

    argument_ids = [doc["_id"] for doc in argument_docs if doc.get("_id")]
    perspectives_by_argument_id: dict[str, list[dict]] = defaultdict(list)
    if argument_ids:
        perspective_docs = await db.perspectives.find(
            {"argument_id": {"$in": argument_ids}}
        ).to_list(length=MAX_RECENT_ARGUMENTS * 4)
        for doc in perspective_docs:
            perspectives_by_argument_id[str(doc["argument_id"])].append(doc)

    insights_by_argument_id: dict[str, dict] = {}
    if argument_ids:
        insight_docs = await db.ai_insights.find(
            {"argument_id": {"$in": argument_ids}}
        ).to_list(length=MAX_RECENT_ARGUMENTS)
        insights_by_argument_id = {
            str(doc["argument_id"]): doc for doc in insight_docs if doc.get("argument_id")
        }

    partner_id = couple.user1_id if current_user.id == couple.user2_id else couple.user2_id
    arguments = []
    for arg_doc in argument_docs:
        try:
            argument = ArgumentInDB.from_mongo(arg_doc)
            enriched_argument = _build_dashboard_argument_response(
                argument=argument,
                current_user=current_user,
                partner_id=partner_id,
                perspective_docs=perspectives_by_argument_id.get(argument.id, []),
                insight_doc=insights_by_argument_id.get(argument.id),
            )
        except Exception:
            logger.exception(
                "Failed to build dashboard argument response argument_id=%s",
                arg_doc.get("_id"),
            )
            continue
        arguments.append(enriched_argument.model_dump())

    # Active goals
    goals_cursor = (
        db.relationship_goals.find(
            {
                "couple_id": couple_id_query(couple.id),
                "status": "active",
                "hidden_for_user_ids": {"$ne": current_user.id},
            }
        )
        .sort("created_at", -1)
        .limit(5)
    )
    goals = []
    async for goal_doc in goals_cursor:
        try:
            enriched_goal = _build_goal_response(
                goal=_parse_goal_doc(goal_doc),
                current_user=current_user,
                couple=couple,
            )
        except Exception:
            logger.exception(
                "Failed to build dashboard goal response goal_id=%s",
                goal_doc.get("_id"),
            )
            continue
        goals.append(enriched_goal.model_dump())

    # Current check-in status
    today = date.today()
    week_start_date = today - timedelta(days=today.weekday())
    current_week_start = datetime.combine(week_start_date, datetime.min.time())
    checkin_doc = await db.relationship_checkins.find_one(
        {
            "couple_id": couple_id_query(couple.id),
            "week_start_date": current_week_start,
        }
    )
    if not checkin_doc:
        current_checkin = {
            "status": CheckInStatus.PENDING.value,
            "completed_at": None,
        }
    elif checkin_doc:
        enriched_checkin = await _build_checkin_response(
            checkin=RelationshipCheckInInDB.from_mongo(checkin_doc),
            current_user=current_user,
            couple=couple,
            db=db,
        )
        current_checkin = enriched_checkin.model_dump()
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
