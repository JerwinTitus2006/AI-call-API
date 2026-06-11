from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
import uuid


class TranscriptSegment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    speaker_name: str
    speaker_role: str  # distributor | vendor
    text: str
    start_time: float
    end_time: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    is_final: bool = True


class TranscriptCreate(BaseModel):
    meeting_id: str
    segments: List[TranscriptSegment] = []
    full_text: str = ""
    word_count: int = 0


class TranscriptSegmentAdd(BaseModel):
    speaker_name: str
    speaker_role: str
    text: str
    start_time: float
    end_time: float
    is_final: bool = True


class TranscriptResponse(BaseModel):
    id: str
    meeting_id: str
    segments: List[dict]
    full_text: str
    word_count: int
    created_at: datetime
    updated_at: datetime
