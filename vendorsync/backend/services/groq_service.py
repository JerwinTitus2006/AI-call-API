import httpx
import json
import uuid
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

    try:
        prompt = ANALYSIS_PROMPT.format(
            transcript_text=transcript_text[:8000],
            participants_json=json.dumps(participants, default=str)
        )

        api_key = settings.GROQ_API_KEY.strip()
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        }

        if api_key.startswith("sk-or-"):
            url = "https://openrouter.ai/api/v1/chat/completions"
            model = "google/gemini-2.5-flash"
            headers["HTTP-Referer"] = "http://localhost:3000"
            headers["X-Title"] = "VendorSync"
        elif api_key.startswith("xai-"):
            url = "https://api.x.ai/v1/chat/completions"
            model = "grok-2-1212"
        else:
            url = "https://api.groq.com/openai/v1/chat/completions"
            model = "llama-3.3-70b-versatile"

        async with httpx.AsyncClient(timeout=45.0) as client:
            try:
                response = await client.post(
                    url,
                    headers=headers,
                    json={
                        "model": model,
                        "messages": [{"role": "user", "content": prompt}],
                        "temperature": 0.2,
                        "max_tokens": 2500,
                    },
                )
                
                # If using xAI and we get a 400 Bad Request or model not found, try fallback grok-beta model
                if api_key.startswith("xai-") and response.status_code == 400:
                    response = await client.post(
                        url,
                        headers=headers,
                        json={
                            "model": "grok-beta",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.2,
                            "max_tokens": 2500,
                        },
                    )
            except Exception as e:
                if api_key.startswith("xai-"):
                    # Try fallback just in case
                    response = await client.post(
                        url,
                        headers=headers,
                        json={
                            "model": "grok-beta",
                            "messages": [{"role": "user", "content": prompt}],
                            "temperature": 0.2,
                            "max_tokens": 2500,
                        },
                    )
                else:
                    raise e

            data = response.json()
            
            if response.status_code != 200:
                err_data = data.get('error', 'Unknown error')
                if isinstance(err_data, dict):
                    error_msg = err_data.get('message', 'Unknown error')
                else:
                    error_msg = str(err_data)
                raise Exception(f"API error ({response.status_code}): {error_msg}")

            content = data["choices"][0]["message"]["content"]

            content = content.strip()
            if content.startswith("```"):
                parts = content.split("```")
                if len(parts) >= 2:
                    content = parts[1]
                    if content.startswith("json"):
                        content = content[4:]

            result = json.loads(content.strip())
            
            # Ensure result has the expected lists
            if "pain_points" not in result or not isinstance(result["pain_points"], list):
                result["pain_points"] = []
            if "action_items" not in result or not isinstance(result["action_items"], list):
                result["action_items"] = []
                
            # Normalize pain_points
            for pp in result["pain_points"]:
                if not isinstance(pp, dict):
                    continue
                pp["id"] = f"pp_{uuid.uuid4().hex[:6]}"
                pp["title"] = pp.get("title", "Unnamed Issue").strip()
                pp["description"] = pp.get("description", "").strip()
                pp["severity"] = pp.get("severity", "medium").lower().strip()
                if pp["severity"] not in ["low", "medium", "high", "critical"]:
                    pp["severity"] = "medium"
                pp["category"] = pp.get("category", "other").lower().strip()
                pp["raised_by"] = pp.get("raised_by", "both").lower().strip()
                if pp["raised_by"] not in ["distributor", "vendor", "both"]:
                    pp["raised_by"] = "both"
                pp["suggested_solution"] = pp.get("suggested_solution", "").strip()
                pp["action_required"] = pp.get("action_required", True)

            # Normalize action_items
            for ai in result["action_items"]:
                if not isinstance(ai, dict):
                    continue
                ai["id"] = f"ai_{uuid.uuid4().hex[:6]}"
                ai["task"] = ai.get("task", "Unnamed Task").strip()
                ai["owner"] = ai.get("owner", "Unassigned").strip()
                ai["owner_role"] = ai.get("owner_role", "vendor").lower().strip()
                if ai["owner_role"] not in ["distributor", "vendor"]:
                    ai["owner_role"] = "vendor"
                ai["priority"] = ai.get("priority", "medium").lower().strip()
                if ai["priority"] not in ["low", "medium", "high"]:
                    ai["priority"] = "medium"
                ai["deadline_mentioned"] = ai.get("deadline_mentioned")
                
            return result
    except Exception as e:
        print(f"AI analysis failed with error: {e}. Falling back to rule-based analysis.")
        return generate_fallback_analysis(transcript_text, participants, error_message=str(e))


def generate_fallback_analysis(transcript_text: str, participants: list, error_message: str = None) -> dict:
    """Fallback analysis when Groq/xAI API key is not configured or fails."""
    words = transcript_text.split() if transcript_text else []
    
    if error_message:
        summary_text = (
            f"Meeting with {len(participants)} participant(s). The discussion covered various business topics. "
            f"Note: The AI analysis request failed with error: '{error_message}'. "
            f"Showing fallback rule-based analysis."
        )
        pain_point_title = "AI Analysis Request Failed"
        pain_point_desc = f"The AI analysis request failed with the following error: {error_message}. Please check your API key, credits/billing configuration, or connection settings."
        suggested_sol = "Check your API keys and service status. If using xAI, ensure your team has active credits/licenses."
    else:
        summary_text = (
            f"Meeting with {len(participants)} participant(s). The discussion covered various business topics. "
            f"Note: This analysis was generated without AI as no API key was configured."
        )
        pain_point_title = "API Key Not Configured"
        pain_point_desc = "The Groq/xAI API key has not been configured. Please add your API key to the .env file to enable AI-powered analysis."
        suggested_sol = "Visit console.groq.com or console.x.ai to get an API key and add it to your .env file."

    return {
        "summary": summary_text,
        "key_points": [
            "Meeting was conducted successfully",
            f"Total participants: {len(participants)}",
            f"Transcript contains {len(words)} words",
        ],
        "pain_points": [
            {
                "id": "pp_1",
                "title": pain_point_title,
                "description": pain_point_desc,
                "raised_by": "both",
                "severity": "medium",
                "category": "other",
                "suggested_solution": suggested_sol,
                "action_required": True,
            }
        ],
        "action_items": [
            {
                "id": "ai_1",
                "task": "Configure or troubleshoot API key for AI-powered meeting analysis",
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
