"""Couples endpoints with invitation system."""

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from app.api.dependencies import get_current_user
from app.db.database import get_database
from app.models.user import UserInDB
from app.models.couple import CoupleInDB, CoupleStatus
from app.models.invitation import InvitationInDB, InvitationStatus
from app.services.email_service import email_service
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from datetime import datetime, timedelta
import secrets
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/couples", tags=["Couples"])


class InviteRequest(BaseModel):
    """Invite partner request."""
    partner_email: EmailStr


@router.post("/invite")
async def invite_partner(
    invite_data: InviteRequest,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Invite a partner to create a couple profile."""
    
    partner_email = invite_data.partner_email.lower()
    
    # Check if user already has a couple
    existing_couple = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if existing_couple:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active couple profile"
        )
    
    # Check if there's already a pending invitation
    existing_invitation = await db.invitations.find_one({
        "inviter_id": ObjectId(current_user.id),
        "invitee_email": partner_email,
        "status": InvitationStatus.PENDING.value
    })
    
    if existing_invitation:
        # Check if invitation expired
        existing_invitation_obj = InvitationInDB.from_mongo(existing_invitation)
        if existing_invitation_obj.expires_at < datetime.utcnow():
            # Expired invitation, allow resending
            await db.invitations.update_one(
                {"_id": ObjectId(existing_invitation_obj.id)},
                {"$set": {"status": InvitationStatus.EXPIRED.value}}
            )
        else:
            # Still pending, return invitation info so user can resend
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invitation already sent to this email. It expires on {existing_invitation_obj.expires_at.strftime('%Y-%m-%d %H:%M')}. Use /resend-invitation/{existing_invitation_obj.id} to resend."
            )
    
    # Generate invitation token
    invitation_token = secrets.token_urlsafe(32)
    
    # Create invitation
    invitation = InvitationInDB(
        inviter_id=current_user.id,
        invitee_email=partner_email,
        token=invitation_token,
        status=InvitationStatus.PENDING,
        expires_at=datetime.utcnow() + timedelta(days=7)
    )
    
    # Save invitation
    result = await db.invitations.insert_one(invitation.to_mongo())
    invitation.id = str(result.inserted_id)
    
    # Send invitation email
    await email_service.send_invitation_email(
        to_email=partner_email,
        inviter_name=current_user.name,
        invitation_token=invitation_token
    )
    
    return {
        "message": "Invitation sent successfully",
        "invitation_id": invitation.id,
        "invitee_email": partner_email
    }


@router.post("/resend-invitation/{invitation_id}")
async def resend_invitation(
    invitation_id: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Resend an invitation email."""
    
    # Find invitation
    invitation_doc = await db.invitations.find_one({
        "_id": ObjectId(invitation_id),
        "inviter_id": ObjectId(current_user.id)
    })
    
    if not invitation_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found"
        )
    
    invitation = InvitationInDB.from_mongo(invitation_doc)
    
    # Check if already accepted
    if invitation.status == InvitationStatus.ACCEPTED.value:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation already accepted"
        )
    
    # Check if expired - create new one
    if invitation.expires_at < datetime.utcnow():
        # Generate new token
        invitation_token = secrets.token_urlsafe(32)
        await db.invitations.update_one(
            {"_id": ObjectId(invitation.id)},
            {
                "$set": {
                    "token": invitation_token,
                    "status": InvitationStatus.PENDING.value,
                    "expires_at": datetime.utcnow() + timedelta(days=7)
                }
            }
        )
        invitation.token = invitation_token
    else:
        # Use existing token
        invitation_token = invitation.token
    
    # Resend email
    await email_service.send_invitation_email(
        to_email=invitation.invitee_email,
        inviter_name=current_user.name,
        invitation_token=invitation_token
    )
    
    return {
        "message": "Invitation resent successfully",
        "invitation_id": invitation.id,
        "invitee_email": invitation.invitee_email,
        "expires_at": invitation.expires_at.isoformat()
    }


@router.get("/pending-invitations")
async def get_pending_invitations(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get all pending invitations sent by current user."""
    
    invitations_docs = await db.invitations.find({
        "inviter_id": ObjectId(current_user.id),
        "status": InvitationStatus.PENDING.value
    }).to_list(length=100)
    
    invitations = [InvitationInDB.from_mongo(doc) for doc in invitations_docs]
    
    return {
        "invitations": [
            {
                "id": inv.id,
                "invitee_email": inv.invitee_email,
                "created_at": inv.created_at.isoformat(),
                "expires_at": inv.expires_at.isoformat(),
                "is_expired": inv.expires_at < datetime.utcnow()
            }
            for inv in invitations
        ]
    }


@router.post("/accept-invitation/{token}")
async def accept_invitation(
    token: str,
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Accept a couple invitation."""
    
    # Find invitation
    invitation_doc = await db.invitations.find_one({
        "token": token,
        "status": InvitationStatus.PENDING.value
    })
    
    if not invitation_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invitation not found or already used"
        )
    
    invitation = InvitationInDB.from_mongo(invitation_doc)
    
    # Check if expired
    if invitation.expires_at < datetime.utcnow():
        await db.invitations.update_one(
            {"_id": ObjectId(invitation.id)},
            {"$set": {"status": InvitationStatus.EXPIRED.value}}
        )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invitation has expired"
        )
    
    # Verify email matches
    if invitation.invitee_email.lower() != current_user.email.lower():
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This invitation is for a different email address"
        )
    
    # Check if inviter still exists
    inviter_doc = await db.users.find_one({"_id": ObjectId(invitation.inviter_id)})
    if not inviter_doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Inviter account not found"
        )
    
    # Check if user already has a couple
    existing_couple = await db.couples.find_one({
        "$or": [
            {"user1_id": ObjectId(current_user.id)},
            {"user2_id": ObjectId(current_user.id)}
        ],
        "status": CoupleStatus.ACTIVE.value
    })
    
    if existing_couple:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You already have an active couple profile"
        )
    
    # Create couple profile
    couple = CoupleInDB(
        user1_id=invitation.inviter_id,
        user2_id=current_user.id,
        status=CoupleStatus.ACTIVE
    )
    
    couple_result = await db.couples.insert_one(couple.to_mongo())
    couple.id = str(couple_result.inserted_id)
    
    # Update invitation
    await db.invitations.update_one(
        {"_id": ObjectId(invitation.id)},
        {
            "$set": {
                "status": InvitationStatus.ACCEPTED.value,
                "couple_id": couple.id,
                "accepted_at": datetime.utcnow()
            }
        }
    )
    
    return {
        "message": "Invitation accepted successfully",
        "couple": {
            "id": couple.id,
            "user1_id": couple.user1_id,
            "user2_id": couple.user2_id,
            "status": couple.status.value
        }
    }


@router.get("/me")
async def get_my_couple(
    current_user: UserInDB = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get current user's couple profile."""
    
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
    
    return {
        "id": couple.id,
        "user1_id": couple.user1_id,
        "user2_id": couple.user2_id,
        "status": couple.status.value,
        "created_at": couple.created_at
    }
