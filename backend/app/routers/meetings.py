from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
from ..database import get_db
from ..models import Meeting, MeetingParticipant, User, Project
from ..schemas import MeetingCreate, MeetingUpdate, MeetingResponse
from ..schemas.meeting import ParticipantResponse, ParticipantProfile, ProjectInfo, CreatorInfo
from ..utils import get_current_user

router = APIRouter(prefix="/api/meetings", tags=["Meetings"])


def meeting_to_response(meeting: Meeting, db: Session) -> MeetingResponse:
    project = db.query(Project).filter(Project.id == meeting.project_id).first()
    creator = db.query(User).filter(User.id == meeting.created_by).first()
    
    participants = []
    for p in meeting.participants:
        profile = db.query(User).filter(User.id == p.profile_id).first()
        if profile:
            participants.append(ParticipantResponse(
                id=p.id,
                profile_id=p.profile_id,
                status=p.status,
                profile=ParticipantProfile(
                    id=profile.id,
                    full_name=profile.full_name,
                    avatar_url=profile.avatar_url
                )
            ))
    
    return MeetingResponse(
        id=meeting.id,
        title=meeting.title,
        description=meeting.description,
        start_time=meeting.start_time,
        end_time=meeting.end_time,
        project_id=meeting.project_id,
        created_by=meeting.created_by,
        location=meeting.location,
        meeting_type=meeting.meeting_type,
        created_at=meeting.created_at,
        updated_at=meeting.updated_at,
        project=ProjectInfo(id=project.id, name=project.name) if project else None,
        creator=CreatorInfo(id=creator.id, full_name=creator.full_name, avatar_url=creator.avatar_url) if creator else None,
        participants=participants
    )


@router.get("", response_model=List[MeetingResponse])
async def list_meetings(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Meeting)
    
    if start_date:
        query = query.filter(Meeting.start_time >= start_date)
    if end_date:
        query = query.filter(Meeting.end_time <= end_date)
    
    meetings = query.order_by(Meeting.start_time).all()
    return [meeting_to_response(m, db) for m in meetings]


@router.post("", response_model=MeetingResponse, status_code=status.HTTP_201_CREATED)
async def create_meeting(
    meeting_data: MeetingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = Meeting(
        title=meeting_data.title,
        description=meeting_data.description,
        start_time=meeting_data.start_time,
        end_time=meeting_data.end_time,
        project_id=meeting_data.project_id,
        created_by=current_user.id,
        location=meeting_data.location,
        meeting_type=meeting_data.meeting_type.value if hasattr(meeting_data.meeting_type, 'value') else meeting_data.meeting_type,
    )
    db.add(meeting)
    db.flush()
    
    # Add participants
    if meeting_data.participant_ids:
        for participant_id in meeting_data.participant_ids:
            participant = MeetingParticipant(
                meeting_id=meeting.id,
                profile_id=participant_id,
                status="pending"
            )
            db.add(participant)
    
    db.commit()
    db.refresh(meeting)
    return meeting_to_response(meeting, db)


@router.get("/{meeting_id}", response_model=MeetingResponse)
async def get_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting_to_response(meeting, db)


@router.patch("/{meeting_id}", response_model=MeetingResponse)
async def update_meeting(
    meeting_id: str,
    meeting_data: MeetingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    update_data = meeting_data.model_dump(exclude_unset=True, exclude={"participant_ids"})
    for field, value in update_data.items():
        if hasattr(value, 'value'):
            value = value.value
        setattr(meeting, field, value)
    
    # Update participants if provided
    if meeting_data.participant_ids is not None:
        # Remove existing participants
        db.query(MeetingParticipant).filter(MeetingParticipant.meeting_id == meeting_id).delete()
        # Add new participants
        for participant_id in meeting_data.participant_ids:
            participant = MeetingParticipant(
                meeting_id=meeting.id,
                profile_id=participant_id,
                status="pending"
            )
            db.add(participant)
    
    db.commit()
    db.refresh(meeting)
    return meeting_to_response(meeting, db)


@router.delete("/{meeting_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_meeting(
    meeting_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    
    db.delete(meeting)
    db.commit()
