"""Tests for AI Mediation Impartiality, Bilateral Symmetry, and Anti-Weaponization."""

import pytest
from app.services.ai_service import ai_service


def test_ai_service_validates_required_fields():
    """Ensure validator checks for all mediation structure fields."""
    valid_response = {
        "summary": "Both partners care deeply about the relationship and want to establish more reliable daily routines together.",
        "common_ground": ["Both value a peaceful home", "Both desire quality time together"],
        "disagreements": ["Partner 1 feels overwhelmed by chore load", "Partner 2 feels unappreciated for their efforts"],
        "root_causes": ["Underlying fear of disconnection and feeling taken for granted on both sides"],
        "suggestions": [
            {
                "title": "Weekly 15-Minute Sync",
                "description": "Align on weekly chore distribution collaboratively.",
                "actionable_steps": ["List chores together", "Choose ownership areas"]
            },
            {
                "title": "Daily Appreciation Moment",
                "description": "Express gratitude for one specific effort each evening.",
                "actionable_steps": ["Say thank you before bed"]
            }
        ],
        "communication_tips": [
            "Use gentle startup statements",
            "Acknowledge partner feelings before explaining intent"
        ]
    }
    
    assert ai_service._validate_ai_response(valid_response) is True


def test_ai_service_flags_incomplete_or_short_summary():
    """Ensure validator rejects responses missing fields or having inadequate content."""
    incomplete_response = {
        "summary": "Short.",
        "common_ground": ["Peace"],
        "disagreements": ["Chores"],
        "root_causes": ["Stress"],
        "suggestions": [
            {"title": "Sync", "description": "Talk", "actionable_steps": ["Talk"]}
        ],
        "communication_tips": ["Be nice"]
    }
    assert ai_service._validate_ai_response(incomplete_response) is False


def test_ai_service_detects_harmful_or_pathologizing_language(caplog):
    """Ensure validator logs warnings on harmful or weaponized diagnostic language."""
    weaponized_response = {
        "summary": "Partner 1 is communicating constructively, but Partner 2 is behaving in a toxic and narcissistic manner.",
        "common_ground": ["Both want to resolve this conflict"],
        "disagreements": ["Partner 2's gaslighting behavior"],
        "root_causes": ["Partner 2 is manipulative and stonewalling"],
        "suggestions": [
            {
                "title": "End Manipulation",
                "description": "Partner 2 must stop being toxic.",
                "actionable_steps": ["Admit fault"]
            },
            {
                "title": "Consider Divorce",
                "description": "If this continues, break up.",
                "actionable_steps": ["Consult lawyer"]
            }
        ],
        "communication_tips": ["Avoid gaslighting"]
    }
    
    with caplog.at_level("WARNING"):
        ai_service._validate_ai_response(weaponized_response)
        assert any("harmful" in record.message.lower() or "pathologizing" in record.message.lower() for record in caplog.records)
