from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AvailabilityEnum(str, Enum):
    available = "available"
    busy = "busy"
    away = "away"
    offline = "offline"


class RoleEnum(str, Enum):
    manager = "manager"
    employee = "employee"


# Request schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    avatar_url: Optional[str] = None
    availability: Optional[AvailabilityEnum] = None
    cognitive_load: Optional[int] = None


# Response schemas
class UserResponse(BaseModel):
    id: str
    email: str
    full_name: str
    avatar_url: Optional[str] = None
    availability: AvailabilityEnum
    cognitive_load: int
    roles: List[str]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
