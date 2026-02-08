from fastapi import APIRouter, HTTPException, Depends, Query
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from typing import Optional
from datetime import date
from app.models.capacity import CapacityAllocation
from app.models.user import User
from app.database import get_db
from app.schemas.capacity import update_capacity_schema, capacity_schema, capacities_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/capacity-allocations", tags=["capacity"])

def serialize_capacity(allocation: CapacityAllocation) -> dict:
    return {
        "id": str(allocation.id),
        "profile_id": str(allocation.profile_id),
        "project_id": str(allocation.project_id),
        "week_start": allocation.week_start,
        "hours_allocated": allocation.hours_allocated,
        "created_at": allocation.created_at,
        "updated_at": allocation.updated_at
    }

@router.get("")
def list_capacity_allocations(
    week_start: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CapacityAllocation)
    
    if week_start:
        week_date = date.fromisoformat(week_start)
        query = query.filter(CapacityAllocation.week_start == week_date)
    
    allocations = query.all()
    return capacities_schema.dump([serialize_capacity(a) for a in allocations])

@router.patch("/{allocation_id}")
def update_capacity_allocation(
    allocation_id: str,
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_capacity_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    allocation = db.query(CapacityAllocation).filter(
        CapacityAllocation.id == allocation_id
    ).first()
    
    if not allocation:
        raise HTTPException(status_code=404, detail="Capacity allocation not found")

    for key, value in request_data.items():
        if hasattr(allocation, key) and value is not None:
            setattr(allocation, key, value)

    db.commit()
    db.refresh(allocation)

    return capacity_schema.dump(serialize_capacity(allocation))
