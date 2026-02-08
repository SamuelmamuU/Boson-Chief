from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class TaskStatusEnum(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class TaskPriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


# Request schemas
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = None
    status: TaskStatusEnum = TaskStatusEnum.todo
    priority: TaskPriorityEnum = TaskPriorityEnum.medium
    project_id: str
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatusEnum] = None
    priority: Optional[TaskPriorityEnum] = None
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None


# Response schemas
class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str] = None
    status: str
    priority: str
    project_id: str
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[float] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
