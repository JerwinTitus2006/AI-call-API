from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class Participant(BaseModel):
    user_id: Optional[str] = None
    name: str
    role: str  # distributor | vendor
    joined_at: datetime = Field(default_factory=datetime.utcnow)
    left_at: Optional[datetime] = None
    is_guest: bool = False


class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    scheduled_at: Optional[datetime] = None
    host_role: str = "distributor"  # role of the creator in this meeting


class MeetingResponse(BaseModel):
    id: str
    title: str
    description: str
    created_by: str
    host_name: str
    scheduled_at: Optional[datetime]
    started_at: Optional[datetime]
    ended_at: Optional[datetime]
    duration_seconds: Optional[int]
    status: str
    invite_link: str
    participants: List[Participant]
    has_recording: bool
    has_analysis: bool
    created_at: datetime


class MeetingInDB(BaseModel):
    title: str
    description: str = ""
    created_by: str
    host_name: str
    scheduled_at: Optional[datetime] = None
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    duration_seconds: Optional[int] = None
    status: str = "scheduled"
    invite_link: str = ""
    participants: List[dict] = []
    audio_file_id: Optional[str] = None
    video_file_id: Optional[str] = None
    has_recording: bool = False
    has_analysis: bool = False
    created_at: datetime = Field(default_factory=datetime.utcnow)


class JoinMeetingRequest(BaseModel):
    name: str
    role: str
    user_id: Optional[str] = None
    is_guest: bool = True


class StatusUpdate(BaseModel):
    status: str
