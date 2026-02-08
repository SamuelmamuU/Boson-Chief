from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.models.event import Event
from app.models.user import User
from app.database import get_db
from app.schemas.event import events_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/events", tags=["events"])

def serialize_event(event: Event) -> dict:
    return {
        "id": str(event.id),
        "project_id": str(event.project_id),
        "type": event.type.value if event.type else "update",
        "title": event.title,
        "description": event.description,
        "ai_generated": event.ai_generated or False,
        "created_at": event.created_at
    }

@router.get("")
def list_events(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(Event).all()
    return events_schema.dump([serialize_event(e) for e in events])
