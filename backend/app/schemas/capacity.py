from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime


class CapacityAllocationCreate(BaseModel):
    profile_id: str
    project_id: str
    week_start: date
    hours_allocated: float


class CapacityAllocationUpdate(BaseModel):
    hours_allocated: float


class CapacityAllocationResponse(BaseModel):
    id: str
    profile_id: str
    project_id: str
    week_start: date
    hours_allocated: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
