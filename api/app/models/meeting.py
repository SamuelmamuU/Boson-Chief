import uuid
from sqlalchemy import Column, String, Text, Enum, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.database import Base

class MeetingType(str, enum.Enum):
    INTERNAL = "internal"
    EXTERNAL = "external"
    REVIEW = "review"
    STANDUP = "standup"

class ParticipantStatus(str, enum.Enum):
    PENDING = "pending"
    ACCEPTED = "accepted"
    DECLINED = "declined"
    TENTATIVE = "tentative"

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=True)
    created_by = Column(String(36), ForeignKey("users.id"), nullable=False)
    location = Column(String(255), nullable=True)
    meeting_type = Column(Enum(MeetingType), default=MeetingType.INTERNAL)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    project = relationship("Project", back_populates="meetings")
    creator = relationship("User", back_populates="meetings_created")
    participants = relationship("MeetingParticipant", back_populates="meeting", cascade="all, delete-orphan")

class MeetingParticipant(Base):
    __tablename__ = "meeting_participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    meeting_id = Column(String(36), ForeignKey("meetings.id", ondelete="CASCADE"), nullable=False)
    profile_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(Enum(ParticipantStatus), default=ParticipantStatus.PENDING)

    # Relationships
    meeting = relationship("Meeting", back_populates="participants")
    profile = relationship("User", back_populates="meeting_participations")
