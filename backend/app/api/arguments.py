"""Arguments endpoints."""

from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.api.schemas import ArgumentCreate, ArgumentResponse, ArgumentUpdate
from app.core.sanitization import sanitize_text, validate_object_id
from app.db.database import get_database
from app.models.argument import (
    ArgumentCategory,
    ArgumentInDB,
    ArgumentPriority,
    ArgumentStatus,
)
from app.models.couple import CoupleStatus
from app.models.user import UserInDB
from app.services.in_app_notification_service import create_in_app_notification

router = APIRouter(prefix="/api/arguments", tags=["Arguments"])


def _is_hidden_for_user(argument: ArgumentInDB, user_id: str) -> bool:
    return user_id in (getattr(argument, "hidden_for_user_ids", None) or [])


def _is_archived_for_user(argument: ArgumentInDB, user_id: str) -> bool:
    return user_id in (getattr(argument, "archived_for_user_ids", None) or [])


async def _build_argument_response(
    argument: ArgumentInDB,
    current_user: UserInDB,
    db: AsyncIOMotorDatabase,
) -> ArgumentResponse:
    """Build an enriched argument response with journey metadata."""

    couple_doc = await db.couples.find_one({"_id": ObjectId(argument.couple_id)})
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Couple not found for argument",
        )

    user1_id = str(couple_doc["user1_id"])
    user2_id = str(couple_doc["user2_id"])
    partner_id = user2_id if str(current_user.id) == user1_id else user1_id

    perspective_docs = await db.perspectives.find({"argument_id": ObjectId(argument.id)}).to_list(length=10)
    perspective_map = {
        str(doc["user_id"]): doc
        for doc in perspective_docs
    }

    current_user_has_perspective = str(current_user.id) in perspective_map
    partner_has_perspective = partner_id in perspective_map
    perspective_count = len(perspective_map)

    latest_context_at = argument.latest_context_at or argument.updated_at
    for doc in perspective_docs:
        updated_at = doc.get("updated_at") or doc.get("created_at")
        if updated_at and (latest_context_at is None or updated_at > latest_context_at):
            latest_context_at = updated_at

    insight_doc = await db.ai_insights.find_one({"argument_id": ObjectId(argument.id)})
    insight_generated_at = insight_doc.get("generated_at") if insight_doc else None

    if perspective_count < 2:
        insight_status = "not_ready"
    elif insight_generated_at is None:
        insight_status = "ready"
    elif latest_context_at and latest_context_at > insight_generated_at:
        insight_status = "stale"
    else:
        insight_status = "current"

    archived_for_current_user = _is_archived_for_user(argument, str(current_user.id))
    resolution_acknowledgements = set(
        getattr(argument, "resolution_acknowledged_by_user_ids", None) or []
    )
    resolution_acknowledged_by_current_user = str(current_user.id) in resolution_acknowledgements
    resolution_acknowledged_by_partner = partner_id in resolution_acknowledgements
    effective_status = (
        ArgumentStatus.ARCHIVED.value
        if archived_for_current_user
        else argument.status.value
    )
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
            and argument.status != ArgumentStatus.RESOLVED
            and resolution_acknowledged_by_current_user
            and not resolution_acknowledged_by_partner
        ),
        created_at=argument.created_at,
        updated_at=argument.updated_at,
    )


@router.post("/create", response_model=ArgumentResponse, status_code=status.HTTP_201_CREATED)
async def create_argument(
    argument_data: ArgumentCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new argument."""
    
    # Sanitize title input
    try:
        sanitized_title = sanitize_text(argument_data.title, max_length=255)
        sanitized_initial_perspective = sanitize_text(argument_data.initial_perspective, max_length=5000)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Verify user is in an active couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You must be in an active couple to create arguments"
        )
    
    from app.models.couple import CoupleInDB
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Check usage limits
    from app.models.usage import UsageType
    from app.services.subscription_service import subscription_service
    from app.services.usage_service import usage_service
    
    subscription = await subscription_service.get_or_create_subscription(couple.id, db)
    
    # Check if we can create an argument
    is_allowed, current_count, limit = await usage_service.check_usage_limit(
        couple.id, UsageType.ARGUMENT_RESOLUTION, subscription, db
    )
    
    if not is_allowed:
        if subscription.status.value == "trial" and subscription.tier.value == "free":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Trial limit reached. You've used {current_count}/{limit} argument resolutions. Please upgrade to continue."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usage limit reached for the current subscription state. Please review your subscription."
            )
    
    # Validate category
    try:
        category = ArgumentCategory(argument_data.category)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid category. Must be one of: {[c.value for c in ArgumentCategory]}"
        )
    
    # Validate priority
    try:
        priority = ArgumentPriority(argument_data.priority)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid priority. Must be one of: {[p.value for p in ArgumentPriority]}"
        )
    
    # Create argument
    latest_context_at = datetime.utcnow()
    argument = ArgumentInDB(
        couple_id=couple.id,
        title=sanitized_title,
        category=category,
        priority=priority,
        status=ArgumentStatus.DRAFT,
        created_by_user_id=current_user.id,
        latest_context_at=latest_context_at,
    )
    
    result = await db.arguments.insert_one(argument.to_mongo())
    argument.id = str(result.inserted_id)

    from app.models.perspective import PerspectiveInDB

    # The creator should provide the first perspective immediately.

    perspective = PerspectiveInDB(
        argument_id=argument.id,
        user_id=current_user.id,
        content=sanitized_initial_perspective,
        updated_at=latest_context_at,
    )
    await db.perspectives.insert_one(perspective.to_mongo())
    
    # Invalidate suggestion cache when any new argument is created to ensure fresh insights
    from app.services.ai_suggestion_cache import ai_suggestion_cache_service
    await ai_suggestion_cache_service.invalidate_cache(couple.id)

    # Track usage
    await usage_service.track_usage(
        couple.id,
        UsageType.ARGUMENT_RESOLUTION,
        argument.id,
        subscription,
        db
    )
    
    return await _build_argument_response(argument, current_user, db)


@router.get("/", response_model=List[ArgumentResponse])
async def get_arguments(
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
    category_filter: Optional[str] = None,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all arguments for current user's couple."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        return []
    
    from app.models.couple import CoupleInDB
    couple = CoupleInDB.from_mongo(couple_doc)
    
    if limit < 1 or limit > 100:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit must be between 1 and 100"
        )
    if offset < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="offset must be >= 0"
        )

    query: Dict[str, Any] = {
        "couple_id": ObjectId(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    }
    if status_filter:
        query["status"] = status_filter
    if category_filter:
        query["category"] = category_filter

    cursor = (
        db.arguments.find(query)
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    )
    arguments: List[ArgumentResponse] = []

    async for arg_doc in cursor:
        arg = ArgumentInDB.from_mongo(arg_doc)
        arguments.append(await _build_argument_response(arg, current_user, db))
    
    return arguments


@router.get("/{argument_id}", response_model=ArgumentResponse)
async def get_argument(
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific argument."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    # Verify user has access to this argument (through couple)
    argument = ArgumentInDB.from_mongo(arg_doc)
    if _is_hidden_for_user(argument, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ]
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this argument"
        )
    
    return await _build_argument_response(argument, current_user, db)


@router.patch("/{argument_id}/status", response_model=ArgumentResponse)
async def update_argument_status(
    argument_id: str,
    status_update: ArgumentUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update argument status."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Get argument and verify it exists
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    # Verify user has access to this argument (through couple)
    argument = ArgumentInDB.from_mongo(arg_doc)
    if _is_hidden_for_user(argument, current_user.id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ]
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this argument"
        )
        
    if not status_update.status:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Status is required"
        )

    # The public endpoint expresses a participant's intent rather than exposing
    # every internal state-machine transition. Analysis and archive transitions
    # are owned by their dedicated workflows.
    try:
        new_status = ArgumentStatus(status_update.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {[s.value for s in ArgumentStatus]}"
        )

    if new_status not in {ArgumentStatus.ACTIVE, ArgumentStatus.RESOLVED}:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only active (reopen) or resolved (acknowledge) can be set directly.",
        )

    updated_at = datetime.utcnow()

    if new_status == ArgumentStatus.ACTIVE:
        await db.arguments.update_one(
            {"_id": argument_oid},
            {"$set": {
                "status": ArgumentStatus.ACTIVE.value,
                "resolution_acknowledged_by_user_ids": [],
                "updated_at": updated_at,
            }},
        )
    else:
        # Resolution is a mutual acknowledgement of the shared plan, not a
        # unilateral judgement that the other person's concern is finished.
        if argument.status != ArgumentStatus.ANALYZED:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Generate a current mediation plan before acknowledging resolution.",
            )
        acknowledgements = set(
            getattr(argument, "resolution_acknowledged_by_user_ids", None) or []
        )
        acknowledgements.add(str(current_user.id))
        both_acknowledged = {str(couple_doc["user1_id"]), str(couple_doc["user2_id"])}.issubset(
            acknowledgements
        )
        await db.arguments.update_one(
            {"_id": argument_oid},
            {"$set": {
                "status": (
                    ArgumentStatus.RESOLVED.value
                    if both_acknowledged
                    else argument.status.value
                ),
                "resolution_acknowledged_by_user_ids": list(acknowledgements),
                "updated_at": updated_at,
            }},
        )

    updated_doc = await db.arguments.find_one({"_id": argument_oid})
    return await _build_argument_response(
        ArgumentInDB.from_mongo(updated_doc), current_user, db
    )


@router.delete("/{argument_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_argument(
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove an argument from the actor's space and archive it for the partner."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Get argument and verify it exists
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    # Verify user has access to this argument (through couple)
    argument = ArgumentInDB.from_mongo(arg_doc)
    if _is_hidden_for_user(argument, current_user.id):
        return None
    
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ]
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this argument"
        )

    user1_id = str(couple_doc["user1_id"])
    user2_id = str(couple_doc["user2_id"])
    partner_id = user2_id if str(current_user.id) == user1_id else user1_id

    hidden_for_user_ids = set(getattr(argument, "hidden_for_user_ids", None) or [])
    archived_for_user_ids = set(getattr(argument, "archived_for_user_ids", None) or [])
    hidden_for_user_ids.add(current_user.id)
    archived_for_user_ids.discard(current_user.id)

    if partner_id not in hidden_for_user_ids:
        archived_for_user_ids.add(partner_id)

    await db.arguments.update_one(
        {"_id": argument_oid},
        {
            "$set": {
                "status": ArgumentStatus.ARCHIVED.value,
                "hidden_for_user_ids": list(hidden_for_user_ids),
                "archived_for_user_ids": list(archived_for_user_ids),
                "updated_at": datetime.utcnow(),
            }
        }
    )

    if partner_id not in hidden_for_user_ids:
        await create_in_app_notification(
            db=db,
            recipient_user_id=partner_id,
            preference_key="partner_activity",
            category="partner_stepped_away",
            title="Your partner stepped away from an issue",
            body=f"{argument.title} is now archived in your space. New shared updates will no longer be sent to your partner.",
            resource_type="argument",
            resource_id=argument.id,
            action_path=f"/arguments/{argument.id}",
            actor_user_id=current_user.id,
            metadata={"argument_title": argument.title},
        )
    return None
