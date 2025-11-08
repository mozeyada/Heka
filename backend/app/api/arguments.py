"""Arguments endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.api.schemas import ArgumentCreate, ArgumentResponse
from app.api.dependencies import get_current_user
from app.core.sanitization import sanitize_text, validate_object_id
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.argument import ArgumentInDB, ArgumentCategory, ArgumentPriority, ArgumentStatus
from app.models.couple import CoupleStatus
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List

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
    from app.services.subscription_service import subscription_service
    from app.services.usage_service import usage_service
    from app.models.usage import UsageType
    
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
    
    # Get arguments for couple
    cursor = db.arguments.find({"couple_id": ObjectId(couple.id)}).sort("created_at", -1)
    arguments = []
    
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

