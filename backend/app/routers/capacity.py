from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List, Optional
from datetime import date
from ..database import get_db
from ..models import CapacityAllocation, User
from ..schemas import CapacityAllocationCreate, CapacityAllocationUpdate, CapacityAllocationResponse
from ..utils import get_current_user

router = APIRouter(prefix="/api/capacity-allocations", tags=["Capacity"])


@router.get("", response_model=List[CapacityAllocationResponse])
async def list_capacity_allocations(
    week_start: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(CapacityAllocation)
    
    if week_start:
        query = query.filter(CapacityAllocation.week_start == week_start)
    
    allocations = query.all()
    return allocations


@router.post("", response_model=CapacityAllocationResponse, status_code=status.HTTP_201_CREATED)
async def create_capacity_allocation(
    allocation_data: CapacityAllocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if allocation already exists for this user/project/week
    existing = db.query(CapacityAllocation).filter(
        CapacityAllocation.profile_id == allocation_data.profile_id,
        CapacityAllocation.project_id == allocation_data.project_id,
        CapacityAllocation.week_start == allocation_data.week_start
    ).first()
    
    if existing:
        # Update existing allocation instead
        existing.hours_allocated = allocation_data.hours_allocated
        db.commit()
        db.refresh(existing)
        return existing
    
    allocation = CapacityAllocation(
        profile_id=allocation_data.profile_id,
        project_id=allocation_data.project_id,
        week_start=allocation_data.week_start,
        hours_allocated=allocation_data.hours_allocated,
    )
    db.add(allocation)
    
    try:
        db.commit()
        db.refresh(allocation)
        return allocation
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create allocation"
        )


@router.patch("/{allocation_id}", response_model=CapacityAllocationResponse)
async def update_capacity_allocation(
    allocation_id: str,
    allocation_data: CapacityAllocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    allocation = db.query(CapacityAllocation).filter(CapacityAllocation.id == allocation_id).first()
    if not allocation:
        raise HTTPException(status_code=404, detail="Allocation not found")
    
    allocation.hours_allocated = allocation_data.hours_allocated
    db.commit()
    db.refresh(allocation)
    return allocation
