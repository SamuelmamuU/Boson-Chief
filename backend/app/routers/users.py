from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..schemas import UserResponse, UserUpdate
from ..utils import get_current_user

router = APIRouter(prefix="/api/users", tags=["Users"])


def get_user_response(user: User) -> UserResponse:
    return UserResponse(
        id=user.id,
        email=user.email,
        full_name=user.full_name,
        avatar_url=user.avatar_url,
        availability=user.availability,
        cognitive_load=user.cognitive_load,
        roles=[role.role for role in user.roles],
        created_at=user.created_at,
        updated_at=user.updated_at,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return get_user_response(current_user)


@router.get("", response_model=List[UserResponse])
async def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return [get_user_response(user) for user in users]


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return get_user_response(user)


@router.patch("/me", response_model=UserResponse)
async def update_current_user(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    update_data = user_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    return get_user_response(current_user)
