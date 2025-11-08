"""User data export and deletion endpoints for Australian Privacy Act compliance."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.models.user import UserInDB
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime
from typing import Dict, Any
import json

router = APIRouter(prefix="/api/users", tags=["Users"])


@router.get("/me/export")
async def export_user_data(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Export all user data in JSON format.
    Required by Australian Privacy Act 1988.
    """
    try:
        # Collect all user data
        export_data: Dict[str, Any] = {
            "export_date": datetime.utcnow().isoformat(),
            "user_profile": {
                "id": current_user.id,
                "email": current_user.email,
                "name": current_user.name,
                "age": current_user.age,
                "created_at": current_user.created_at.isoformat() if current_user.created_at else None,
                "terms_accepted_at": current_user.terms_accepted_at.isoformat() if current_user.terms_accepted_at else None,
                "privacy_accepted_at": current_user.privacy_accepted_at.isoformat() if current_user.privacy_accepted_at else None,
            },
            "couples": [],
            "arguments": [],
            "perspectives": [],
            "checkins": [],
            "goals": [],
            "subscriptions": [],
            "usage": []
        }
        
        # Find couple profile
        couple_doc = await db.couples.find_one({
            "$or": [
                {"user1_id": ObjectId(current_user.id)},
                {"user2_id": ObjectId(current_user.id)}
            ]
        })
        
        if couple_doc:
            couple_id = str(couple_doc["_id"])
            export_data["couples"].append({
                "id": couple_id,
                "user1_id": str(couple_doc.get("user1_id", "")),
                "user2_id": str(couple_doc.get("user2_id", "")),
                "status": couple_doc.get("status", ""),
                "created_at": couple_doc.get("created_at").isoformat() if couple_doc.get("created_at") else None,
            })
            
            # Get arguments for this couple
            arguments_cursor = db.arguments.find({"couple_id": couple_id})
            async for arg in arguments_cursor:
                export_data["arguments"].append({
                    "id": str(arg["_id"]),
                    "title": arg.get("title", ""),
                    "category": arg.get("category", ""),
                    "priority": arg.get("priority", ""),
                    "status": arg.get("status", ""),
                    "created_at": arg.get("created_at").isoformat() if arg.get("created_at") else None,
                })
            
            # Get perspectives for this user's arguments
            perspectives_cursor = db.perspectives.find({"user_id": current_user.id})
            async for persp in perspectives_cursor:
                export_data["perspectives"].append({
                    "id": str(persp["_id"]),
                    "argument_id": str(persp.get("argument_id", "")),
                    "content": persp.get("content", ""),
                    "created_at": persp.get("created_at").isoformat() if persp.get("created_at") else None,
                })
            
            # Get check-ins
            checkins_cursor = db.relationship_checkins.find({"couple_id": couple_id})
            async for checkin in checkins_cursor:
                export_data["checkins"].append({
                    "id": str(checkin["_id"]),
                    "week_start_date": checkin.get("week_start_date").isoformat() if checkin.get("week_start_date") else None,
                    "status": checkin.get("status", ""),
                    "responses": checkin.get("responses", {}),
                    "completed_at": checkin.get("completed_at").isoformat() if checkin.get("completed_at") else None,
                })
            
            # Get goals
            goals_cursor = db.relationship_goals.find({"couple_id": couple_id})
            async for goal in goals_cursor:
                export_data["goals"].append({
                    "id": str(goal["_id"]),
                    "title": goal.get("title", ""),
                    "description": goal.get("description", ""),
                    "status": goal.get("status", ""),
                    "target_date": goal.get("target_date").isoformat() if goal.get("target_date") else None,
                    "progress": goal.get("progress", []),
                    "created_at": goal.get("created_at").isoformat() if goal.get("created_at") else None,
                })
            
            # Get subscriptions
            subscription_doc = await db.subscriptions.find_one({"couple_id": couple_id})
            if subscription_doc:
                export_data["subscriptions"].append({
                    "id": str(subscription_doc["_id"]),
                    "tier": subscription_doc.get("tier", ""),
                    "status": subscription_doc.get("status", ""),
                    "trial_start": subscription_doc.get("trial_start").isoformat() if subscription_doc.get("trial_start") else None,
                    "trial_end": subscription_doc.get("trial_end").isoformat() if subscription_doc.get("trial_end") else None,
                })
            
            # Get usage records
            usage_cursor = db.usages.find({"couple_id": couple_id})
            async for usage in usage_cursor:
                export_data["usage"].append({
                    "id": str(usage["_id"]),
                    "usage_type": usage.get("usage_type", ""),
                    "count": usage.get("count", 0),
                    "limit": usage.get("limit", 0),
                    "period_start": usage.get("period_start").isoformat() if usage.get("period_start") else None,
                    "period_end": usage.get("period_end").isoformat() if usage.get("period_end") else None,
                })
        
        # Return JSON response
        return {
            "success": True,
            "data": export_data,
            "format": "json",
            "downloadable": True
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Data export error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to export data: {str(e)}"
        )


@router.delete("/me/account")
async def delete_account(
    confirmation: str = Query(..., description="Must be 'DELETE' to confirm"),
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Delete user account and all personal data.
    Required by Australian Privacy Act 1988.
    
    Note: Financial records may be retained for 7 years for legal compliance.
    """
    # Require explicit confirmation
    if confirmation != "DELETE":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Must provide confirmation='DELETE' to delete account"
        )
    
    try:
        # Find couple profile
        couple_doc = await db.couples.find_one({
            "$or": [
                {"user1_id": ObjectId(current_user.id)},
                {"user2_id": ObjectId(current_user.id)}
            ]
        })
        
        if couple_doc:
            couple_id = str(couple_doc["_id"])
            
            # Delete user's perspectives
            await db.perspectives.delete_many({"user_id": current_user.id})
            
            # Delete arguments created by this user (if any)
            # Note: We might want to keep arguments if couple wants to keep them
            # For now, anonymize rather than delete
            await db.arguments.update_many(
                {"couple_id": couple_id},
                {"$set": {"created_by_user_id": None}}  # Anonymize instead of delete
            )
            
            # Delete check-ins completed by this user
            await db.relationship_checkins.update_many(
                {"couple_id": couple_id, "completed_by_user_id": current_user.id},
                {"$set": {"completed_by_user_id": None}}  # Anonymize
            )
            
            # Delete goals created by this user
            await db.relationship_goals.delete_many({
                "couple_id": couple_id,
                "created_by_user_id": current_user.id
            })
        
        # Anonymize user account (don't fully delete for audit trail)
        # Keep for 7 years for financial/legal compliance
        await db.users.update_one(
            {"_id": ObjectId(current_user.id)},
            {
                "$set": {
                    "email": f"deleted_{current_user.id}@deleted.heka.app",
                    "name": "Deleted User",
                    "password_hash": "",  # Invalidate password
                    "is_active": False,
                    "deleted_at": datetime.utcnow(),
                    "deletion_reason": "User requested deletion"
                }
            }
        )
        
        return {
            "success": True,
            "message": "Account deleted successfully. Your data has been removed or anonymized.",
            "note": "Financial records may be retained for 7 years for legal compliance."
        }
        
    except Exception as e:
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Account deletion error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete account: {str(e)}"
        )

