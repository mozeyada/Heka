"""Relationship Goals API endpoints."""

import logging
from datetime import date, datetime
from typing import List, Optional

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase

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

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals", tags=["Relationship Goals"])


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


def _build_goal_response(
    goal: RelationshipGoalInDB,
    current_user: UserInDB,
    couple: CoupleInDB,
) -> GoalResponse:
    partner_id = couple.user1_id if current_user.id == couple.user2_id else couple.user2_id
    current_user_has_progress = any(p.user_id == current_user.id for p in goal.progress)
    partner_has_progress = any(p.user_id == partner_id for p in goal.progress)
    latest_progress = goal.progress[-1] if goal.progress else None
    latest_progress_by_user_id = latest_progress.user_id if latest_progress else None
    latest_progress_at: Optional[datetime] = None
    latest_progress_acknowledged_by_current_user = True

    if latest_progress and latest_progress.date:
        latest_progress_at = datetime.combine(latest_progress.date, datetime.min.time())
        if latest_progress_by_user_id and latest_progress_by_user_id != current_user.id:
            latest_progress_acknowledged_by_current_user = any(
                reaction.get("user_id") == current_user.id
                for reaction in (latest_progress.reactions or [])
            )

    if goal.status == GoalStatus.COMPLETED:
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

    return GoalResponse(
        id=goal.id,
        couple_id=goal.couple_id,
        title=goal.title,
        description=goal.description,
        status=goal.status.value,
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        progress=_serialize_goal_progress(goal),
        created_by_user_id=goal.created_by_user_id,
        current_user_has_progress=current_user_has_progress,
        partner_has_progress=partner_has_progress,
        latest_progress_by_user_id=latest_progress_by_user_id,
        latest_progress_at=latest_progress_at,
        latest_progress_acknowledged_by_current_user=latest_progress_acknowledged_by_current_user,
        needs_user_progress=needs_user_progress,
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
        "couple_id": ObjectId(couple.id),
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

    query = {"couple_id": ObjectId(couple.id)}
    if status_filter:
        query["status"] = status_filter
    
    # Get goals
    goals_docs = await (
        db.relationship_goals.find(query)
        .sort("created_at", -1)
        .skip(offset)
        .limit(limit)
    ).to_list(length=limit)
    goals = [RelationshipGoalInDB.from_mongo(doc) for doc in goals_docs]
    
    return [_build_goal_response(goal=goal, current_user=current_user, couple=couple) for goal in goals]


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
        "couple_id": ObjectId(couple.id)
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = RelationshipGoalInDB.from_mongo(goal_doc)
    
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
        "couple_id": ObjectId(couple.id)
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = RelationshipGoalInDB.from_mongo(goal_doc)
    
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
    
    # Fetch updated goal
    updated_doc = await db.relationship_goals.find_one({"_id": ObjectId(goal_id)})
    updated_goal = RelationshipGoalInDB.from_mongo(updated_doc)
    
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
        "couple_id": ObjectId(couple.id)
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
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
    
    # Fetch updated goal
    updated_doc = await db.relationship_goals.find_one({"_id": ObjectId(goal_id)})
    updated_goal = RelationshipGoalInDB.from_mongo(updated_doc)
    
    return _build_goal_response(goal=updated_goal, current_user=current_user, couple=couple)


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
        "couple_id": ObjectId(couple.id)
    })
    
    if not goal_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Goal not found"
        )
    
    goal = RelationshipGoalInDB.from_mongo(goal_doc)
    
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
    updated_goal = RelationshipGoalInDB.from_mongo(updated_doc)
    
    return _build_goal_response(goal=updated_goal, current_user=current_user, couple=couple)
