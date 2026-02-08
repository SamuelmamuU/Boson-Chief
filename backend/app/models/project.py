from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    description = Column(Text)
    health = Column(
        Enum('healthy', 'at-risk', 'critical', 'blocked', name='health_enum'),
        default='healthy'
    )
    progress = Column(Integer, default=0)
    priority = Column(
        Enum('low', 'medium', 'high', 'critical', name='priority_enum'),
        default='medium'
    )
    manager_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    manager = relationship("User", back_populates="managed_projects")
    members = relationship("ProjectMember", back_populates="project", cascade="all, delete-orphan")
    tasks = relationship("Task", back_populates="project", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="project", cascade="all, delete-orphan")
    meetings = relationship("Meeting", back_populates="project", cascade="all, delete-orphan")


class ProjectMember(Base):
    __tablename__ = "project_members"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum('owner', 'member', 'viewer', name='member_role_enum'), default='member')
    joined_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="members")
    user = relationship("User", back_populates="project_memberships")
