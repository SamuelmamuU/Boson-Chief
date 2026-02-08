from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class MeetingTypeEnum(str, Enum):
    internal = "internal"
    external = "external"
    review = "review"
    standup = "standup"


class ParticipantStatusEnum(str, Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    tentative = "tentative"


# Request schemas
class MeetingCreate(BaseModel):
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    project_id: str
    location: Optional[str] = None
    meeting_type: MeetingTypeEnum = MeetingTypeEnum.internal
    participant_ids: Optional[List[str]] = None


class MeetingUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    location: Optional[str] = None
    meeting_type: Optional[MeetingTypeEnum] = None
    participant_ids: Optional[List[str]] = None


# Response schemas
class ParticipantProfile(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None


class ParticipantResponse(BaseModel):
    id: str
    profile_id: str
    status: str
    profile: ParticipantProfile


class ProjectInfo(BaseModel):
    id: str
    name: str


class CreatorInfo(BaseModel):
    id: str
    full_name: str
    avatar_url: Optional[str] = None


class MeetingResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    start_time: datetime
    end_time: datetime
    project_id: str
    created_by: str
    location: Optional[str] = None
    meeting_type: str
    created_at: datetime
    updated_at: datetime
    project: Optional[ProjectInfo] = None
    creator: Optional[CreatorInfo] = None
    participants: Optional[List[ParticipantResponse]] = None

    class Config:
        from_attributes = True
