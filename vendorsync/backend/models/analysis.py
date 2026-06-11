from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class PainPoint(BaseModel):
    id: str = Field(default_factory=lambda: f"pp_{uuid.uuid4().hex[:6]}")
    title: str
    description: str
    raised_by: str  # distributor | vendor | both
    severity: str   # low | medium | high | critical
    category: str   # pricing | delivery | quality | communication | payment | other
    suggested_solution: str
    action_required: bool = True


class ActionItem(BaseModel):
    id: str = Field(default_factory=lambda: f"ai_{uuid.uuid4().hex[:6]}")
    task: str
    owner: str
    owner_role: str  # distributor | vendor
    deadline_mentioned: Optional[str] = None
    priority: str   # low | medium | high


class AnalysisResponse(BaseModel):
    id: str
    meeting_id: str
    generated_at: datetime
    model_used: str
    summary: str
    key_points: List[str]
    pain_points: List[dict]
    action_items: List[dict]
    decisions_made: List[str]
    agreements: List[str]
    follow_up_required: bool
    overall_sentiment: str
    distributor_sentiment: str
    vendor_sentiment: str
    meeting_effectiveness_score: float
    topics_discussed: List[str]
