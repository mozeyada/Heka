import pytest
from unittest.mock import AsyncMock, patch, MagicMock
from httpx import Response
import json
from bson import ObjectId

from app.services.ai_service import AIMediationService

@pytest.fixture
def ai_service():
    return AIMediationService()

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.ai_insights.insert_one.return_value.inserted_id = "test_id"
    return db

@pytest.mark.asyncio
async def test_mediate_argument_success(ai_service, mock_db):
    mock_response_json = {
        "summary": "Both partners care deeply about resolving this issue and improving their communication habits.",
        "common_ground": ["Both want financial peace and clarity"],
        "disagreements": ["Disagreement on monthly budgeting priorities"],
        "root_causes": ["Fear of financial insecurity and lack of collaborative visibility"],
        "suggestions": [
            {
                "title": "Weekly Budget Review",
                "description": "Establish a 15-minute weekly alignment session.",
                "actionable_steps": ["Review expenses together", "Set mutual weekly goals"]
            },
            {
                "title": "Shared Spending Threshold",
                "description": "Agree on a threshold for individual discretionary spending.",
                "actionable_steps": ["Agree on dollar amount", "Discuss larger purchases beforehand"]
            }
        ],
        "communication_tips": ["Use gentle startup", "Acknowledge feelings before numbers"]
    }
    
    mock_openai_response = {
        "choices": [{"message": {"content": json.dumps(mock_response_json)}}],
        "usage": {"prompt_tokens": 10, "completion_tokens": 20}
    }
    
    with patch("app.services.ai_service.safety_service.detect_safety_concerns") as mock_safety:
        mock_safety.return_value = {"has_concerns": False, "severity": "none"}
        
        with patch.object(ai_service, "_execute_with_retry") as mock_retry:
            mock_resp = MagicMock(spec=Response)
            mock_resp.json.return_value = mock_openai_response
            mock_retry.return_value = mock_resp
            
            valid_arg_id = str(ObjectId())
            result = await ai_service.mediate_argument(
                valid_arg_id, "Perspective 1", "Perspective 2", "finance", mock_db
            )
            
            assert "Both partners care" in result["summary"]
            assert result["common_ground"] == ["Both want financial peace and clarity"]
            assert result["cost"] > 0
            assert result["model_used"] == ai_service.model
            mock_db.ai_insights.insert_one.assert_called_once()

@pytest.mark.asyncio
async def test_mediate_argument_safety_blocked(ai_service, mock_db):
    with patch("app.services.ai_service.safety_service.detect_safety_concerns") as mock_safety,          patch("app.services.ai_service.safety_service.should_block_mediation", return_value=True):
        mock_safety.return_value = {"has_concerns": True, "severity": "critical", "message": "Blocked for safety"}
        
        with pytest.raises(Exception, match="SAFETY_BLOCK"):
            await ai_service.mediate_argument(
                str(ObjectId()), "Threat", "Threat", "finance", mock_db
            )

@pytest.mark.asyncio
async def test_generate_harmony_report(ai_service, mock_db):
    mock_openai_response = {
        "choices": [{"message": {"content": "Harmony Report Markdown"}}]
    }
    
    with patch.object(ai_service, "_execute_with_retry") as mock_retry:
        mock_resp = MagicMock(spec=Response)
        mock_resp.json.return_value = mock_openai_response
        mock_retry.return_value = mock_resp
        
        valid_checkin_id = str(ObjectId())
        report = await ai_service.generate_harmony_report(
            valid_checkin_id, mock_db, {"q1": "a"}, {"q1": "b"}
        )
        
        assert report == "Harmony Report Markdown"
        mock_db.relationship_checkins.update_one.assert_called_once()
