from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import Event, User
from ..schemas import EventResponse
from ..utils import get_current_user

router = APIRouter(prefix="/api/events", tags=["Events"])


@router.get("", response_model=List[EventResponse])
async def list_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(Event).order_by(Event.created_at.desc()).limit(50).all()
    return events
