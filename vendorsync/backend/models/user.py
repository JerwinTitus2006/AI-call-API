from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    org_name: str
    role: str  # distributor | vendor | admin


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    org_name: str
    role: str
    avatar_initials: str
    created_at: datetime


class UserInDB(BaseModel):
    name: str
    email: str
    password: str
    org_name: str
    role: str
    avatar_initials: str
    meetings: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_login: Optional[datetime] = None
