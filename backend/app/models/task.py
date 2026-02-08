from sqlalchemy import Column, String, DateTime, Enum, Integer, ForeignKey, Text, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Task(Base):
    __tablename__ = "tasks"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(
        Enum('todo', 'in_progress', 'done', name='task_status_enum'),
        default='todo'
    )
    priority = Column(
        Enum('low', 'medium', 'high', name='task_priority_enum'),
        default='medium'
    )
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    assigned_to = Column(String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    due_date = Column(DateTime, nullable=True)
    estimated_hours = Column(DECIMAL(5, 2), nullable=True)
    actual_hours = Column(DECIMAL(5, 2), nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="assigned_tasks")
