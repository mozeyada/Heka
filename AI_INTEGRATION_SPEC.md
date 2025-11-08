# AI Integration Specification - Heka

## Overview

**Primary AI Model:** OpenAI GPT-4 (MVP/Beta)  
**Secondary Testing:** Google Gemini 2.5 Flash (beta phase)  
**Integration:** FastAPI backend service  
**Cost Monitoring:** Critical for scalability

---

## OpenAI GPT-4 Integration

### API Setup

**Library:** `openai` Python package  
**Version:** Latest stable  
**Authentication:** Environment variable `OPENAI_API_KEY`

```python
import openai
from openai import OpenAI

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
```

### Model Configuration

**Model:** `gpt-4` or `gpt-4-turbo-preview` (for cost optimization)

**Parameters:**
- `temperature`: 0.7 (balanced creativity/consistency)
- `max_tokens`: 2000 (sufficient for detailed insights)
- `top_p`: 0.9 (nucleus sampling)

---

## Mediation Prompt Engineering

### System Prompt (Role Definition)

```
You are a neutral, empathetic AI mediator helping couples resolve arguments and disagreements. 

Your role:
- Analyze both partners' perspectives fairly and without bias
- Identify underlying issues, not just surface disagreements
- Find common ground and points of agreement
- Suggest constructive solutions and compromises
- Use empathetic, non-judgmental language
- Focus on healthy communication and mutual understanding

Guidelines:
- Do NOT take sides or favor one partner over another
- Do NOT provide medical or therapeutic advice
- DO suggest when professional help may be beneficial
- DO frame issues constructively and solution-focused
- DO acknowledge emotions while focusing on resolution

Always maintain neutrality and aim to help the couple understand each other better.
```

### User Prompt Structure

```
Argument Context:
Category: {category}
Created: {date}

Partner 1 Perspective:
{perspective_1}

Partner 2 Perspective:
{perspective_2}

Please provide a mediation analysis including:
1. A brief summary of the disagreement
2. Common ground you identified
3. Key points of disagreement
4. Root cause analysis (what's really behind this argument?)
5. Suggested solutions (3-5 actionable recommendations)
6. Communication strategies (how they can discuss this better)
```

### Output Format

**Structured JSON Response:**
```json
{
  "summary": "Brief overview of the argument",
  "common_ground": [
    "Point 1 where they agree",
    "Point 2 where they agree"
  ],
  "disagreements": [
    "Key disagreement 1",
    "Key disagreement 2"
  ],
  "root_causes": [
    "Underlying issue 1 (e.g., communication patterns)",
    "Underlying issue 2 (e.g., unmet needs)"
  ],
  "suggestions": [
    {
      "title": "Suggestion 1",
      "description": "Detailed explanation",
      "actionable_steps": ["Step 1", "Step 2"]
    }
  ],
  "communication_tips": [
    "Tip 1 for better communication",
    "Tip 2 for active listening"
  ],
  "professional_help_indicator": false
}
```

---

## Implementation Details

### Service Class Structure

```python
class AIMediationService:
    def __init__(self):
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = "gpt-4"
        
    async def mediate_argument(self, 
                              perspective_1: str,
                              perspective_2: str,
                              category: str,
                              argument_id: str) -> Dict:
        """
        Main mediation function.
        
        Returns structured insights dict.
        """
        
    async def generate_insights(self, 
                               argument_data: Dict) -> Dict:
        """
        Generate relationship insights from argument patterns.
        """
        
    def estimate_cost(self, input_tokens: int, output_tokens: int) -> float:
        """
        Estimate API cost for request.
        """
```

### Error Handling

**Retry Logic:**
- 3 retries with exponential backoff
- Handle rate limits gracefully
- Fallback to cached response if available

**Error Types:**
- `RateLimitError`: Wait and retry
- `APIError`: Log and notify admin
- `TimeoutError`: Retry once, then fail gracefully

### Caching Strategy

**Redis Cache:**
- Cache successful responses by argument_id
- TTL: 24 hours
- Key: `ai_insight:{argument_id}`

**Benefits:**
- Reduce API calls (cost savings)
- Faster response times
- Handle duplicate requests

---

## Cost Monitoring

### Cost Tracking

**Per Request:**
```python
def calculate_cost(input_tokens: int, output_tokens: int) -> float:
    input_cost = (input_tokens / 1_000_000) * 2.50  # GPT-4 input
    output_cost = (output_tokens / 1_000_000) * 10.00  # GPT-4 output
    return input_cost + output_cost
```

**Monthly Tracking:**
- Store costs in database (cost_tracking table)
- Alert if monthly cost exceeds budget ($500/month during beta)
- Daily cost summaries

### Cost Optimization

1. **Prompt Optimization:**
   - Minimize token usage in prompts
   - Use concise, structured format
   - Remove unnecessary context

2. **Response Optimization:**
   - Set max_tokens appropriately
   - Use streaming for long responses (optional)

3. **Caching:**
   - Cache insights to avoid duplicate API calls
   - Cache common patterns

---

## Gemini 2.5 Flash Integration (Beta Testing)

### Parallel Testing Strategy

**Implementation:**
1. Run both GPT-4 and Gemini for same argument (anonymous)
2. Compare quality metrics:
   - User satisfaction scores
   - Insight quality ratings
   - Response time
   - Cost per request
3. Collect user feedback (A/B test)
4. Make scaling decision based on data

### Gemini Integration

```python
import google.generativeai as genai

class GeminiMediationService:
    def __init__(self):
        genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        
    async def mediate_argument(self, 
                              perspective_1: str,
                              perspective_2: str) -> Dict:
        # Similar structure to GPT-4 service
```

### Comparison Metrics

**Track:**
- Response quality (user ratings)
- Token usage (cost)
- Response time
- Error rates
- User satisfaction

---

## Quality Assurance

### Testing Strategy

**Unit Tests:**
- Prompt generation
- Response parsing
- Error handling
- Cost calculation

**Integration Tests:**
- End-to-end mediation flow
- API error scenarios
- Rate limit handling

**Quality Tests:**
- Test with sample arguments (various categories)
- Validate response structure
- Check for bias (neutrality)
- Verify helpfulness

### Quality Monitoring

**Metrics:**
- User feedback (thumbs up/down on insights)
- "Helpful" rating (1-5 stars)
- Resolution success rate (user-reported)
- A/B test results (GPT-4 vs Gemini)

**Alerts:**
- If quality drops below threshold (4/5 rating)
- If error rate exceeds 5%
- If cost per request spikes

---

## Security & Privacy

### Data Handling

**Input:**
- User perspectives contain sensitive relationship data
- Encrypt in transit (HTTPS)
- Encrypt at rest (database)
- Don't log full content in production

**OpenAI Data Policy:**
- Review OpenAI data usage policy
- Consider data privacy settings
- Optional: Use API with data privacy options

### API Key Security

- Store in environment variables (never commit)
- Rotate keys regularly
- Use secret management service (AWS Secrets Manager, etc.)

---

## Response Time Targets

**Performance Goals:**
- Target: < 5 seconds for AI response
- Acceptable: < 10 seconds
- Timeout: 30 seconds

**Optimization:**
- Streaming responses (show partial results)
- Async processing
- Caching
- Connection pooling

---

## Future Enhancements

### Post-MVP Improvements

1. **Fine-tuning:**
   - Fine-tune model on relationship mediation data
   - Custom model for Heka-specific use cases

2. **Multi-turn Conversation:**
   - Allow follow-up questions
   - Context-aware responses

3. **Personalization:**
   - Adapt to couple's communication style
   - Learn from past resolutions

4. **Advanced Analysis:**
   - Pattern recognition across multiple arguments
   - Predictive insights
   - Relationship health scoring

---

## Implementation Checklist

### Sprint 3 (AI Integration)

- [ ] OpenAI API client setup
- [ ] System prompt finalized
- [ ] User prompt template created
- [ ] Response parsing (JSON structure)
- [ ] Error handling and retries
- [ ] Cost tracking implementation
- [ ] Caching (Redis integration)
- [ ] Frontend integration
- [ ] Quality testing with sample arguments
- [ ] Performance optimization

### Beta Testing Phase

- [ ] Gemini 2.5 Flash integration
- [ ] Parallel testing setup
- [ ] A/B test framework
- [ ] Quality comparison metrics
- [ ] User feedback collection
- [ ] Cost analysis (GPT-4 vs Gemini)
- [ ] Scaling decision based on data

---

## Example Usage

```python
# Backend service
from app.services.ai_service import AIMediationService

ai_service = AIMediationService()

# Mediate argument
insights = await ai_service.mediate_argument(
    perspective_1="I feel like we never spend quality time together...",
    perspective_2="I'm always working to provide for us, I don't have time...",
    category="communication",
    argument_id="arg_123"
)

# Store insights
await save_ai_insights(argument_id="arg_123", insights=insights)

# Return to frontend
return insights
```

---

**Status:** Specification complete, ready for Sprint 3 implementation  
**Next:** Begin implementation in Sprint 3 (Weeks 6-8)

