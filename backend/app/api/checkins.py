"""Relationship Check-ins API endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.relationship_checkin import RelationshipCheckInInDB, CheckInStatus
from app.api.dashboard import get_dashboard_overview
from app.api.schemas import CheckInCreate, CheckInResponse
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, date, timedelta
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/checkins", tags=["Relationship Check-ins"])


def get_monday_of_week(target_date: date = None) -> date:
    """Get Monday of the week for a given date (or current week)."""
    if target_date is None:
        target_date = date.today()
    # Monday is 0, so subtract days to get to Monday
    days_since_monday = target_date.weekday()
    return target_date - timedelta(days=days_since_monday)


@router.get("/current")
async def get_current_checkin(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current week's check-in for the user's couple."""
    
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
    
    # Get Monday of current week
    week_start = get_monday_of_week()
    
    # Find or create check-in for this week
    checkin_doc = await db.relationship_checkins.find_one({
        "couple_id": ObjectId(couple.id),
        "week_start_date": datetime.combine(week_start, datetime.min.time())
    })
    
    if checkin_doc:
        checkin = RelationshipCheckInInDB.from_mongo(checkin_doc)
    else:
        # Create new check-in for this week
        checkin = RelationshipCheckInInDB(
            couple_id=couple.id,
            week_start_date=week_start,
            status=CheckInStatus.PENDING
        )
        result = await db.relationship_checkins.insert_one(checkin.to_mongo())
        checkin.id = str(result.inserted_id)
    
    return CheckInResponse(
        id=checkin.id,
        couple_id=checkin.couple_id,
        week_start_date=checkin.week_start_date.isoformat(),
        status=checkin.status.value,
        responses=checkin.responses,
        completed_by_user_id=checkin.completed_by_user_id,
        completed_at=checkin.completed_at,
        created_at=checkin.created_at
    )


@router.post("/current/complete")
async def complete_checkin(
    checkin_data: CheckInCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Complete the current week's check-in."""
    
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
    
    # Get Monday of current week
    week_start = get_monday_of_week()
    
    # Find check-in for this week
    checkin_doc = await db.relationship_checkins.find_one({
        "couple_id": ObjectId(couple.id),
        "week_start_date": datetime.combine(week_start, datetime.min.time())
    })
    
    if not checkin_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Check-in not found for this week"
        )
    
    # Update check-in
    update_data = {
        "$set": {
            "status": CheckInStatus.COMPLETED.value,
            "responses": checkin_data.responses,
            "completed_by_user_id": ObjectId(current_user.id),
            "completed_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    }
    
    await db.relationship_checkins.update_one(
        {"_id": ObjectId(checkin_doc["_id"])},
        update_data
    )
    
    # Fetch updated check-in
    updated_doc = await db.relationship_checkins.find_one({
        "_id": ObjectId(checkin_doc["_id"])
    })
    checkin = RelationshipCheckInInDB.from_mongo(updated_doc)
    
    return CheckInResponse(
        id=checkin.id,
        couple_id=checkin.couple_id,
        week_start_date=checkin.week_start_date.isoformat(),
        status=checkin.status.value,
        responses=checkin.responses,
        completed_by_user_id=checkin.completed_by_user_id,
        completed_at=checkin.completed_at,
        created_at=checkin.created_at
    )


@router.get("/history")
async def get_checkin_history(
    limit: int = 10,
    offset: int = 0,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get check-in history for the user's couple."""
    
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
    
    if limit < 1 or limit > 50:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="limit must be between 1 and 50"
        )
    if offset < 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="offset must be >= 0"
        )

    cursor = (
        db.relationship_checkins.find({
            "couple_id": ObjectId(couple.id)
        })
        .sort("week_start_date", -1)
        .skip(offset)
        .limit(limit)
    )
    checkins_docs = await cursor.to_list(length=limit)
    
    checkins = [RelationshipCheckInInDB.from_mongo(doc) for doc in checkins_docs]
    
    next_offset = offset + len(checkins) if len(checkins) == limit else None

    return {
        "checkins": [
            {
                "id": checkin.id,
                "week_start_date": checkin.week_start_date.isoformat(),
                "status": checkin.status.value,
                "completed_at": checkin.completed_at.isoformat() if checkin.completed_at else None
            }
            for checkin in checkins
        ],
        "next_offset": next_offset
    }

