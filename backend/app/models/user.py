from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    avatar_url = Column(String(500), nullable=True)
    availability = Column(
        Enum('available', 'busy', 'away', 'offline', name='availability_enum'),
        default='available'
    )
    cognitive_load = Column(Integer, default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    roles = relationship("UserRole", back_populates="user", cascade="all, delete-orphan")
    managed_projects = relationship("Project", back_populates="manager")
    project_memberships = relationship("ProjectMember", back_populates="user")
    assigned_tasks = relationship("Task", back_populates="assignee")
    created_meetings = relationship("Meeting", back_populates="creator")


class UserRole(Base):
    __tablename__ = "user_roles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = Column(Enum('manager', 'employee', name='role_enum'), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="roles")
