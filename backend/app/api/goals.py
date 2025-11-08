"""Relationship Goals API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.relationship_goal import RelationshipGoalInDB, GoalStatus, GoalProgress
from app.api.schemas import GoalCreate, GoalResponse, GoalProgressUpdate
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, date
from typing import List
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/goals", tags=["Relationship Goals"])


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
    
    # Check goal limit (max 3 active goals per couple)
    active_goals_count = await db.relationship_goals.count_documents({
        "couple_id": ObjectId(couple.id),
        "status": GoalStatus.ACTIVE.value
    })
    
    if active_goals_count >= 3:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Maximum of 3 active goals allowed per couple"
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
    
    # Create goal
    goal = RelationshipGoalInDB(
        couple_id=couple.id,
        title=goal_data.title,
        description=goal_data.description,
        status=GoalStatus.ACTIVE,
        target_date=target_date_obj,
        created_by_user_id=current_user.id,
        progress=[]
    )
    
    result = await db.relationship_goals.insert_one(goal.to_mongo())
    goal.id = str(result.inserted_id)
    
    return GoalResponse(
        id=goal.id,
        couple_id=goal.couple_id,
        title=goal.title,
        description=goal.description,
        status=goal.status.value,
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        progress=[{"date": p.date.isoformat(), "notes": p.notes, "progress_value": p.progress_value} for p in goal.progress],
        created_by_user_id=goal.created_by_user_id,
        progress_updates=goal.progress_updates,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        completed_at=goal.completed_at
    )


@router.get("/", response_model=List[GoalResponse])
async def get_goals(
    status_filter: str = None,
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
    
    # Build query
    query = {"couple_id": ObjectId(couple.id)}
    if status_filter:
        query["status"] = status_filter
    
    # Get goals
    goals_docs = await db.relationship_goals.find(query).sort("created_at", -1).to_list(length=100)
    goals = [RelationshipGoalInDB.from_mongo(doc) for doc in goals_docs]
    
    return [
        GoalResponse(
            id=goal.id,
            couple_id=goal.couple_id,
            title=goal.title,
            description=goal.description,
            status=goal.status.value,
            target_date=goal.target_date.isoformat() if goal.target_date else None,
            progress=[{"date": p.date.isoformat(), "notes": p.notes, "progress_value": p.progress_value} for p in goal.progress],
            created_by_user_id=goal.created_by_user_id,
            progress_updates=goal.progress_updates,
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            completed_at=goal.completed_at
        )
        for goal in goals
    ]


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
    
    return GoalResponse(
        id=goal.id,
        couple_id=goal.couple_id,
        title=goal.title,
        description=goal.description,
        status=goal.status.value,
        target_date=goal.target_date.isoformat() if goal.target_date else None,
        progress=[{"date": p.date.isoformat(), "notes": p.notes, "progress_value": p.progress_value} for p in goal.progress],
        created_by_user_id=goal.created_by_user_id,
        progress_updates=goal.progress_updates,
        created_at=goal.created_at,
        updated_at=goal.updated_at,
        completed_at=goal.completed_at
    )


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
    
    # Add progress entry
    new_progress = GoalProgress(
        date=date.today(),
        notes=progress_data.notes,
        progress_value=progress_data.progress_value
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
    
    return GoalResponse(
        id=updated_goal.id,
        couple_id=updated_goal.couple_id,
        title=updated_goal.title,
        description=updated_goal.description,
        status=updated_goal.status.value,
        target_date=updated_goal.target_date.isoformat() if updated_goal.target_date else None,
        progress=[{"date": p.date.isoformat(), "notes": p.notes, "progress_value": p.progress_value} for p in updated_goal.progress],
        created_by_user_id=updated_goal.created_by_user_id,
        progress_updates=updated_goal.progress_updates,
        created_at=updated_goal.created_at,
        updated_at=updated_goal.updated_at,
        completed_at=updated_goal.completed_at
    )


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
    
    return GoalResponse(
        id=updated_goal.id,
        couple_id=updated_goal.couple_id,
        title=updated_goal.title,
        description=updated_goal.description,
        status=updated_goal.status.value,
        target_date=updated_goal.target_date.isoformat() if updated_goal.target_date else None,
        progress=[{"date": p.date.isoformat(), "notes": p.notes, "progress_value": p.progress_value} for p in updated_goal.progress],
        created_by_user_id=updated_goal.created_by_user_id,
        progress_updates=updated_goal.progress_updates,
        created_at=updated_goal.created_at,
        updated_at=updated_goal.updated_at,
        completed_at=updated_goal.completed_at
    )

