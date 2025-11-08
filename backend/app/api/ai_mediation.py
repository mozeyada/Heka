"""AI Mediation endpoints."""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from slowapi import Limiter
from app.api.dependencies import get_current_user
from app.core.sanitization import validate_object_id
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.argument import ArgumentInDB, ArgumentStatus
from app.models.perspective import PerspectiveInDB
from app.models.couple import CoupleInDB
from app.services.ai_service import ai_service
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from typing import List
import logging
from app.main import app

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Mediation"])
limiter = app.state.limiter


@router.post("/arguments/{argument_id}/analyze")
@limiter.limit("10/hour")  # Prevent API cost abuse - 10 analyses per hour per IP
async def analyze_argument(
    request: Request,
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Trigger AI mediation analysis for an argument."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Get argument
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify user has access
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
            detail="Access denied"
        )
    
    # Check if both perspectives exist
    perspectives_cursor = db.perspectives.find({"argument_id": argument_oid})
    perspectives_list = []
    async for persp_doc in perspectives_cursor:
        perspectives_list.append(PerspectiveInDB.from_mongo(persp_doc))
    
    if len(perspectives_list) < 2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both perspectives must be submitted before AI analysis"
        )
    
    # Check if analysis already exists
    existing_insight = await db.ai_insights.find_one({
        "argument_id": argument_oid
    })
    
    if existing_insight:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="AI analysis already exists for this argument"
        )
    
    # Get couple to identify which perspective belongs to which user
    couple = CoupleInDB.from_mongo(couple_doc)
    
    # Identify perspectives
    perspective_1 = None
    perspective_2 = None
    
    for persp in perspectives_list:
        if persp.user_id == couple.user1_id:
            perspective_1 = persp.content
        elif persp.user_id == couple.user2_id:
            perspective_2 = persp.content
    
    if not perspective_1 or not perspective_2:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Both partners must submit perspectives"
        )
    
    # Generate AI insights
    try:
        insights = await ai_service.mediate_argument(
            argument_id=validated_argument_id,
            perspective_1=perspective_1,
            perspective_2=perspective_2,
            category=argument.category.value,
            db=db
        )
        
        # Update argument status to analyzed
        await db.arguments.update_one(
            {"_id": argument_oid},
            {"$set": {"status": ArgumentStatus.ANALYZED.value}}
        )
        
        return insights
        
    except ValueError as e:
        error_msg = str(e)
        # Check if this is a safety block
        if "SAFETY_BLOCK" in error_msg:
            logger.warning(f"Safety block triggered for argument {validated_argument_id}: {error_msg}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": "safety_concern",
                    "message": error_msg.replace("SAFETY_BLOCK: ", ""),
                    "action": "show_crisis_resources"
                }
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=error_msg
        )
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"AI analysis failed: {str(e)}"
        )


@router.get("/arguments/{argument_id}/insights")
async def get_ai_insights(
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get AI insights for an argument."""
    
    # Validate ObjectId
    try:
        validated_argument_id = validate_object_id(argument_id)
        argument_oid = ObjectId(validated_argument_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    # Verify access
    arg_doc = await db.arguments.find_one({"_id": argument_oid})
    
    if not arg_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Argument not found"
        )
    
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify user has access
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
            detail="Access denied"
        )
    
    # Get AI insights
    insight_doc = await db.ai_insights.find_one({
        "argument_id": argument_oid
    })
    
    if not insight_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="AI insights not found. Run analysis first."
        )
    
    from app.models.ai_insight import AIInsightInDB
    insight = AIInsightInDB.from_mongo(insight_doc)
    
    return {
        "id": insight.id,
        "summary": insight.summary,
        "common_ground": insight.common_ground,
        "disagreements": insight.disagreements,
        "root_causes": insight.root_causes,
        "suggestions": insight.suggestions,
        "communication_tips": insight.communication_tips,
        "generated_at": insight.generated_at,
        "model_used": insight.ai_model
    }

