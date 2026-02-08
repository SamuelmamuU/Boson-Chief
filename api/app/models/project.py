import uuid
from sqlalchemy import Column, String, Text, Enum, Integer, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class ProjectHealth(str, enum.Enum):
    HEALTHY = "healthy"
    AT_RISK = "at-risk"
    CRITICAL = "critical"
    BLOCKED = "blocked"

class Priority(str, enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

# Many-to-many for project members
project_members = Table(
    "project_members",
    Base.metadata,
    Column("project_id", String(36), ForeignKey("projects.id", ondelete="CASCADE"), primary_key=True),
    Column("user_id", String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
)

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    health = Column(Enum(ProjectHealth), default=ProjectHealth.HEALTHY)
    progress = Column(Integer, default=0)
    priority = Column(Enum(Priority), default=Priority.MEDIUM)
    manager_id = Column(String(36), ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    manager = relationship("User", back_populates="projects_managed")
    members = relationship("User", secondary=project_members, backref="projects")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="project", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete-orphan")
    capacity_allocations = relationship("CapacityAllocation", back_populates="project", cascade="all, delete-orphan")