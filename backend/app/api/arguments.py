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

router = APIRouter(prefix="/api/arguments", tags=["Arguments"])


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
        if subscription.status.value == "trial":
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Trial limit reached. You've used {current_count}/{limit} argument resolutions. Please upgrade to continue."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Usage limit reached. Please upgrade your subscription."
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
    argument = ArgumentInDB(
        couple_id=couple.id,
        title=sanitized_title,
        category=category,
        priority=priority,
        status=ArgumentStatus.DRAFT
    )
    
    result = await db.arguments.insert_one(argument.to_mongo())
    argument.id = str(result.inserted_id)
    
    # Invalidate suggestion cache if high-priority argument is created
    if priority in [ArgumentPriority.HIGH, ArgumentPriority.URGENT]:
        from app.services.ai_suggestion_cache import ai_suggestion_cache_service
        # Invalidate both types of suggestions
        await ai_suggestion_cache_service.invalidate_cache(couple.id)

    # Track usage
    await usage_service.track_usage(
        couple.id,
        UsageType.ARGUMENT_RESOLUTION,
        argument.id,
        subscription,
        db
    )
    
    return ArgumentResponse(
        id=argument.id,
        couple_id=argument.couple_id,
        title=argument.title,
        category=argument.category.value,
        priority=argument.priority.value,
        status=argument.status.value,
        created_at=argument.created_at,
        updated_at=argument.updated_at
    )


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

    query: Dict[str, Any] = {"couple_id": ObjectId(couple.id)}
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
        arguments.append(ArgumentResponse(
            id=arg.id,
            couple_id=arg.couple_id,
            title=arg.title,
            category=arg.category.value,
            priority=arg.priority.value,
            status=arg.status.value,
            created_at=arg.created_at,
            updated_at=arg.updated_at
        ))
    
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
    
    return ArgumentResponse(
        id=argument.id,
        couple_id=argument.couple_id,
        title=argument.title,
        category=argument.category.value,
        priority=argument.priority.value,
        status=argument.status.value,
        created_at=argument.created_at,
        updated_at=argument.updated_at
    )


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

    # Validate status enum
    try:
        new_status = ArgumentStatus(status_update.status)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status. Must be one of: {[s.value for s in ArgumentStatus]}"
        )

    # Update timestamp
    updated_at = datetime.utcnow()
    
    await db.arguments.update_one(
        {"_id": argument_oid},
        {"$set": {
            "status": new_status.value,
            "updated_at": updated_at
        }}
    )
    
    # Return updated argument
    argument.status = new_status
    argument.updated_at = updated_at
    
    return ArgumentResponse(
        id=argument.id,
        couple_id=argument.couple_id,
        title=argument.title,
        category=argument.category.value,
        priority=argument.priority.value,
        status=argument.status.value,
        created_at=argument.created_at,
        updated_at=argument.updated_at
    )


@router.delete("/{argument_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_argument(
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Delete an argument and all associated data."""
    
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
    
    # Delete associated data: perspectives
    await db.perspectives.delete_many({"argument_id": argument_oid})
    
    # Delete the argument itself
    await db.arguments.delete_one({"_id": argument_oid})
    
    return None

