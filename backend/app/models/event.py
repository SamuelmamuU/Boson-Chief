from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Event(Base):
    __tablename__ = "events"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    type = Column(
        Enum('meeting', 'milestone', 'decision', 'conflict', 'insight', 'update', 'alert', name='event_type_enum'),
        nullable=False
    )
    title = Column(String(255), nullable=False)
    description = Column(Text)
    ai_generated = Column(Boolean, default=False)
    event_metadata = Column(JSON, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="events")
