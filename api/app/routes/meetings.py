from fastapi import APIRouter, HTTPException, Depends, Response, Query
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from datetime import datetime
from typing import Optional
from app.models.meeting import Meeting, MeetingParticipant
from app.models.user import User
from app.database import get_db
from app.schemas.meeting import create_meeting_schema, update_meeting_schema, meeting_schema, meetings_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/meetings", tags=["meetings"])

def serialize_meeting(meeting: Meeting) -> dict:
    return {
        "id": str(meeting.id),
        "title": meeting.title,
        "description": meeting.description,
        "start_time": meeting.start_time,
        "end_time": meeting.end_time,
        "project_id": str(meeting.project_id) if meeting.project_id else None,
        "created_by": str(meeting.created_by),
        "location": meeting.location,
        "meeting_type": meeting.meeting_type.value if meeting.meeting_type else "internal",
        "created_at": meeting.created_at,
        "updated_at": meeting.updated_at,
        "project": {
            "id": str(meeting.project.id),
            "name": meeting.project.name
        } if meeting.project else None,
        "creator": {
            "id": str(meeting.creator.id),
            "full_name": meeting.creator.full_name,
            "avatar_url": meeting.creator.avatar_url
        } if meeting.creator else None,
        "participants": [
            {
                "id": str(p.id),
                "profile_id": str(p.profile_id),
                "status": p.status.value if p.status else "pending",
                "profile": {
                    "id": str(p.profile.id),
                    "full_name": p.profile.full_name,
                    "avatar_url": p.profile.avatar_url
                } if p.profile else None
            }
            for p in meeting.participants
        ]
    }

@router.get("")
def list_meetings(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Meeting)
    
    if start_date:
        start_dt = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
        query = query.filter(Meeting.start_time >= start_dt)
    
    if end_date:
        end_dt = datetime.fromisoformat(end_date.replace('Z', '+00:00'))
        query = query.filter(Meeting.end_time <= end_dt)
    
    meetings = query.all()
    return meetings_schema.dump([serialize_meeting(m) for m in meetings])

@router.post("", status_code=201)
def create_meeting(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        data = create_meeting_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    meeting = Meeting(
        title=data.title,
        description=data.description,
        start_time=data.start_time,
        end_time=data.end_time,
        project_id=data.project_id,
        created_by=str(current_user.id),
        location=data.location,
        meeting_type=data.meeting_type
    )
    db.add(meeting)
    db.flush()

    # Add participants
    for profile_id in (data.participant_ids or []):
        participant = MeetingParticipant(
            meeting_id=meeting.id,
            profile_id=profile_id
        )
        db.add(participant)

    db.commit()
    db.refresh(meeting)

    return meeting_schema.dump(serialize_meeting(meeting))

@router.get("/{meeting_id}")
def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting_schema.dump(serialize_meeting(meeting))

@router.patch("/{meeting_id}")
def update_meeting(
    meeting_id: str,
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_meeting_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Handle participant updates
    participant_ids = request_data.pop("participant_ids", None)
    
    for key, value in request_data.items():
        if hasattr(meeting, key) and value is not None:
            setattr(meeting, key, value)

    if participant_ids is not None:
        # Remove old participants
        db.query(MeetingParticipant).filter(
            MeetingParticipant.meeting_id == meeting_id
        ).delete()
        
        # Add new participants
        for profile_id in participant_ids:
            participant = MeetingParticipant(
                meeting_id=meeting_id,
                profile_id=profile_id
            )
            db.add(participant)

    db.commit()
    db.refresh(meeting)

    return meeting_schema.dump(serialize_meeting(meeting))

@router.delete("/{meeting_id}", status_code=204)
def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    db.delete(meeting)
    db.commit()
    return Response(status_code=204)
