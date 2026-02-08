from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class EventTypeEnum(str, Enum):
    meeting = "meeting"
    milestone = "milestone"
    decision = "decision"
    conflict = "conflict"
    insight = "insight"
    update = "update"
    alert = "alert"


class EventResponse(BaseModel):
    id: str
    project_id: str
    type: str
    title: str
    description: Optional[str] = None
    ai_generated: bool
    created_at: datetime

    class Config:
        from_attributes = True
