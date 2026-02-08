import uuid
from sqlalchemy import Column, String, Text, Enum, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class EventType(str, enum.Enum):
    MEETING = "meeting"
    MILESTONE = "milestone"
    DECISION = "decision"
    CONFLICT = "conflict"
    INSIGHT = "insight"
    UPDATE = "update"
    ALERT = "alert"

class Event(Base):
    __tablename__ = "events"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    type = Column(Enum(EventType), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    ai_generated = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    project = relationship("Project", back_populates="events")
