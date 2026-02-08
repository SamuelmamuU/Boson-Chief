from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from app.models.user import User, UserRole
from app.database import get_db
from app.schemas.auth import signup_schema, user_response_schema, login_schema
from app.utils.security import hash_password, create_access_token, verify_password

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/register")
def register(request_data: dict, db: Session = Depends(get_db)):
    # Validate input
    try:
        data = signup_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    # Check if user exists
    existing_user = db.query(User).filter(User.email == data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create user
    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        full_name=data.full_name
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate token
    access_token = create_access_token({"sub": str(user.id)})

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "availability": user.availability.value if user.availability else "available",
        "cognitive_load": user.cognitive_load or 0,
        "roles": [r.role.value for r in user.roles],
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }
}

@router.post("/login")
def login(request_data: dict, db: Session = Depends(get_db)): 
    try:
        data = login_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    # Use dictionary access, not attribute access
    user = db.query(User).filter(User.email == data["email"]).first()
    if not user or not verify_password(data["password"], user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Generate token
    access_token = create_access_token({"sub": str(user.id)})

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": str(user.id),
        "email": user.email,
        "full_name": user.full_name,
        "avatar_url": user.avatar_url,
        "availability": user.availability.value if user.availability else "available",
        "cognitive_load": user.cognitive_load or 0,
        "roles": [r.role.value for r in user.roles],
        "created_at": user.created_at.isoformat() if user.created_at else None,
        "updated_at": user.updated_at.isoformat() if user.updated_at else None
    }
}

@router.post("/logout")
def logout():
    # For JWT, logout is handled client-side by deleting the token
    return {"msg": "Logout successful. Please delete your token on the client side."}