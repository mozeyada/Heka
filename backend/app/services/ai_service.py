"""AI Mediation Service - OpenAI GPT-4 Integration"""

from typing import Dict, List, Optional
from openai import OpenAI
from app.config import settings
from app.db.database import get_database
from app.models.ai_insight import AIInsightInDB
from app.services.safety_service import safety_service
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
import json
import logging

logger = logging.getLogger(__name__)


class AIMediationService:
    """Service for AI-powered argument mediation."""
    
    def __init__(self):
        self.client = OpenAI(api_key=settings.OPENAI_API_KEY)
        self.model = settings.OPENAI_MODEL
    
    async def mediate_argument(
        self,
        argument_id: str,
        perspective_1: str,
        perspective_2: str,
        category: str,
        db: AsyncIOMotorDatabase
    ) -> Dict:
        """
        Generate AI mediation insights for an argument.
        
        Args:
            argument_id: ID of the argument
            perspective_1: First partner's perspective
            perspective_2: Second partner's perspective
            category: Argument category
            db: Database instance
            
        Returns:
            Dictionary with AI insights
        """
        
        try:
            # Check for safety concerns BEFORE processing
            safety_check = safety_service.detect_safety_concerns(
                perspective_1, perspective_2
            )
            
            # If critical safety concerns detected, block mediation
            if safety_service.should_block_mediation(safety_check):
                raise ValueError(
                    f"SAFETY_BLOCK: {safety_check.get('message', 'Safety concerns detected')}"
                )
            
            # Enhanced system prompt with relationship frameworks
            system_prompt = """You are Heka, a specialized AI relationship mediator trained in evidence-based conflict resolution techniques.

CORE COMPETENCIES:
You are trained in:
- **Gottman Method principles**: Understanding the Four Horsemen (criticism, contempt, defensiveness, stonewalling), identifying repair attempts, emotional attunement
- **Nonviolent Communication (NVC) framework**: Distinguishing observations from evaluations, feelings from thoughts, identifying underlying needs, framing requests vs. demands
- **Emotion-Focused Therapy (EFT)**: Identifying attachment fears, recognizing underlying emotions beneath anger, cycle de-escalation
- **Solution-focused brief therapy**: Focusing on strengths, exceptions, and future solutions rather than problems

ANALYSIS FRAMEWORK:
1. **Identify Communication Patterns**: Distinguish healthy vs. destructive patterns (Four Horsemen detection)
2. **Detect Emotional Subtext**: Look beneath surface disagreements to underlying emotions, needs, and fears
3. **Find Shared Values**: Identify not just surface agreements, but deeper shared values and goals
4. **Suggest Specific Behavioral Changes**: Provide concrete, actionable suggestions, not generic advice
5. **Prioritize Emotional Safety**: Ensure both partners feel heard, validated, and safe

SAFETY PROTOCOLS:
- If you detect abuse indicators, coercive control, violence threats, or self-harm mentions, IMMEDIATELY recommend professional help with specific resources
- Do NOT attempt to mediate situations involving safety concerns
- When safety concerns are present, prioritize safety over mediation

RESPONSE STYLE:
- Empathetic but direct
- Use "I notice..." statements for observations (NVC)
- Frame issues as "us vs. the problem" not "you vs. them"
- Provide 3-5 concrete, actionable suggestions (not generic advice)
- Include specific conversation scripts when helpful
- Acknowledge emotions while focusing on solutions

PROHIBITED:
- Never diagnose mental health conditions
- Never provide medical or therapeutic treatment
- Never take sides or judge either partner
- Never suggest leaving the relationship unless safety is at risk
- Never minimize serious concerns

Respond in JSON format with:
{
  "summary": "Brief 2-3 sentence overview in empathetic tone",
  "common_ground": ["point 1", "point 2", "point 3"],
  "disagreements": ["disagreement 1", "disagreement 2"],
  "root_causes": ["underlying cause 1", "underlying cause 2"],
  "suggestions": [
    {
      "title": "Specific suggestion title",
      "description": "Detailed explanation with rationale",
      "actionable_steps": ["step 1", "step 2", "step 3"]
    }
  ],
  "communication_tips": ["tip 1", "tip 2", "tip 3"]
}"""
            
            # Build user prompt with safety context if needed
            safety_context = ""
            if safety_check.get("has_concerns"):
                safety_context = f"\n\nSAFETY NOTE: Possible {', '.join(safety_check.get('concern_types', []))} mentioned. Prioritize safety and recommend professional help when appropriate."
            
            # User prompt with relationship framework guidance
            user_prompt = f"""Argument Context:
Category: {category}
{safety_context}

Partner 1 Perspective:
{perspective_1}

Partner 2 Perspective:
{perspective_2}

ANALYSIS REQUEST:
Using Gottman Method, NVC, and EFT frameworks, provide:

1. **Summary**: Brief empathetic overview identifying the core issue
2. **Common Ground**: Shared values, goals, or agreements (not just surface-level)
3. **Disagreements**: Key points where they differ (use NVC: observations, not evaluations)
4. **Root Causes**: Underlying needs, fears, or attachment issues (EFT perspective)
5. **Suggestions**: 3-5 specific, actionable solutions with:
   - Title (clear and specific)
   - Description (explain why this helps)
   - Actionable steps (concrete things to do)
6. **Communication Tips**: Specific phrases or approaches using NVC principles

Focus on:
- Identifying the Four Horsemen if present (criticism, contempt, defensiveness, stonewalling)
- Finding underlying needs beneath positions
- Suggesting repair attempts
- Framing as "us vs. the problem"

Respond in JSON format only."""
            
            # Call OpenAI API
            # JSON mode is only supported for certain models
            # Supported: gpt-4-turbo, gpt-4o, gpt-4o-mini, gpt-3.5-turbo (some versions)
            # Not supported: gpt-4 (base model)
            models_supporting_json = [
                "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-4-0125-preview",
                "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"
            ]
            
            use_json_mode = any(model_name in self.model.lower() for model_name in models_supporting_json)
            
            api_params = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
            }
            
            if use_json_mode:
                api_params["response_format"] = {"type": "json_object"}
            
            response = self.client.chat.completions.create(**api_params)
            
            # Parse response
            response_content = response.choices[0].message.content
            
            # Try to parse as JSON
            try:
                ai_response = json.loads(response_content)
            except json.JSONDecodeError:
                # If not JSON, try to extract JSON from the response
                logger.warning("Response not in JSON format, attempting to extract JSON...")
                # Look for JSON blocks in markdown or plain text
                import re
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    ai_response = json.loads(json_match.group())
                else:
                    # Fallback: try to structure the response manually
                    ai_response = self._parse_text_response(response_content)
            
            # Validate response quality
            if not self._validate_ai_response(ai_response):
                logger.warning(f"AI response quality check failed for argument {argument_id}")
                # Don't fail completely, but log the issue
            
            # Calculate cost
            input_tokens = response.usage.prompt_tokens
            output_tokens = response.usage.completion_tokens
            cost = self._calculate_cost(input_tokens, output_tokens)
            
            # Create AI insight document
            insight = AIInsightInDB(
                argument_id=argument_id,
                summary=ai_response.get("summary"),
                common_ground=ai_response.get("common_ground", []),
                disagreements=ai_response.get("disagreements", []),
                root_causes=ai_response.get("root_causes", []),
                suggestions=ai_response.get("suggestions", []),
                communication_tips=ai_response.get("communication_tips", []),
                full_response=ai_response,
                ai_model=self.model,
                cost=cost,
                tokens_used={
                    "input": input_tokens,
                    "output": output_tokens
                }
            )
            
            # Save to database
            result = await db.ai_insights.insert_one(insight.to_mongo())
            insight.id = str(result.inserted_id)
            
            logger.info(f"AI mediation completed for argument {argument_id}. Cost: ${cost:.4f}")
            
            return {
                "id": insight.id,
                "summary": insight.summary,
                "common_ground": insight.common_ground,
                "disagreements": insight.disagreements,
                "root_causes": insight.root_causes,
                "suggestions": insight.suggestions,
                "communication_tips": insight.communication_tips,
                "cost": cost,
                "model_used": self.model,
                "safety_check": safety_check if safety_check.get("has_concerns") else None
            }
            
        except Exception as e:
            logger.error(f"Error in AI mediation: {e}")
            raise Exception(f"AI mediation failed: {str(e)}")
    
    def _parse_text_response(self, text: str) -> dict:
        """Parse a text response and structure it into JSON format."""
        # Fallback parser for non-JSON responses
        # This is a basic implementation - can be improved
        return {
            "summary": text[:200] + "..." if len(text) > 200 else text,
            "common_ground": [],
            "disagreements": [],
            "root_causes": [],
            "suggestions": [],
            "communication_tips": []
        }
    
    def _validate_ai_response(self, response: dict) -> bool:
        """Validate AI response quality."""
        required_fields = [
            'summary', 'common_ground', 'disagreements',
            'root_causes', 'suggestions', 'communication_tips'
        ]
        
        # Check all fields present
        if not all(field in response for field in required_fields):
            logger.warning(f"Missing required fields in AI response: {[f for f in required_fields if f not in response]}")
            return False
        
        # Check minimum content quality
        if len(response.get('suggestions', [])) < 2:
            logger.warning("AI response has fewer than 2 suggestions")
            return False
        
        if not response.get('summary') or len(response['summary']) < 50:
            logger.warning("AI response summary is too short or missing")
            return False
        
        # Check for potentially harmful content
        harmful_keywords = ['leave them', 'divorce', 'break up', 'worthless', 'stupid', 'idiot']
        response_text = str(response).lower()
        if any(keyword in response_text for keyword in harmful_keywords):
            logger.warning("Potentially harmful content detected in AI response")
            # Don't block, but flag for review
        
        return True
    
    def _calculate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """Calculate API cost based on token usage."""
        # Updated pricing (as of 2024)
        if "gpt-4o-mini" in self.model.lower():
            # GPT-4o-mini: $0.15 per 1M input tokens, $0.60 per 1M output tokens
            input_cost = (input_tokens / 1_000_000) * 0.15
            output_cost = (output_tokens / 1_000_000) * 0.60
        elif "gpt-4o" in self.model.lower():
            # GPT-4o: $2.50 per 1M input tokens, $10.00 per 1M output tokens
            input_cost = (input_tokens / 1_000_000) * 2.50
            output_cost = (output_tokens / 1_000_000) * 10.00
        elif "gpt-3.5" in self.model.lower():
            # GPT-3.5-turbo: $0.50 per 1M input tokens, $1.50 per 1M output tokens
            input_cost = (input_tokens / 1_000_000) * 0.50
            output_cost = (output_tokens / 1_000_000) * 1.50
        else:
            # GPT-4 (base): $30 per 1M input tokens, $60 per 1M output tokens
            input_cost = (input_tokens / 1_000_000) * 30.00
            output_cost = (output_tokens / 1_000_000) * 60.00
        return input_cost + output_cost


# Singleton instance
ai_service = AIMediationService()

