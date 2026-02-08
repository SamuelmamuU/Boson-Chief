import uuid
from sqlalchemy import Column, String, Enum, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    EMPLOYEE = "employee"

class Availability(str, enum.Enum):
    AVAILABLE = "available"
    BUSY = "busy"
    AWAY = "away"
    OFFLINE = "offline"

class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    # Use values_callable to match lowercase DB values
    availability = Column(
        Enum(Availability, values_callable=lambda x: [e.value for e in x]),
        default=Availability.AVAILABLE
    )
    cognitive_load = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    roles = relationship("UserRoleAssignment", back_populates="user", cascade="all, delete-orphan")
    projects_managed = relationship("Project", back_populates="manager")
    tasks_assigned = relationship("Task", back_populates="assignee")
    meetings_created = relationship("Meeting", back_populates="creator")
    meeting_participations = relationship("MeetingParticipant", back_populates="profile")
    capacity_allocations = relationship("CapacityAllocation", back_populates="profile")

class UserRoleAssignment(Base):
    __tablename__ = "user_roles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum(UserRole), nullable=False)

    user = relationship("User", back_populates="roles")