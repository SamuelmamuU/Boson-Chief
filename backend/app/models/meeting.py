from sqlalchemy import Column, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from ..database import Base


class Meeting(Base):
    __tablename__ = "meetings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime, nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    location = Column(String(255))
    meeting_type = Column(
        Enum('internal', 'external', 'review', 'standup', name='meeting_type_enum'),
        default='internal'
    )
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="meetings")
    creator = relationship("User", back_populates="created_meetings")
    participants = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")


class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(
        Enum('pending', 'accepted', 'declined', 'tentative', name='participant_status_enum'),
        default='pending'
    )
    responded_at = Column(DateTime, nullable=True)
    
    # Relationships
    meeting = relationship("Meeting", back_populates="participants")
    profile = relationship("User")
