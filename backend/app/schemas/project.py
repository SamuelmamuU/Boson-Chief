from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class HealthEnum(str, Enum):
    healthy = "healthy"
    at_risk = "at-risk"
    critical = "critical"
    blocked = "blocked"


class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


# Request schemas
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    priority: PriorityEnum = PriorityEnum.medium
    manager_id: str
    member_ids: Optional[List[str]] = None


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    health: Optional[HealthEnum] = None
    progress: Optional[int] = None
    priority: Optional[PriorityEnum] = None


# Response schemas
class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    health: str
    progress: int
    priority: str
    manager_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
