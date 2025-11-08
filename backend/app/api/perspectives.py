"""Perspectives endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status
from app.api.schemas import PerspectiveCreate, PerspectiveResponse
from app.api.dependencies import get_current_user
from app.core.sanitization import sanitize_text, validate_object_id
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.perspective import PerspectiveInDB
from app.models.argument import ArgumentInDB, ArgumentStatus
from app.models.couple import CoupleStatus
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List

router = APIRouter(prefix="/api/perspectives", tags=["Perspectives"])


@router.post("/create", response_model=PerspectiveResponse, status_code=status.HTTP_201_CREATED)
async def create_perspective(
    perspective_data: PerspectiveCreate,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Create a perspective for an argument."""
    
    # Validate and sanitize inputs
    try:
        validated_argument_id = validate_object_id(perspective_data.argument_id)
        argument_oid = ObjectId(validated_argument_id)
        sanitized_content = sanitize_text(perspective_data.content, max_length=5000)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Verify argument exists and user has access
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify user is in the couple that owns this argument
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied to this argument"
        )
    
    # Check if user already submitted a perspective for this argument
    existing_perspective = await db.perspectives.find_one({
        "argument_id": argument_oid,
        "user_id": ObjectId(current_user.id)
    })
    
    if existing_perspective:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already submitted a perspective for this argument"
        )
    
    # Create perspective
    perspective = PerspectiveInDB(
        argument_id=validated_argument_id,
        user_id=current_user.id,
        content=sanitized_content
    )
    
    result = await db.perspectives.insert_one(perspective.to_mongo())
    perspective.id = str(result.inserted_id)
    
    # Update argument status if both perspectives are now submitted
    perspectives_count = await db.perspectives.count_documents({
        "argument_id": argument_oid
    })
    
    if perspectives_count >= 2:
        # Both perspectives submitted, ready for AI analysis
        await db.arguments.update_one(
            {"_id": argument_oid},
            {"$set": {"status": ArgumentStatus.ACTIVE.value}}
        )
    
    return PerspectiveResponse(
        id=perspective.id,
        argument_id=perspective.argument_id,
        user_id=perspective.user_id,
        content=perspective.content,
        created_at=perspective.created_at
    )


@router.get("/argument/{argument_id}", response_model=List[PerspectiveResponse])
async def get_perspectives_for_argument(
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all perspectives for an argument."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Verify argument exists and user has access
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify user is in the couple
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
    
    # Get perspectives
    cursor = db.perspectives.find({"argument_id": argument_oid})
    perspectives = []
    
    async for persp_doc in cursor:
        persp = PerspectiveInDB.from_mongo(persp_doc)
        perspectives.append(PerspectiveResponse(
            id=persp.id,
            argument_id=persp.argument_id,
            user_id=persp.user_id,
            content=persp.content,
            created_at=persp.created_at
        ))
    
    return perspectives

