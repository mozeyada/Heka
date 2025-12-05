"""Service for managing AI suggestion cache in MongoDB."""

import logging
from datetime import datetime
from typing import Any, Dict, List, Optional

from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.ai_suggestion_cache import AISuggestionCacheInDB

logger = logging.getLogger(__name__)


class AISuggestionCacheService:
    """Service for caching AI-generated suggestions."""
    
    @staticmethod
    async def get_cached_suggestions(
        couple_id: str,
        suggestion_type: str,
        db: AsyncIOMotorDatabase
    ) -> Optional[AISuggestionCacheInDB]:
        """
        Get cached suggestions if they exist and are not expired.
        
        Args:
            couple_id: Couple ID
            suggestion_type: 'goals' or 'checkins'
            db: Database instance
            
        Returns:
            AISuggestionCacheInDB if valid cache exists, None otherwise
        """
        try:
            couple_oid = ObjectId(couple_id)
            
            # Find cache entry
            cache_doc = await db.ai_suggestion_cache.find_one({
                "couple_id": couple_oid,
                "suggestion_type": suggestion_type
            })
            
            if not cache_doc:
                return None
            
            cache = AISuggestionCacheInDB.from_mongo(cache_doc)
            
            # Check if expired
            if cache.expires_at < datetime.utcnow():
                logger.info(f"Cache expired for couple {couple_id}, type {suggestion_type}")
                # Delete expired cache
                await db.ai_suggestion_cache.delete_one({"_id": ObjectId(cache.id)})
                return None
            
            logger.info(f"Cache hit for couple {couple_id}, type {suggestion_type}")
            return cache
            
        except Exception as e:
            logger.error(f"Error getting cached suggestions: {e}")
            return None
    
    @staticmethod
    async def save_suggestions(
        couple_id: str,
        suggestion_type: str,
        suggestions: List[Dict[str, Any]],
        linked_argument_ids: List[str],
        db: AsyncIOMotorDatabase,
        ai_model: Optional[str] = None,
        cost: Optional[float] = None
    ) -> AISuggestionCacheInDB:
        """
        Save suggestions to cache with 7-day expiration.
        
        Args:
            couple_id: Couple ID
            suggestion_type: 'goals' or 'checkins'
            suggestions: List of suggestion dictionaries
            linked_argument_ids: List of argument IDs that were analyzed
            db: Database instance
            ai_model: AI model used
            cost: Cost of generation
            
        Returns:
            Saved AISuggestionCacheInDB instance
        """
        try:
            # Create new cache entry
            cache = AISuggestionCacheInDB.create_new(
                couple_id=couple_id,
                suggestion_type=suggestion_type,
                suggestions=suggestions,
                linked_argument_ids=linked_argument_ids,
                ai_model=ai_model,
                cost=cost
            )
            
            # Delete old cache if exists
            await db.ai_suggestion_cache.delete_many({
                "couple_id": ObjectId(couple_id),
                "suggestion_type": suggestion_type
            })
            
            # Insert new cache
            result = await db.ai_suggestion_cache.insert_one(cache.to_mongo())
            cache.id = str(result.inserted_id)
            
            logger.info(f"Cached {len(suggestions)} suggestions for couple {couple_id}, type {suggestion_type}")
            return cache
            
        except Exception as e:
            logger.error(f"Error saving suggestions to cache: {e}")
            raise
    
    @staticmethod
    async def invalidate_cache(
        couple_id: str,
        suggestion_type: Optional[str] = None,
        db: AsyncIOMotorDatabase = None
    ) -> None:
        """
        Invalidate cache for a couple.
        
        Args:
            couple_id: Couple ID
            suggestion_type: 'goals', 'checkins', or None (invalidate all)
            db: Database instance
        """
        if db is None:
            from app.db.database import get_database
            db = get_database()
        
        try:
            query = {"couple_id": ObjectId(couple_id)}
            if suggestion_type:
                query["suggestion_type"] = suggestion_type
            
            result = await db.ai_suggestion_cache.delete_many(query)
            logger.info(f"Invalidated cache for couple {couple_id}, type {suggestion_type or 'all'}, deleted {result.deleted_count} entries")
            
        except Exception as e:
            logger.error(f"Error invalidating cache: {e}")


# Singleton instance
ai_suggestion_cache_service = AISuggestionCacheService()
