"""User data export and deletion endpoints for Australian Privacy Act compliance."""

import logging
from datetime import datetime
from typing import Any, Dict

from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, Query, status
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.api.dependencies import get_current_user
from app.core.crypto import decrypt_text
from app.db.database import get_database
from app.models.relationship_checkin import RelationshipCheckInInDB
from app.models.user import UserInDB
from app.services.notification_preferences import normalize_notification_preferences

logger = logging.getLogger(__name__)
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
                "notification_preferences": normalize_notification_preferences(
                    current_user.notification_preferences
                ),
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
            couple_id_str = str(couple_doc["_id"])
            couple_id_obj = couple_doc["_id"]
            couple_query = {"$in": [couple_id_str, couple_id_obj]}
            export_data["couples"].append({
                "id": couple_id_str,
                "user1_id": str(couple_doc.get("user1_id", "")),
                "user2_id": str(couple_doc.get("user2_id", "")),
                "status": couple_doc.get("status", ""),
                "created_at": couple_doc.get("created_at").isoformat() if couple_doc.get("created_at") else None,
            })
            
            # Get arguments for this couple
            arguments_cursor = db.arguments.find({"couple_id": couple_query})
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
            user_query = {"$in": [current_user.id, ObjectId(current_user.id)]}
            perspectives_cursor = db.perspectives.find({"user_id": user_query})
            async for persp in perspectives_cursor:
                export_data["perspectives"].append({
                    "id": str(persp["_id"]),
                    "argument_id": str(persp.get("argument_id", "")),
                    "content": decrypt_text(persp.get("content", "")),
                    "created_at": persp.get("created_at").isoformat() if persp.get("created_at") else None,
                })
            
            # Get check-ins
            checkins_cursor = db.relationship_checkins.find({"couple_id": couple_query})
            async for checkin in checkins_cursor:
                parsed_checkin = RelationshipCheckInInDB.from_mongo(checkin)
                export_data["checkins"].append({
                    "id": parsed_checkin.id,
                    "week_start_date": parsed_checkin.week_start_date.isoformat(),
                    "status": parsed_checkin.status.value,
                    # A personal export includes the requester's own writing,
                    # not the other member's author-private reflection.
                    "responses": parsed_checkin.user_responses.get(current_user.id, {}),
                    "completed_at": parsed_checkin.completed_at.isoformat() if parsed_checkin.completed_at else None,
                })
            
            # Get goals
            goals_cursor = db.relationship_goals.find({"couple_id": couple_query})
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
            subscription_doc = await db.subscriptions.find_one({"couple_id": couple_query})
            if subscription_doc:
                export_data["subscriptions"].append({
                    "id": str(subscription_doc["_id"]),
                    "tier": subscription_doc.get("tier", ""),
                    "status": subscription_doc.get("status", ""),
                    "trial_start": subscription_doc.get("trial_start").isoformat() if subscription_doc.get("trial_start") else None,
                    "trial_end": subscription_doc.get("trial_end").isoformat() if subscription_doc.get("trial_end") else None,
                })
            
            # Get usage records
            usage_cursor = db.usages.find({"couple_id": couple_query})
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
        logger.error("Data export error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to export data. Please try again."
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
        
        user_query = {"$in": [current_user.id, ObjectId(current_user.id)]}

        if couple_doc:
            couple_id_str = str(couple_doc["_id"])
            couple_id_obj = couple_doc["_id"]
            couple_query = {"$in": [couple_id_str, couple_id_obj]}

            # Collect this couple's argument ids before touching anything,
            # so AI-generated insights derived from the deleted perspectives
            # can be purged too (see below) instead of surviving deletion.
            argument_ids = [
                arg["_id"]
                async for arg in db.arguments.find({"couple_id": couple_query}, {"_id": 1})
            ]

            # Delete user's perspectives
            await db.perspectives.delete_many({"user_id": user_query})

            # Delete arguments created by this user (if any)
            # Note: We might want to keep arguments if couple wants to keep them
            # For now, anonymize rather than delete
            await db.arguments.update_many(
                {"couple_id": couple_query},
                {"$set": {"created_by_user_id": None}}  # Anonymize instead of delete
            )

            # Remove the deleted user's private check-in responses rather than
            # leaving their plaintext/encrypted reflection in shared history.
            await db.relationship_checkins.update_many(
                {"couple_id": couple_query},
                {
                    "$unset": {f"user_responses.{current_user.id}": ""},
                    "$pull": {"completed_by": {"$in": [current_user.id, ObjectId(current_user.id)]}},
                },
            )

            # Delete goals created by this user
            await db.relationship_goals.delete_many({
                "couple_id": couple_query,
                "created_by_user_id": user_query
            })

            # AI-generated insights are derived directly from the perspective
            # content just deleted above (summaries, quoted disagreements,
            # root causes) — they must not outlive it. Previously these
            # survived "delete my account" indefinitely.
            if argument_ids:
                await db.ai_insights.delete_many({"argument_id": {"$in": argument_ids}})

            # Cached AI goal/check-in suggestions are also derived content.
            await db.ai_suggestion_cache.delete_many({"couple_id": couple_query})

        # Refresh tokens, device push tokens, and in-app notifications are
        # tied to this user specifically (not the couple) and are not
        # needed for the couple's remaining history — purge them outright.
        await db.refresh_tokens.delete_many({"user_id": user_query})
        await db.device_tokens.delete_many({"user_id": user_query})
        await db.in_app_notifications.delete_many({"user_id": user_query})

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
        logger.error("Account deletion error: %s", e, exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete account. Please try again."
        )
