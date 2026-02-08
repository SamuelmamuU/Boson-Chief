from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.models.user import User
from app.database import get_db
from app.schemas.user import user_schema, users_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/users", tags=["users"])

def serialize_user(user: User) -> dict:
    return {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "availability": user.availability.value if user.availability else "available",
        "cognitive_load": user.cognitive_load or 0,
        "roles": [r.role.value for r in user.roles],
        "created_at": user.created_at,
        "updated_at": user.updated_at
    }

@router.get("/me")
def get_current_user_profile(current_user: User = Depends(get_current_user)):
    return user_schema.dump(serialize_user(current_user))

@router.get("")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    users = db.query(User).all()
    return users_schema.dump([serialize_user(u) for u in users])

@router.get("/{user_id}")
def get_user(
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user_schema.dump(serialize_user(user))
