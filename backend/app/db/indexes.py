"""Database indexes and validators for MongoDB collections."""

import logging

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING
from pymongo.errors import OperationFailure

logger = logging.getLogger(__name__)


async def _safe_create_index(collection, keys, **kwargs):
    """Create an index without taking the API down on existing-data conflicts."""
    try:
        await collection.create_index(keys, **kwargs)
    except OperationFailure as exc:
        logger.warning("Index creation skipped for %s: %s", collection.name, exc)


async def _apply_validator(db: AsyncIOMotorDatabase, collection_name: str, validator: dict):
    """Apply a collection validator in moderate mode."""
    try:
        await db.command({
            "collMod": collection_name,
            "validator": validator,
            "validationLevel": "moderate",
            "validationAction": "error",
        })
    except OperationFailure as exc:
        # NamespaceNotFound => create collection first, then apply validator.
        if "NamespaceNotFound" in str(exc):
            await db.create_collection(collection_name, validator=validator, validationLevel="moderate", validationAction="error")
        else:
            logger.warning("Validator update skipped for %s: %s", collection_name, exc)


async def create_validators(db: AsyncIOMotorDatabase):
    """Create/refresh validators for the most business-critical collections."""

    subscription_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": [
                "couple_id",
                "tier",
                "status",
                "cancel_at_period_end",
                "created_at",
                "updated_at",
            ],
            "properties": {
                "couple_id": {"bsonType": "objectId"},
                "tier": {"enum": ["free", "basic", "premium"]},
                "status": {"enum": ["trial", "active", "cancelled", "expired"]},
                "stripe_subscription_id": {"bsonType": ["string", "null"]},
                "stripe_customer_id": {"bsonType": ["string", "null"]},
                "trial_start": {"bsonType": ["date", "null"]},
                "trial_end": {"bsonType": ["date", "null"]},
                "current_period_start": {"bsonType": ["date", "null"]},
                "current_period_end": {"bsonType": ["date", "null"]},
                "cancelled_at": {"bsonType": ["date", "null"]},
                "cancel_at_period_end": {"bsonType": "bool"},
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    }

    invitation_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["inviter_id", "invitee_email", "token", "status", "created_at", "expires_at"],
            "properties": {
                "inviter_id": {"bsonType": "objectId"},
                "invitee_email": {"bsonType": "string"},
                "token": {"bsonType": "string"},
                "status": {"enum": ["pending", "accepted", "expired", "cancelled"]},
                "couple_id": {"bsonType": ["objectId", "null"]},
                "accepted_at": {"bsonType": ["date", "null"]},
                "created_at": {"bsonType": "date"},
                "expires_at": {"bsonType": "date"},
            },
        }
    }

    checkin_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["couple_id", "week_start_date", "status", "user_responses", "completed_by", "created_at", "updated_at"],
            "properties": {
                "couple_id": {"bsonType": "objectId"},
                "week_start_date": {"bsonType": "date"},
                "status": {"enum": ["pending", "awaiting_partner", "completed", "skipped"]},
                "user_responses": {"bsonType": "object"},
                "completed_by": {"bsonType": "array", "items": {"bsonType": "objectId"}},
                "completed_at": {"bsonType": ["date", "null"]},
                "ai_harmony_report": {"bsonType": ["string", "null"]},
                "created_at": {"bsonType": "date"},
                "updated_at": {"bsonType": "date"},
            },
        }
    }

    usage_validator = {
        "$jsonSchema": {
            "bsonType": "object",
            "required": ["couple_id", "usage_type", "period_start", "period_end", "count", "created_at"],
            "properties": {
                "couple_id": {"bsonType": "objectId"},
                "usage_type": {"enum": ["argument_resolution", "ai_analysis"]},
                "argument_id": {"bsonType": ["objectId", "null"]},
                "period_start": {"bsonType": "date"},
                "period_end": {"bsonType": "date"},
                "count": {"bsonType": "int", "minimum": 0},
                "created_at": {"bsonType": "date"},
            },
        }
    }

    await _apply_validator(db, "subscriptions", subscription_validator)
    await _apply_validator(db, "invitations", invitation_validator)
    await _apply_validator(db, "relationship_checkins", checkin_validator)
    await _apply_validator(db, "usages", usage_validator)


async def create_indexes(db: AsyncIOMotorDatabase):
    """Create indexes for MongoDB collections."""
    await create_validators(db)
    
    # Users collection indexes
    await _safe_create_index(db.users, "email", unique=True)
    await _safe_create_index(db.users, "created_at")
    
    # Couples collection indexes
    await _safe_create_index(db.couples, "user1_id")
    await _safe_create_index(db.couples, "user2_id")
    await _safe_create_index(db.couples, [("user1_id", ASCENDING), ("user2_id", ASCENDING)], unique=True)
    await _safe_create_index(db.couples, "status")
    
    # Arguments collection indexes
    await _safe_create_index(db.arguments, "couple_id")
    await _safe_create_index(db.arguments, [("couple_id", ASCENDING), ("created_at", DESCENDING)])
    await _safe_create_index(db.arguments, "status")
    await _safe_create_index(db.arguments, "category")
    
    # Perspectives collection indexes
    await _safe_create_index(db.perspectives, "argument_id")
    await _safe_create_index(db.perspectives, "user_id")
    await _safe_create_index(db.perspectives, [("argument_id", ASCENDING), ("user_id", ASCENDING)], unique=True)
    
    # AI Insights collection indexes
    await _safe_create_index(db.ai_insights, "argument_id", unique=True)
    await _safe_create_index(db.ai_insights, "generated_at")
    
    # Invitations collection indexes
    await _safe_create_index(db.invitations, "token", unique=True)
    await _safe_create_index(db.invitations, "inviter_id")
    await _safe_create_index(db.invitations, "invitee_email")
    await _safe_create_index(db.invitations, "status")
    await _safe_create_index(db.invitations, "expires_at")
    await _safe_create_index(
        db.invitations,
        [("inviter_id", ASCENDING), ("invitee_email", ASCENDING)],
        unique=True,
        partialFilterExpression={"status": "pending"},
        name="uniq_pending_invitation_per_inviter_email",
    )
    
    # Relationship Check-ins collection indexes
    await _safe_create_index(db.relationship_checkins, "couple_id")
    await _safe_create_index(
        db.relationship_checkins,
        [("couple_id", ASCENDING), ("week_start_date", DESCENDING)],
        unique=True,
        name="uniq_checkin_per_couple_week",
    )
    await _safe_create_index(db.relationship_checkins, "status")
    await _safe_create_index(db.relationship_checkins, "week_start_date")
    
    # Relationship Goals collection indexes
    await _safe_create_index(db.relationship_goals, "couple_id")
    await _safe_create_index(db.relationship_goals, [("couple_id", ASCENDING), ("status", ASCENDING)])
    await _safe_create_index(db.relationship_goals, "status")
    await _safe_create_index(db.relationship_goals, "created_at")
    
    # Subscriptions collection indexes
    await _safe_create_index(db.subscriptions, "couple_id", unique=True)
    await _safe_create_index(
        db.subscriptions,
        "stripe_subscription_id",
        unique=True,
        partialFilterExpression={"stripe_subscription_id": {"$type": "string"}},
        name="uniq_stripe_subscription_id",
    )
    await _safe_create_index(db.subscriptions, "stripe_customer_id")
    await _safe_create_index(db.subscriptions, "status")
    
    # Usage tracking collection indexes
    await _safe_create_index(db.usages, "couple_id")
    await _safe_create_index(
        db.usages,
        [("couple_id", ASCENDING), ("usage_type", ASCENDING), ("period_start", ASCENDING), ("period_end", ASCENDING), ("argument_id", ASCENDING)],
        unique=True,
        name="uniq_usage_bucket",
    )
    await _safe_create_index(db.usages, "period_start")
    await _safe_create_index(db.usages, "period_end")

    # AI Suggestion Cache collection indexes
    await _safe_create_index(db.ai_suggestion_cache, [("couple_id", ASCENDING), ("suggestion_type", ASCENDING)], unique=True)
    await _safe_create_index(db.ai_suggestion_cache, "expires_at")
    
    logger.info("Database indexes and validators refreshed successfully")
