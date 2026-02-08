from sqlalchemy import Column, String, DateTime, ForeignKey, Date, DECIMAL
from sqlalchemy.sql import func
import uuid
from ..database import Base


class CapacityAllocation(Base):
    __tablename__ = "capacity_allocations"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    profile_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    project_id = Column(String(36), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    week_start = Column(Date, nullable=False)
    hours_allocated = Column(DECIMAL(5, 2), default=0)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
