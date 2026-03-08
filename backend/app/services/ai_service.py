"""AI Mediation Service - OpenAI GPT-4 Integration"""

import json
import logging
import re
from typing import Dict, List, Optional

import httpx
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.config import settings
from app.models.ai_insight import AIInsightInDB
from app.services.safety_service import safety_service

logger = logging.getLogger(__name__)

MODELS_SUPPORTING_JSON = [
    "gpt-4-turbo", "gpt-4-turbo-preview", "gpt-4-0125-preview",
    "gpt-4o", "gpt-4o-mini", "gpt-3.5-turbo"
]


class AIMediationService:
    """Service for AI-powered argument mediation."""

    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.model = settings.OPENAI_MODEL
        self.api_url = "https://api.openai.com/v1/chat/completions"

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
            # Call OpenAI directly via httpx (no SDK — avoids Pydantic compat issues)
            use_json_mode = any(m in self.model.lower() for m in MODELS_SUPPORTING_JSON)

            payload: Dict = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 2000,
            }
            if use_json_mode:
                payload["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=90.0) as client:
                resp = await client.post(
                    self.api_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    }
                )
                resp.raise_for_status()
                response_content = resp.json()["choices"][0]["message"]["content"]

            # Try to parse as JSON
            try:
                ai_response = json.loads(response_content)
            except json.JSONDecodeError:
                # If not JSON, try to extract JSON from the response
                logger.warning("Response not in JSON format, attempting to extract JSON...")
                json_match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if json_match:
                    ai_response = json.loads(json_match.group())
                else:
                    ai_response = self._parse_text_response(response_content)
            
            # Validate response quality
            if not self._validate_ai_response(ai_response):
                logger.warning(f"AI response quality check failed for argument {argument_id}")
                # Don't fail completely, but log the issue
            
            # Cost tracking not available without SDK — set to 0
            input_tokens = 0
            output_tokens = 0
            cost = 0.0
            
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

    async def generate_goal_suggestions(self, arguments: List[Dict], db: AsyncIOMotorDatabase) -> (List[Dict], List[str]):
        """
        Generate relationship goal suggestions based on recent arguments.
        """
        insights = await self._get_insights_for_arguments(arguments, db)
        if not insights:
            return [], []

        system_prompt = """You are Heka, an AI relationship coach. Based on the provided argument summaries and root causes, generate 3-5 actionable and positive relationship goals.

RESPONSE STYLE:
- Focus on building positive behaviors.
- Frame goals collaboratively ("We will...", "Let's practice...").
- Ensure goals are specific, measurable, achievable, relevant, and time-bound (SMART), where applicable.

Respond in JSON format with:
{
  "goals": [
    {
      "title": "Specific goal title (e.g., 'Practice Active Listening')",
      "description": "Detailed explanation of the goal and why it's important for the couple's specific issues.",
      "category": "Communication"
    }
  ]
}"""
        user_prompt = f"""Based on these argument insights, suggest 3-5 relationship goals:

{json.dumps(insights, indent=2)}

Generate goals in the specified JSON format."""

        response_json = await self._call_openai(system_prompt, user_prompt)
        
        linked_ids = [str(arg["_id"]) for arg in arguments]
        return response_json.get("goals", []), linked_ids

    async def generate_checkin_questions(self, arguments: List[Dict], db: AsyncIOMotorDatabase) -> (List[Dict], List[str]):
        """
        Generate weekly check-in questions based on recent arguments.
        """
        insights = await self._get_insights_for_arguments(arguments, db)
        if not insights:
            return [], []

        system_prompt = """You are Heka, an AI relationship coach. Based on the provided argument summaries and root causes, generate 3-5 open-ended check-in questions for a weekly review.

RESPONSE STYLE:
- Questions should be gentle and non-accusatory.
- Encourage reflection on recent interactions.
- Focus on feelings, needs, and collaborative solutions.
- Frame questions to open up dialogue, not shut it down.

Respond in JSON format with:
{
  "questions": [
    {
      "question": "A specific, open-ended question (e.g., 'When did you feel most connected this week, and what were we doing?')",
      "category": "Emotional Connection"
    }
  ]
}"""
        user_prompt = f"""Based on these argument insights, suggest 3-5 weekly check-in questions:

{json.dumps(insights, indent=2)}

Generate questions in the specified JSON format."""

        response_json = await self._call_openai(system_prompt, user_prompt)
        
        linked_ids = [str(arg["_id"]) for arg in arguments]
        return response_json.get("questions", []), linked_ids

    async def _get_insights_for_arguments(self, arguments: List[Dict], db: AsyncIOMotorDatabase) -> List[Dict]:
        """Helper to fetch AI insights for a list of arguments."""
        if not arguments:
            return []
        
        # Convert argument _id to ObjectId for query
        argument_oids = []
        arg_id_map = {}  # Map ObjectId -> original _id string
        for arg in arguments:
            raw_id = arg.get("_id") or arg.get("id")
            if not raw_id:
                logger.warning(f"Argument missing _id/id field, keys: {list(arg.keys())}")
                continue
            arg_oid = raw_id if isinstance(raw_id, ObjectId) else ObjectId(str(raw_id))
            argument_oids.append(arg_oid)
            arg_id_map[str(arg_oid)] = arg
        
        # Query insights
        insights_cursor = db.ai_insights.find({"argument_id": {"$in": argument_oids}})
        insights_list = await insights_cursor.to_list(length=len(argument_oids))
        
        # Create a map of argument_id (as string) to insight
        insights_map = {}
        for insight in insights_list:
            # argument_id in insights is stored as ObjectId
            insight_arg_id = insight.get("argument_id")
            if isinstance(insight_arg_id, ObjectId):
                insights_map[str(insight_arg_id)] = insight
            else:
                insights_map[str(insight_arg_id)] = insight
        
        # Return a simplified version for the prompt, including arguments without insights
        result = []
        for arg_oid in argument_oids:
            arg_id_str = str(arg_oid)
            arg = arg_id_map[arg_id_str]
            insight = insights_map.get(arg_id_str)
            
            if insight:
                result.append({
                    "argument_title": arg.get("title", "N/A"),
                    "category": arg.get("category", "N/A"),
                    "summary": insight.get("summary"),
                    "root_causes": insight.get("root_causes", []),
                })
            else:
                # If no insight, still include the argument with basic info
                result.append({
                    "argument_title": arg.get("title", "N/A"),
                    "category": arg.get("category", "N/A"),
                    "summary": f"Recent argument about {arg.get('title', 'relationship issues')}",
                    "root_causes": [],
                })
        
        return result

    async def _call_openai(self, system_prompt: str, user_prompt: str) -> Dict:
        """Make a direct httpx call to OpenAI — bypasses SDK Pydantic serialization issues."""
        try:
            use_json_mode = any(m in self.model.lower() for m in MODELS_SUPPORTING_JSON)

            payload: Dict = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 1500,
            }
            if use_json_mode:
                payload["response_format"] = {"type": "json_object"}

            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    self.api_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    }
                )
                resp.raise_for_status()
                response_content = resp.json()["choices"][0]["message"]["content"]

            try:
                return json.loads(response_content)
            except json.JSONDecodeError:
                match = re.search(r'\{.*\}', response_content, re.DOTALL)
                if match:
                    return json.loads(match.group())
                return {}
        except Exception as e:
            logger.error(f"Error calling OpenAI: {e}", exc_info=True)
            return {}

    async def generate_harmony_report(self, checkin_id: str, db, user1_responses: dict, user2_responses: dict) -> Optional[str]:
        """
        Generate a weekly harmony report based on both partners' check-in responses.
        This runs in the background.
        """
        try:
            # We don't enforce JSON mode here because we want a formatted markdown string
            system_prompt = """You are Heka, an expert relationship coach.
            You are analyzing a couple's weekly check-in responses.
            Your job is to read both sets of answers and provide a 'Harmony Report'.
            
            Format your response in beautiful, encouraging Markdown. Include:
            1. A brief overview of where they align or differ this week.
            2. Highlighting one specific positive thing you noticed from their answers.
            3. One concrete, easy 'micro-exercise' for them to try this week based on their answers.
            
            Keep the tone warm, insightful, and entirely objective (do not take sides).
            Maximum length: 2 short paragraphs."""

            user_prompt = f"""
            Partner A answered:
            {json.dumps(user1_responses, indent=2)}
            
            Partner B answered:
            {json.dumps(user2_responses, indent=2)}
            """

            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": user_prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 800
            }

            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.post(
                    self.api_url,
                    json=payload,
                    headers={
                        "Authorization": f"Bearer {self.api_key}",
                        "Content-Type": "application/json",
                    }
                )
                resp.raise_for_status()
                report_text = resp.json()["choices"][0]["message"]["content"]
                
                # Update the database
                from bson import ObjectId
                await db.relationship_checkins.update_one(
                    {"_id": ObjectId(checkin_id)},
                    {"$set": {"ai_harmony_report": report_text.strip()}}
                )
                return report_text.strip()
                
        except Exception as e:
            logger.error(f"Failed to generate harmony report: {e}", exc_info=True)
            return None


# Singleton instance
ai_service = AIMediationService()

