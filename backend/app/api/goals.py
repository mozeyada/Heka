"""Relationship Goals API endpoints."""

import logging
from datetime import date, datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pydantic import ValidationError

from app.api.dependencies import get_current_user
from app.api.schemas import (
    GoalCreate,
    GoalProgressUpdate,
    GoalReactionCreate,
    GoalResponse,
)
from app.db.database import get_database
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.relationship_goal import GoalProgress, GoalStatus, RelationshipGoalInDB
from app.models.user import UserInDB
from app.core.sanitization import couple_id_query
from app.services.in_app_notification_service import create_in_app_notification

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals", tags=["Relationship Goals"])


def _is_goal_hidden_for_user(goal: RelationshipGoalInDB, user_id: str) -> bool:
    return user_id in (goal.hidden_for_user_ids or [])


def _is_goal_archived_for_user(goal: RelationshipGoalInDB, user_id: str) -> bool:
    return user_id in (goal.archived_for_user_ids or [])


def _serialize_goal_progress(goal: RelationshipGoalInDB) -> list[dict]:
    return [
        {
            "id": p.id if hasattr(p, "id") else None,
            "user_id": p.user_id if hasattr(p, "user_id") else None,
            "date": p.date.isoformat(),
            "notes": p.notes,
            "progress_value": p.progress_value,
            "reactions": p.reactions if hasattr(p, "reactions") else [],
        }
        for p in goal.progress
    ]


def _parse_goal_doc(doc: dict) -> RelationshipGoalInDB:
    """Parse a goal document defensively so one malformed legacy record cannot break the whole feed."""
    try:
        return RelationshipGoalInDB.from_mongo(doc)
    except (ValidationError, ValueError, TypeError) as exc:
        logger.exception(
            "Failed to parse relationship goal document goal_id=%s",
            doc.get("_id"),
            exc_info=exc,
        )
        raise


def _build_goal_response(
    goal: RelationshipGoalInDB,
    current_user: UserInDB,
    couple: CoupleInDB,
) -> GoalResponse:
    partner_id = couple.user1_id if current_user.id == couple.user2_id else couple.user2_id
    current_user_has_progress = any(p.user_id == current_user.id for p in goal.progress)
    partner_has_progress = any(p.user_id == partner_id for p in goal.progress)
    latest_progress = goal.progress[-1] if goal.progress else None
    latest_progress_id = latest_progress.id if latest_progress else None
    latest_progress_by_user_id = latest_progress.user_id if latest_progress else None
    latest_progress_note = latest_progress.notes if latest_progress else None
    latest_progress_value = latest_progress.progress_value if latest_progress else None
    latest_progress_at: Optional[datetime] = None
    latest_progress_acknowledged_by_current_user = True

    if latest_progress and latest_progress.date:
        latest_progress_at = datetime.combine(latest_progress.date, datetime.min.time())
        if latest_progress_by_user_id and latest_progress_by_user_id != current_user.id:
            latest_progress_acknowledged_by_current_user = any(
                reaction.get("user_id") == current_user.id
                for reaction in (latest_progress.reactions or [])
            )

    if goal.status == GoalStatus.ARCHIVED:
        momentum_state = "archived"
        needs_user_progress = False
        next_action_type = "archive"
        next_action_title = "This goal has moved into archive."
        next_action_description = (
            "Your partner stepped away from this goal, so it now lives as reference rather than an active shared track."
        )
    elif goal.status == GoalStatus.COMPLETED:
        momentum_state = "completed"
        needs_user_progress = False
        next_action_type = "review"
        next_action_title = "This goal has landed."
        next_action_description = (
            "Review what worked, acknowledge each other, and decide whether this habit should become your new baseline."
        )
    elif not latest_progress:
        momentum_state = "new"
        needs_user_progress = True
        next_action_type = "add_progress"
        if goal.created_by_user_id == current_user.id:
            next_action_title = "Start the shared path."
            next_action_description = (
                "Anchor this goal with the first concrete move you will take, so your partner can respond with theirs."
            )
        else:
            next_action_title = "Your partner opened a shared goal."
            next_action_description = (
                "Add your first supporting move so this goal becomes a joint practice instead of a solo intention."
            )
    elif latest_progress_by_user_id == current_user.id:
        momentum_state = "waiting_on_partner" if not partner_has_progress else "in_motion"
        needs_user_progress = False
        next_action_type = "wait"
        next_action_title = "You moved this goal forward."
        next_action_description = (
            "Hold your side steady and let your partner answer with a reaction or their next concrete step."
        )
    else:
        momentum_state = "reply_needed" if not current_user_has_progress else "your_turn"
        needs_user_progress = True
        next_action_type = "add_progress"
        next_action_title = "Your partner just advanced this goal."
        next_action_description = (
            "Close the loop with your own step, reflection, or encouragement so the momentum stays shared."
        )

    archived_for_current_user = _is_goal_archived_for_user(goal, current_user.id)
    effective_status = (
        GoalStatus.ARCHIVED.value
        if archived_for_current_user
        else goal.status.value
    )

    return GoalResponse(
        id=goal.id,
        couple_id=goal.couple_id,
        title=goal.title,
        description=goal.description,
        status=effective_status,
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        progress=_serialize_goal_progress(goal),
        created_by_user_id=goal.created_by_user_id,
        current_user_has_progress=current_user_has_progress,
        partner_has_progress=partner_has_progress,
        latest_progress_id=latest_progress_id,
        latest_progress_by_user_id=latest_progress_by_user_id,
        latest_progress_at=latest_progress_at,
        latest_progress_note=latest_progress_note,
        latest_progress_value=latest_progress_value,
        latest_progress_acknowledged_by_current_user=latest_progress_acknowledged_by_current_user,
        needs_user_progress=needs_user_progress,
        archived_for_current_user=archived_for_current_user,
        next_action_type=next_action_type,
        next_action_title=next_action_title,
        next_action_description=next_action_description,
        momentum_state=momentum_state,
        progress_updates=goal.progress_updates,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        completed_at=goal.completed_at,
    )


@router.post("/create", response_model=GoalResponse, status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: GoalCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a new relationship goal."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Check goal limit (max 10 active goals per couple)
    active_goals_count = await db.relationship_goals.count_documents({
        "couple_id": couple_id_query(couple.id),
        "status": GoalStatus.ACTIVE.value
    })
    
    if active_goals_count >= 10:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 10 active goals allowed per couple"
        )
    
    # Parse target date if provided
    target_date_obj = None
    if goal_data.target_date:
        try:
            target_date_obj = datetime.fromisoformat(goal_data.target_date.replace('Z', '+00:00')).date()
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid date format. Use ISO format (YYYY-MM-DD)"
            )
    
    title = goal_data.title.strip()
    description = goal_data.description.strip() if goal_data.description else None
    first_step = goal_data.first_step.strip()

    if not title:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Goal title cannot be empty"
        )

    if not first_step:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add the first concrete step so your partner can build on it"
        )

    # Create goal
    goal = RelationshipGoalInDB(
        couple_id=couple.id,
        title=title,
        description=description,
        status=GoalStatus.ACTIVE,
        target_date=target_date_obj,
        created_by_user_id=current_user.id,
        progress=[
            GoalProgress(
                user_id=current_user.id,
                date=date.today(),
                notes=first_step,
                progress_value=None,
                reactions=[],
            )
        ],
        progress_updates=1,
    )
    
    result = await db.relationship_goals.insert_one(goal.to_mongo())
    goal.id = str(result.inserted_id)

    from app.services.ai_suggestion_cache import ai_suggestion_cache_service

    await ai_suggestion_cache_service.invalidate_cache(
        couple.id,
        suggestion_type="goals",
        db=db,
    )
    
    return _build_goal_response(goal=goal, current_user=current_user, couple=couple)


@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    status_filter: str = None,
    limit: int = 20,
    offset: int = 0,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all goals for the user's couple."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
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

    query = {
        "couple_id": couple_id_query(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    }
    if status_filter:
        query["status"] = status_filter
    
    # Get goals
    goals_docs = await (
        db.relationship_goals.find(query)
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    ).to_list(length=limit)
    responses: list[GoalResponse] = []
    for doc in goals_docs:
        try:
            goal = _parse_goal_doc(doc)
            responses.append(
                _build_goal_response(goal=goal, current_user=current_user, couple=couple)
            )
        except (ValidationError, ValueError, TypeError):
            continue

    return responses


@router.get("/{goal_id}", response_model=GoalResponse)
async def get_goal(
    goal_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific goal by ID."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Get goal
    goal_doc = await db.relationship_goals.find_one({
        "_id": ObjectId(goal_id),
        "couple_id": couple_id_query(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    try:
        goal = _parse_goal_doc(goal_doc)
    except (ValidationError, ValueError, TypeError) as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="This goal is stored in an invalid format. Please create a new one or contact support."
        ) from exc
    
    return _build_goal_response(goal=goal, current_user=current_user, couple=couple)


@router.post("/{goal_id}/progress")
async def update_goal_progress(
    goal_id: str,
    progress_data: GoalProgressUpdate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Update progress for a goal."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Get goal
    goal_doc = await db.relationship_goals.find_one({
        "_id": ObjectId(goal_id),
        "couple_id": couple_id_query(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = _parse_goal_doc(goal_doc)
    if _is_goal_archived_for_user(goal, current_user.id) or goal.status == GoalStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This goal is archived. Create a new shared goal if you want to restart it."
        )
    
    if goal.status != GoalStatus.ACTIVE.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Can only update progress for active goals"
        )
    
    if progress_data.notes is None and progress_data.progress_value is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Add a note or progress value so your update says something real"
        )

    notes = progress_data.notes.strip() if progress_data.notes else None
    if progress_data.notes is not None and not notes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Progress notes cannot be empty"
        )

    # Add progress entry
    import uuid
    new_progress = GoalProgress(
        id=str(uuid.uuid4()),
        user_id=current_user.id,
        date=date.today(),
        notes=notes,
        progress_value=progress_data.progress_value,
        reactions=[]
    )
    
    # Update goal
    goal.progress.append(new_progress)
    goal.progress_updates += 1
    goal.updated_at = datetime.utcnow()
    
    # Convert progress to MongoDB format
    progress_list = []
    for p in goal.progress:
        p_dict = p.model_dump() if hasattr(p, 'model_dump') else p
        if isinstance(p_dict.get('date'), date):
            p_dict['date'] = datetime.combine(p_dict['date'], datetime.min.time())
        progress_list.append(p_dict)
    
    await db.relationship_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {
            "$set": {
                "progress": progress_list,
                "progress_updates": goal.progress_updates,
                "updated_at": goal.updated_at
            }
        }
    )

    from app.services.ai_suggestion_cache import ai_suggestion_cache_service

    await ai_suggestion_cache_service.invalidate_cache(
        couple.id,
        suggestion_type="goals",
        db=db,
    )
    
    # Fetch updated goal
    updated_doc = await db.relationship_goals.find_one({"_id": ObjectId(goal_id)})
    updated_goal = _parse_goal_doc(updated_doc)
    
    return _build_goal_response(goal=updated_goal, current_user=current_user, couple=couple)


@router.post("/{goal_id}/complete")
async def complete_goal(
    goal_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Mark a goal as completed."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Get goal
    goal_doc = await db.relationship_goals.find_one({
        "_id": ObjectId(goal_id),
        "couple_id": couple_id_query(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = _parse_goal_doc(goal_doc)
    if _is_goal_archived_for_user(goal, current_user.id) or goal.status == GoalStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This goal is archived. Create a new shared goal if you want to restart it."
        )

    # Update goal
    await db.relationship_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {
            "$set": {
                "status": GoalStatus.COMPLETED.value,
                "completed_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
        }
    )

    from app.services.ai_suggestion_cache import ai_suggestion_cache_service

    await ai_suggestion_cache_service.invalidate_cache(
        couple.id,
        suggestion_type="goals",
        db=db,
    )
    
    # Fetch updated goal
    updated_doc = await db.relationship_goals.find_one({"_id": ObjectId(goal_id)})
    updated_goal = _parse_goal_doc(updated_doc)
    
    return _build_goal_response(goal=updated_goal, current_user=current_user, couple=couple)


@router.delete("/{goal_id}")
async def delete_goal(
    goal_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Remove a goal from the actor's space and archive it for the partner."""

    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })

    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )

    couple = CoupleInDB.from_mongo(couple_doc)

    goal_doc = await db.relationship_goals.find_one({
        "_id": ObjectId(goal_id),
        "couple_id": couple_id_query(couple.id)
    })

    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )

    goal = _parse_goal_doc(goal_doc)
    if _is_goal_hidden_for_user(goal, current_user.id):
        return {
            "message": "Goal already removed from your space.",
            "goal_id": goal_id,
            "status": goal.status.value,
        }

    partner_id = couple.user1_id if current_user.id == couple.user2_id else couple.user2_id
    hidden_for_user_ids = set(goal.hidden_for_user_ids or [])
    archived_for_user_ids = set(goal.archived_for_user_ids or [])
    hidden_for_user_ids.add(current_user.id)
    archived_for_user_ids.discard(current_user.id)
    if partner_id not in hidden_for_user_ids:
        archived_for_user_ids.add(partner_id)

    await db.relationship_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {
            "$set": {
                "status": GoalStatus.ARCHIVED.value,
                "hidden_for_user_ids": list(hidden_for_user_ids),
                "archived_for_user_ids": list(archived_for_user_ids),
                "updated_at": datetime.utcnow(),
            }
        }
    )

    from app.services.ai_suggestion_cache import ai_suggestion_cache_service

    await ai_suggestion_cache_service.invalidate_cache(
        couple.id,
        suggestion_type="goals",
        db=db,
    )

    if partner_id not in hidden_for_user_ids:
        await create_in_app_notification(
            db=db,
            recipient_user_id=partner_id,
            preference_key="goal_updates",
            category="partner_stepped_away",
            title="Your partner stepped away from a goal",
            body=f"{goal.title} is now archived in your space. New shared updates will no longer be sent to your partner.",
            resource_type="goal",
            resource_id=goal.id,
            action_path=f"/goals/{goal.id}",
            actor_user_id=current_user.id,
            metadata={"goal_title": goal.title},
        )

    return {
        "message": "Goal removed from your space and archived for your partner.",
        "goal_id": goal_id,
        "status": GoalStatus.ARCHIVED.value,
    }


@router.post("/{goal_id}/progress/{progress_id}/react")
async def react_to_goal_progress(
    goal_id: str,
    progress_id: str,
    reaction_data: GoalReactionCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Add or toggle a reaction on a progress update."""
    
    # Get user's couple
    couple_doc = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No active couple profile found"
        )
    
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Get goal
    goal_doc = await db.relationship_goals.find_one({
        "_id": ObjectId(goal_id),
        "couple_id": couple_id_query(couple.id),
        "hidden_for_user_ids": {"$ne": current_user.id},
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = _parse_goal_doc(goal_doc)
    if _is_goal_archived_for_user(goal, current_user.id) or goal.status == GoalStatus.ARCHIVED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="This goal is archived. Reactions are closed on archived goals."
        )
    
    # Find the specific progress entry
    target_progress = None
    for p in goal.progress:
        if hasattr(p, 'id') and p.id == progress_id:
            target_progress = p
            break
            
    if not target_progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Progress update not found"
        )
        
    # Check if user already reacted with this emoji
    if not hasattr(target_progress, 'reactions'):
        target_progress.reactions = []
        
    existing_reaction = next((r for r in target_progress.reactions if r.get('user_id') == current_user.id and r.get('emoji') == reaction_data.emoji), None)
    
    if existing_reaction:
        # Toggle off (remove)
        target_progress.reactions = [r for r in target_progress.reactions if not (r.get('user_id') == current_user.id and r.get('emoji') == reaction_data.emoji)]
    else:
        # Add reaction
        target_progress.reactions.append({
            "user_id": current_user.id,
            "emoji": reaction_data.emoji
        })
        
    # Convert progress list to dicts for mongo update
    progress_list = []
    for p in goal.progress:
        p_dict = p.model_dump() if hasattr(p, 'model_dump') else p
        if isinstance(p_dict.get('date'), date):
            p_dict['date'] = datetime.combine(p_dict['date'], datetime.min.time())
        progress_list.append(p_dict)
        
    # Update goal
    await db.relationship_goals.update_one(
        {"_id": ObjectId(goal_id)},
        {
            "$set": {
                "progress": progress_list,
                "updated_at": datetime.utcnow()
            }
        }
    )
    
    # Fetch updated goal
    updated_doc = await db.relationship_goals.find_one({"_id": ObjectId(goal_id)})
    updated_goal = _parse_goal_doc(updated_doc)
    
    return _build_goal_response(goal=updated_goal, current_user=current_user, couple=couple)
