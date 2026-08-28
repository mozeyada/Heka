import pytest
from unittest.mock import AsyncMock
from datetime import datetime

from app.services.safety_service import SafetyService

@pytest.fixture
def safety_service():
    return SafetyService()

def test_detect_safety_concerns_none(safety_service):
    result = safety_service.detect_safety_concerns("We had a normal disagreement.", "Just a misunderstanding.")
    assert not result["has_concerns"]
    assert result["severity"] == "none"
    assert result["action"] == "proceed"
    assert len(result["concern_types"]) == 0

def test_detect_safety_concerns_violence_critical(safety_service):
    result = safety_service.detect_safety_concerns("He said he would hit me.", "I didn't say that.")
    assert result["has_concerns"]
    assert result["severity"] == "critical"
    assert result["action"] == "block_mediation"
    assert "violence" in result["concern_types"]

def test_detect_safety_concerns_abuse_pattern(safety_service):
    # Tests the ABUSE_PATTERNS regex
    result = safety_service.detect_safety_concerns("He said you're crazy all the time.", "I never said you're crazy.")
    assert result["has_concerns"]
    assert result["severity"] == "critical"
    assert "abuse" in result["concern_types"]

def test_detect_safety_concerns_self_harm(safety_service):
    result = safety_service.detect_safety_concerns("I just want to end my life.", "")
    assert result["has_concerns"]
    assert result["severity"] == "critical"
    assert "self_harm" in result["concern_types"]

def test_detect_safety_concerns_mental_health(safety_service):
    result = safety_service.detect_safety_concerns("I had a panic attack.", "I tried to help.")
    assert result["has_concerns"]
    assert result["severity"] == "high"
    assert result["action"] == "show_crisis_resources"
    assert "mental_health_crisis" in result["concern_types"]

def test_detect_safety_concerns_substance(safety_service):
    result = safety_service.detect_safety_concerns("His substance abuse is getting worse.", "I don't have a problem.")
    assert result["has_concerns"]
    assert result["severity"] == "medium"
    assert result["action"] == "show_crisis_resources"
    assert "substance" in result["concern_types"]

def test_should_block_mediation(safety_service):
    critical_check = {"severity": "critical"}
    high_check = {"severity": "high"}
    none_check = {"severity": "none"}
    
    assert safety_service.should_block_mediation(critical_check) is True
    assert safety_service.should_block_mediation(high_check) is False
    assert safety_service.should_block_mediation(none_check) is False

def test_build_notice_no_concerns(safety_service):
    check = {"has_concerns": False}
    assert safety_service.build_notice(check) is None

def test_build_notice_with_concerns(safety_service):
    check = {
        "has_concerns": True,
        "severity": "high",
        "concern_types": ["mental_health_crisis"],
        "message": "Seek help"
    }
    notice = safety_service.build_notice(check)
    assert notice is not None
    assert notice["severity"] == "high"
    assert notice["message"] == "Seek help"
    assert "resources" in notice

@pytest.mark.asyncio
async def test_record_alert_no_concerns(safety_service):
    db_mock = AsyncMock()
    check = {"has_concerns": False}
    await safety_service.record_alert(
        safety_check=check,
        db=db_mock,
        context="test_context"
    )
    db_mock.safety_alerts.insert_one.assert_not_called()

@pytest.mark.asyncio
async def test_record_alert_with_concerns(safety_service):
    db_mock = AsyncMock()
    check = {
        "has_concerns": True,
        "concern_types": ["violence"],
        "severity": "critical"
    }
    await safety_service.record_alert(
        safety_check=check,
        db=db_mock,
        context="test_context",
        argument_id="60d5ec49f1b2c8b1f8c7e9a1",
        couple_id="60d5ec49f1b2c8b1f8c7e9a2",
        user_id="60d5ec49f1b2c8b1f8c7e9a3"
    )
    db_mock.safety_alerts.insert_one.assert_called_once()
    call_args = db_mock.safety_alerts.insert_one.call_args[0][0]
    
    assert call_args["context"] == "test_context"
    assert call_args["concern_types"] == ["violence"]
    assert call_args["severity"] == "critical"
    assert call_args["reviewed"] is False
    assert isinstance(call_args["created_at"], datetime)
    assert str(call_args["argument_id"]) == "60d5ec49f1b2c8b1f8c7e9a1"
