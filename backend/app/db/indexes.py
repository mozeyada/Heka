"""Database indexes for MongoDB collections."""

from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ASCENDING, DESCENDING


async def create_indexes(db: AsyncIOMotorDatabase):
    """Create indexes for MongoDB collections."""
    
    # Users collection indexes
    await db.users.create_index("email", unique=True)
    await db.users.create_index("created_at")
    
    # Couples collection indexes
    await db.couples.create_index("user1_id")
    await db.couples.create_index("user2_id")
    await db.couples.create_index([("user1_id", ASCENDING), ("user2_id", ASCENDING)], unique=True)
    await db.couples.create_index("status")
    
    # Arguments collection indexes
    await db.arguments.create_index("couple_id")
    await db.arguments.create_index([("couple_id", ASCENDING), ("created_at", DESCENDING)])
    await db.arguments.create_index("status")
    await db.arguments.create_index("category")
    
    # Perspectives collection indexes
    await db.perspectives.create_index("argument_id")
    await db.perspectives.create_index("user_id")
    await db.perspectives.create_index([("argument_id", ASCENDING), ("user_id", ASCENDING)], unique=True)
    
    # AI Insights collection indexes
    await db.ai_insights.create_index("argument_id", unique=True)
    await db.ai_insights.create_index("generated_at")
    
    # Invitations collection indexes
    await db.invitations.create_index("token", unique=True)
    await db.invitations.create_index("inviter_id")
    await db.invitations.create_index("invitee_email")
    await db.invitations.create_index("status")
    await db.invitations.create_index("expires_at")
    await db.invitations.create_index([("inviter_id", ASCENDING), ("invitee_email", ASCENDING), ("status", ASCENDING)])
    
    # Relationship Check-ins collection indexes
    await db.relationship_checkins.create_index("couple_id")
    await db.relationship_checkins.create_index([("couple_id", ASCENDING), ("week_start_date", DESCENDING)])
    await db.relationship_checkins.create_index("status")
    await db.relationship_checkins.create_index("week_start_date")
    
    # Relationship Goals collection indexes
    await db.relationship_goals.create_index("couple_id")
    await db.relationship_goals.create_index([("couple_id", ASCENDING), ("status", ASCENDING)])
    await db.relationship_goals.create_index("status")
    await db.relationship_goals.create_index("created_at")
    
    # Subscriptions collection indexes
    await db.subscriptions.create_index("couple_id", unique=True)
    await db.subscriptions.create_index("stripe_subscription_id")
    await db.subscriptions.create_index("stripe_customer_id")
    await db.subscriptions.create_index("status")
    
    # Usage tracking collection indexes
    await db.usages.create_index("couple_id")
    await db.usages.create_index([("couple_id", ASCENDING), ("usage_type", ASCENDING), ("period_start", ASCENDING)])
    await db.usages.create_index("period_start")
    await db.usages.create_index("period_end")
    
    print("Database indexes created successfully")

