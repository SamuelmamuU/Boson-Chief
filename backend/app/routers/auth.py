from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import User, UserRole
from ..schemas import UserCreate, UserLogin, AuthResponse, UserResponse
from ..utils import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/api/auth", tags=["Authentication"])


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


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == credentials.email).first()
    
    if not user or not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    return AuthResponse(
        access_token=access_token,
        user=get_user_response(user)
    )


@router.post("/register", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if email already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    user = User(
        email=user_data.email,
        password_hash=get_password_hash(user_data.password),
        full_name=user_data.full_name,
    )
    db.add(user)
    db.flush()
    
    # Add default role
    role = UserRole(user_id=user.id, role="employee")
    db.add(role)
    db.commit()
    db.refresh(user)
    
    access_token = create_access_token(data={"sub": user.id, "email": user.email})
    
    return AuthResponse(
        access_token=access_token,
        user=get_user_response(user)
    )


@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    # In a production app, you would invalidate the token here
    return {}
