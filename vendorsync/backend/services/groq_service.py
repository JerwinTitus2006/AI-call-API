import httpx
import json
from config import settings

ANALYSIS_PROMPT = """
You are an expert business analyst specializing in distributor-vendor relationships.
Analyze the following meeting transcript between a distributor and vendor.

Return ONLY a valid JSON object with this exact structure (no markdown, no explanation):
{{
  "summary": "3-5 sentence overview of the meeting",
  "key_points": ["point 1", "point 2"],
  "pain_points": [
    {{
      "id": "pp_1",
      "title": "Short title",
      "description": "Detailed description",
      "raised_by": "distributor",
      "severity": "high",
      "category": "delivery",
      "suggested_solution": "Actionable solution recommendation",
      "action_required": true
    }}
  ],
  "action_items": [
    {{
      "id": "ai_1",
      "task": "Specific task description",
      "owner": "Person name or role",
      "owner_role": "distributor",
      "deadline_mentioned": null,
      "priority": "high"
    }}
  ],
  "decisions_made": ["decision 1"],
  "agreements": ["agreement 1"],
  "follow_up_required": true,
  "overall_sentiment": "neutral",
  "distributor_sentiment": "neutral",
  "vendor_sentiment": "positive",
  "meeting_effectiveness_score": 7,
  "topics_discussed": ["topic1", "topic2"]
}}

TRANSCRIPT:
{transcript_text}

PARTICIPANTS:
{participants_json}
"""


async def analyze_meeting(transcript_text: str, participants: list) -> dict:
    if not settings.GROQ_API_KEY or settings.GROQ_API_KEY == "your_groq_api_key_here":
        return generate_fallback_analysis(transcript_text, participants)

    prompt = ANALYSIS_PROMPT.format(
        transcript_text=transcript_text[:8000],
        participants_json=json.dumps(participants, default=str)
    )

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.GROQ_API_KEY}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "messages": [{"role": "user", "content": prompt}],
                "temperature": 0.3,
                "max_tokens": 2000,
            },
        )

        data = response.json()
        
        if response.status_code != 200:
            raise Exception(f"Groq API error: {data.get('error', {}).get('message', 'Unknown error')}")

        content = data["choices"][0]["message"]["content"]

        content = content.strip()
        if content.startswith("```"):
            parts = content.split("```")
            if len(parts) >= 2:
                content = parts[1]
                if content.startswith("json"):
                    content = content[4:]

        return json.loads(content.strip())


def generate_fallback_analysis(transcript_text: str, participants: list) -> dict:
    """Fallback analysis when Groq API key is not configured."""
    words = transcript_text.split() if transcript_text else []
    participant_names = [p.get("name", "Participant") for p in participants]
    
    return {
        "summary": f"Meeting with {len(participants)} participant(s). The discussion covered various business topics. {len(words)} words were recorded in the transcript. This analysis was generated without AI as no API key was configured.",
        "key_points": [
            "Meeting was conducted successfully",
            f"Total participants: {len(participants)}",
            f"Transcript contains {len(words)} words",
        ],
        "pain_points": [
            {
                "id": "pp_1",
                "title": "API Key Not Configured",
                "description": "The Groq API key has not been configured. Please add your GROQ_API_KEY to the .env file to enable AI-powered analysis.",
                "raised_by": "both",
                "severity": "medium",
                "category": "other",
                "suggested_solution": "Visit console.groq.com to get a free API key and add it to your .env file.",
                "action_required": True,
            }
        ],
        "action_items": [
            {
                "id": "ai_1",
                "task": "Configure Groq API key for AI-powered meeting analysis",
                "owner": "Admin",
                "owner_role": "vendor",
                "deadline_mentioned": None,
                "priority": "high",
            }
        ],
        "decisions_made": ["Meeting completed successfully"],
        "agreements": ["Follow-up actions to be determined"],
        "follow_up_required": True,
        "overall_sentiment": "neutral",
        "distributor_sentiment": "neutral",
        "vendor_sentiment": "neutral",
        "meeting_effectiveness_score": 6,
        "topics_discussed": ["Business Discussion", "Meeting Overview"],
    }
