from unittest.mock import AsyncMock, MagicMock
import pytest
from fastapi import HTTPException
from bson import ObjectId

from app.api.users import delete_account
from app.models.user import UserInDB

@pytest.fixture
def mock_db():
    db = MagicMock()
    db.couples.find_one = AsyncMock(return_value={"_id": ObjectId()})
    
    # Setup async generator for arguments
    async def mock_find(*args, **kwargs):
        for doc in [{"_id": ObjectId()}, {"_id": ObjectId()}]:
            yield doc
    
    db.arguments.find = MagicMock(return_value=mock_find())
    
    db.perspectives.delete_many = AsyncMock()
    db.arguments.update_many = AsyncMock()
    db.relationship_checkins.update_many = AsyncMock()
    db.relationship_goals.delete_many = AsyncMock()
    db.ai_insights.delete_many = AsyncMock()
    db.ai_suggestion_cache.delete_many = AsyncMock()
    db.refresh_tokens.delete_many = AsyncMock()
    db.device_tokens.delete_many = AsyncMock()
    db.in_app_notifications.delete_many = AsyncMock()
    db.users.update_one = AsyncMock()
    
    return db

@pytest.fixture
def current_user():
    return UserInDB(
        id=str(ObjectId()),
        email="test@example.com",
        password_hash="hash",
        name="Test",
        age=30,
    )

@pytest.mark.asyncio
async def test_delete_account_missing_confirmation(current_user, mock_db):
    with pytest.raises(HTTPException) as exc:
        await delete_account(confirmation="wrong", current_user=current_user, db=mock_db)
    
    assert exc.value.status_code == 400
    assert "confirmation='DELETE'" in exc.value.detail

@pytest.mark.asyncio
async def test_delete_account_purges_and_anonymizes(current_user, mock_db):
    res = await delete_account(confirmation="DELETE", current_user=current_user, db=mock_db)
    
    assert res["success"] is True
    
    # 1. Perspectives deleted
    mock_db.perspectives.delete_many.assert_called_once()
    
    # 2. Arguments anonymized
    mock_db.arguments.update_many.assert_called_once()
    assert "$set" in mock_db.arguments.update_many.call_args[0][1]
    assert "created_by_user_id" in mock_db.arguments.update_many.call_args[0][1]["$set"]
    
    # 3. Checkins anonymized
    mock_db.relationship_checkins.update_many.assert_called_once()
    
    # 4. Goals deleted
    mock_db.relationship_goals.delete_many.assert_called_once()
    
    # 5. AI insights and cache deleted
    mock_db.ai_insights.delete_many.assert_called_once()
    mock_db.ai_suggestion_cache.delete_many.assert_called_once()
    
    # 6. Tokens & notifications deleted
    mock_db.refresh_tokens.delete_many.assert_called_once()
    mock_db.device_tokens.delete_many.assert_called_once()
    mock_db.in_app_notifications.delete_many.assert_called_once()
    
    # 7. User anonymized
    mock_db.users.update_one.assert_called_once()
    update_doc = mock_db.users.update_one.call_args[0][1]
    assert update_doc["$set"]["is_active"] is False
    assert "deleted" in update_doc["$set"]["email"]
    assert update_doc["$set"]["name"] == "Deleted User"
