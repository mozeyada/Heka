"""AI Mediation endpoints."""

import logging
import re
from datetime import datetime

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Request, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.api.schemas import (
    AICheckInsResponse,
    AIGoalsResponse,
)
from app.core.limiter import limiter
from app.core.sanitization import validate_object_id
from app.db.database import get_database
from app.models.argument import ArgumentInDB, ArgumentPriority, ArgumentStatus
from app.models.couple import CoupleInDB
from app.models.perspective import PerspectiveInDB
from app.models.relationship_goal import GoalStatus
from app.models.user import UserInDB
from app.services.ai_service import ai_service
from app.services.ai_suggestion_cache import ai_suggestion_cache_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/ai", tags=["AI Mediation"])


def _normalize_goal_title(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", " ", value.lower()).strip()


async def _curate_goal_suggestions(
    *,
    suggestions: list[dict],
    couple_id: str,
    arguments: list[dict],
    db: AsyncIOMotorDatabase,
) -> list[dict]:
    existing_goals = await db.relationship_goals.find(
        {
            "couple_id": ObjectId(couple_id),
            "status": {"$in": [GoalStatus.ACTIVE.value, GoalStatus.PAUSED.value]},
        },
        {"title": 1},
    ).to_list(length=20)

    existing_titles = {
        _normalize_goal_title(str(doc.get("title", "")))
        for doc in existing_goals
        if doc.get("title")
    }
    active_goal_count = len(existing_titles)

    conflict_needs_extended_support = any(
        (
            (arg.get("updated_at") or arg.get("created_at"))
            and (datetime.utcnow() - (arg.get("updated_at") or arg.get("created_at"))).days >= 14
        )
        for arg in arguments
    )
    max_active_goal_tracks = 4 if conflict_needs_extended_support else 2
    remaining_slots = max(0, max_active_goal_tracks - active_goal_count)
    if remaining_slots == 0:
        return []

    curated: list[dict] = []
    seen_titles = set(existing_titles)
    for suggestion in suggestions:
        title = str(suggestion.get("title", "")).strip()
        if not title:
            continue
        normalized_title = _normalize_goal_title(title)
        if not normalized_title or normalized_title in seen_titles:
            continue
        seen_titles.add(normalized_title)
        curated.append(suggestion)
        if len(curated) >= remaining_slots:
            break

    return curated


def _serialize_insight(insight_doc: dict) -> dict:
    """Serialize an AI insight Mongo document for API responses."""

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
        "model_used": insight.ai_model,
    }


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
    
    latest_context_at = argument.latest_context_at or argument.updated_at
    for persp in perspectives_list:
        if persp.updated_at and (latest_context_at is None or persp.updated_at > latest_context_at):
            latest_context_at = persp.updated_at

    # Check if analysis already exists
    existing_insight = await db.ai_insights.find_one({
        "argument_id": argument_oid
    })
    
    if existing_insight:
        generated_at = existing_insight.get("generated_at")
        if generated_at and latest_context_at and generated_at >= latest_context_at:
            logger.info(
                "Returning current AI insight for argument %s without regenerating",
                validated_argument_id,
            )
            return _serialize_insight(existing_insight)
        await db.ai_insights.delete_one({"_id": existing_insight["_id"]})
    
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
            {
                "$set": {
                    "status": ArgumentStatus.ANALYZED.value,
                    "updated_at": datetime.utcnow(),
                }
            }
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
    
    return _serialize_insight(insight_doc)


@router.get("/goals/suggestions", response_model=AIGoalsResponse)
@limiter.limit("10/hour")  # Rate limit to prevent abuse
async def get_goal_suggestions(
    request: Request,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Get AI-generated goal suggestions for the user's couple.
    Returns cached suggestions if available, otherwise generates new ones synchronously.
    """
    couple = await get_user_couple(current_user, db)
    suggestion_type = "goals"

    # 1. Check cache first
    cached = await ai_suggestion_cache_service.get_cached_suggestions(
        couple.id, suggestion_type, db
    )
    
    if cached:
        current_args = await db.arguments.find({
            "couple_id": ObjectId(couple.id),
            "priority": {"$in": [ArgumentPriority.HIGH.value, ArgumentPriority.URGENT.value]},
            "status": {"$in": [ArgumentStatus.ACTIVE.value, ArgumentStatus.ANALYZED.value]}
        }).sort("priority", -1).sort("created_at", -1).limit(2).to_list(length=2)
        curated_cached = await _curate_goal_suggestions(
            suggestions=cached.suggestions,
            couple_id=couple.id,
            arguments=current_args,
            db=db,
        )
        return AIGoalsResponse(suggestions=curated_cached)

    # 2. Cache miss - generate synchronously
    try:
        # Get top 1-2 high-priority arguments
        args_cursor = db.arguments.find({
            "couple_id": ObjectId(couple.id),
            "priority": {"$in": [ArgumentPriority.HIGH.value, ArgumentPriority.URGENT.value]},
            "status": {"$in": [ArgumentStatus.ACTIVE.value, ArgumentStatus.ANALYZED.value]}
        }).sort("priority", -1).sort("created_at", -1).limit(2)
        
        arguments = await args_cursor.to_list(length=2)
        
        if not arguments:
            # No high-priority arguments - return empty suggestions
            return AIGoalsResponse(suggestions=[])
        
        # Convert to dict format for AI service
        args_list = []
        linked_ids = []
        for arg_doc in arguments:
            args_list.append(arg_doc)
            linked_ids.append(str(arg_doc["_id"]))
        
        # Generate suggestions using AI service
        suggestions, linked_argument_ids = await ai_service.generate_goal_suggestions(
            args_list, db
        )
        curated_suggestions = await _curate_goal_suggestions(
            suggestions=suggestions,
            couple_id=couple.id,
            arguments=args_list,
            db=db,
        )
        
        # Save to cache
        await ai_suggestion_cache_service.save_suggestions(
            couple.id,
            suggestion_type,
            curated_suggestions,
            linked_argument_ids,
            db,
            ai_model=ai_service.model
        )
        
        return AIGoalsResponse(suggestions=curated_suggestions)
        
    except Exception as e:
        logger.error(f"Error generating goal suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate goal suggestions"
        )


@router.get("/checkins/suggestions", response_model=AICheckInsResponse)
@limiter.limit("10/hour")  # Rate limit to prevent abuse
async def get_checkin_suggestions(
    request: Request,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Get AI-generated check-in questions for the user's couple.
    Returns cached questions if available, otherwise generates new ones synchronously.
    """
    couple = await get_user_couple(current_user, db)
    suggestion_type = "checkins"

    # 1. Check cache first
    cached = await ai_suggestion_cache_service.get_cached_suggestions(
        couple.id, suggestion_type, db
    )
    
    if cached:
        return AICheckInsResponse(suggestions=cached.suggestions)

    # 2. Cache miss - generate synchronously
    try:
        # Get recent arguments from last 2-4 weeks
        from datetime import datetime, timedelta
        weeks_ago = datetime.utcnow() - timedelta(weeks=4)
        
        args_cursor = db.arguments.find({
            "couple_id": ObjectId(couple.id),
            "created_at": {"$gte": weeks_ago},
            "status": {"$in": [ArgumentStatus.ACTIVE.value, ArgumentStatus.ANALYZED.value]}
        }).sort("created_at", -1).limit(5)
        
        arguments = await args_cursor.to_list(length=5)
        
        if not arguments:
            # No recent arguments - return empty suggestions
            return AICheckInsResponse(suggestions=[])
        
        # Convert to dict format for AI service
        args_list = []
        linked_ids = []
        for arg_doc in arguments:
            args_list.append(arg_doc)
            linked_ids.append(str(arg_doc["_id"]))
        
        # Generate questions using AI service
        suggestions, linked_argument_ids = await ai_service.generate_checkin_questions(
            args_list, db
        )
        
        # Save to cache
        await ai_suggestion_cache_service.save_suggestions(
            couple.id,
            suggestion_type,
            suggestions,
            linked_argument_ids,
            db,
            ai_model=ai_service.model
        )
        
        return AICheckInsResponse(suggestions=suggestions)
        
    except Exception as e:
        logger.error(f"Error generating check-in suggestions: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate check-in suggestions"
        )



@router.post("/arguments/{argument_id}/generate-goals", response_model=AIGoalsResponse)
@limiter.limit("60/hour")
async def generate_argument_goals(
    request: Request,
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Generate goal suggestions based on a specific argument.
    """
    # Validate and fetch argument
    try:
        validated_id = validate_object_id(argument_id)
        arg_oid = ObjectId(validated_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    arg_doc = await db.arguments.find_one({"_id": arg_oid})
    if not arg_doc:
        raise HTTPException(status_code=404, detail="Argument not found")
        
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify access
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [{"user1_id": ObjectId(current_user.id)}, {"user2_id": ObjectId(current_user.id)}]
    })
    if not couple_doc:
        raise HTTPException(status_code=403, detail="Access denied")
        
    # Reuse existing AI service logic with single argument
    suggestions, _ = await ai_service.generate_goal_suggestions([arg_doc], db)
    return AIGoalsResponse(suggestions=suggestions)


@router.post("/arguments/{argument_id}/generate-checkins", response_model=AICheckInsResponse)
@limiter.limit("60/hour")
async def generate_argument_checkins(
    request: Request,
    argument_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """
    Generate check-in questions based on a specific argument.
    """
    # Validate and fetch argument
    try:
        validated_id = validate_object_id(argument_id)
        arg_oid = ObjectId(validated_id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    
    arg_doc = await db.arguments.find_one({"_id": arg_oid})
    if not arg_doc:
        raise HTTPException(status_code=404, detail="Argument not found")
        
    argument = ArgumentInDB.from_mongo(arg_doc)
    
    # Verify access
    couple_doc = await db.couples.find_one({
        "_id": ObjectId(argument.couple_id),
        "$or": [{"user1_id": ObjectId(current_user.id)}, {"user2_id": ObjectId(current_user.id)}]
    })
    if not couple_doc:
        raise HTTPException(status_code=403, detail="Access denied")
        
    # Reuse existing AI service logic with single argument
    suggestions, _ = await ai_service.generate_checkin_questions([arg_doc], db)
    return AICheckInsResponse(suggestions=suggestions)


async def get_user_couple(user: UserInDB, db: AsyncIOMotorDatabase) -> CoupleInDB:
    """Helper to get the couple associated with the current user."""
    couple_doc = await db.couples.find_one({
        "$or": [{"user1_id": ObjectId(user.id)}, {"user2_id": ObjectId(user.id)}],
        "status": "active"
    })
    if not couple_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Active couple not found for this user."
        )
    return CoupleInDB.from_mongo(couple_doc)
