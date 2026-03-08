"""Safety detection service for crisis situations and abuse indicators."""

import logging
from typing import Dict, List

logger = logging.getLogger(__name__)


class SafetyService:
    """Service for detecting safety concerns in user input."""
    
    # Crisis keywords organized by concern type
    CRISIS_KEYWORDS = {
        'violence': [
            'punch', 'punching', 'physically attack',
            'violent', 'violence', 'beat you', 'beating you',
            'assault', 'assaulting', 'physically harm',
            'domestic violence', 'threaten to kill'
        ],
        'abuse': [
            'manipulate', 'manipulating', 'manipulation', 'coerce', 'coercing',
            'financial control', 'emotional abuse',
            'verbal abuse', 'psychological abuse', 'gaslight', 'gaslighting'
        ],
        'self_harm': [
            'suicide', 'suicidal', 'kill myself', 'end my life', 'want to die',
            'self-harm', 'self harm', 'cutting', 'cut myself', 'better off dead'
        ],
        'substance': [
            'alcoholic', 'addiction', 'substance abuse', 'overdose'
        ],
        'mental_health_crisis': [
            'panic attack', 'mental breakdown', 'suicide hotline'
        ]
    }
    
    # Abuse pattern indicators (more subtle)
    ABUSE_PATTERNS = [
        r"don't tell anyone",
        r"no one will believe you",
        r"you're crazy",
        r"you're imagining things"
    ]
    
    def detect_safety_concerns(
        self,
        perspective_1: str,
        perspective_2: str
    ) -> Dict[str, any]:
        """
        Detect safety concerns in user perspectives.
        
        Args:
            perspective_1: First partner's perspective
            perspective_2: Second partner's perspective
            
        Returns:
            Dictionary with safety concern information:
            {
                "has_concerns": bool,
                "concern_types": List[str],
                "severity": str,  # "low", "medium", "high", "critical"
                "action": str,  # "show_crisis_resources", "block_mediation", etc.
                "message": str  # User-facing message
            }
        """
        
        concern_types = []
        severity_scores = {
            'violence': 4,  # Critical
            'abuse': 4,  # Critical
            'self_harm': 5,  # Critical
            'substance': 2,  # Medium
            'mental_health_crisis': 3  # High
        }
        
        # Check both perspectives
        all_text = f"{perspective_1} {perspective_2}".lower()
        
        import re
        # Check for keyword matches with word boundaries
        for concern_type, keywords in self.CRISIS_KEYWORDS.items():
            for keyword in keywords:
                if re.search(r'\b' + re.escape(keyword.lower()) + r'\b', all_text):
                    if concern_type not in concern_types:
                        concern_types.append(concern_type)
                    break  # Found one keyword for this type, move on
        
        # Check for abuse patterns (regex)
        for pattern in self.ABUSE_PATTERNS:
            if re.search(pattern, all_text, re.IGNORECASE):
                if 'abuse' not in concern_types:
                    concern_types.append('abuse')
                break
        
        # Determine severity
        if not concern_types:
            return {
                "has_concerns": False,
                "concern_types": [],
                "severity": "none",
                "action": "proceed",
                "message": None
            }
        
        # Calculate max severity
        max_severity_score = max(
            severity_scores.get(ct, 1) for ct in concern_types
        )
        
        if max_severity_score >= 4:
            severity = "critical"
            action = "block_mediation"
            message = (
                "We've detected language that suggests this situation may involve "
                "safety concerns. Heka is not equipped to handle situations involving "
                "violence, abuse, or crisis. Please seek immediate professional help."
            )
        elif max_severity_score == 3:
            severity = "high"
            action = "show_crisis_resources"
            message = (
                "We've detected language that suggests professional support may be helpful. "
                "While Heka can assist with communication, some situations benefit from "
                "professional guidance."
            )
        else:
            severity = "medium"
            action = "show_crisis_resources"
            message = (
                "If you're dealing with substance use or mental health concerns, "
                "consider consulting with a professional alongside using Heka."
            )
        
        return {
            "has_concerns": True,
            "concern_types": concern_types,
            "severity": severity,
            "action": action,
            "message": message
        }
    
    def should_block_mediation(self, safety_check: Dict) -> bool:
        """Determine if mediation should be blocked."""
        return safety_check.get("severity") == "critical"
    
    def get_crisis_resources(self) -> Dict[str, List[str]]:
        """Get crisis resources for Australia."""
        return {
            "emergency": [
                {
                    "name": "Emergency Services",
                    "number": "000",
                    "description": "Call 000 for immediate emergency assistance"
                }
            ],
            "crisis_support": [
                {
                    "name": "Lifeline",
                    "number": "13 11 14",
                    "description": "24/7 crisis support and suicide prevention"
                },
                {
                    "name": "Beyond Blue",
                    "number": "1300 22 4636",
                    "description": "Mental health support"
                },
                {
                    "name": "Relationships Australia",
                    "number": "1300 364 277",
                    "description": "Relationship counseling and support"
                }
            ],
            "domestic_violence": [
                {
                    "name": "1800RESPECT",
                    "number": "1800 737 732",
                    "description": "National sexual assault, domestic and family violence counseling"
                }
            ]
        }


# Singleton instance
safety_service = SafetyService()


