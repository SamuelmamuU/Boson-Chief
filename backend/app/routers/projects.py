from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from pydantic import BaseModel
import logging
from ..database import get_db
from ..models import Project, ProjectMember, User, Task, Event
from ..schemas import ProjectCreate, ProjectUpdate, ProjectResponse, UserResponse, TaskResponse, EventResponse
from ..utils import get_current_user

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/projects", tags=["Projects"])


@router.get("", response_model=List[ProjectResponse])
async def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Get projects where user is a member or manager
    projects = db.query(Project).join(
        ProjectMember, ProjectMember.project_id == Project.id, isouter=True
    ).filter(
        (ProjectMember.user_id == current_user.id) | (Project.manager_id == current_user.id)
    ).distinct().all()
    
    return projects


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
async def create_project(
    project_data: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if user is a manager (only managers can create projects with team)
    is_manager = any(role.role == "manager" for role in current_user.roles)
    
    logger.info(f"Creating project: manager_id={project_data.manager_id}, member_ids={project_data.member_ids}")
    
    project = Project(
        name=project_data.name,
        description=project_data.description,
        priority=project_data.priority.value if hasattr(project_data.priority, 'value') else project_data.priority,
        manager_id=project_data.manager_id,
    )
    db.add(project)
    db.flush()
    
    logger.info(f"Project created with id={project.id}")
    
    # NOTE: The MySQL trigger 'tr_project_created' automatically adds manager as owner
    # So we don't need to manually add the owner here
    
    # Add other members (if manager or just the creator if employee)
    # Use a set to avoid duplicate entries and exclude the manager
    if project_data.member_ids:
        unique_member_ids = set(project_data.member_ids) - {project_data.manager_id}
        logger.info(f"Adding members (excluding manager): {unique_member_ids}")
        
        if is_manager:
            for member_id in unique_member_ids:
                member = ProjectMember(
                    project_id=project.id,
                    user_id=member_id,
                    role="member"
                )
                db.add(member)
        else:
            # Employees can only add themselves
            if current_user.id in unique_member_ids:
                member = ProjectMember(
                    project_id=project.id,
                    user_id=current_user.id,
                    role="member"
                )
                db.add(member)
    
    try:
        db.commit()
        db.refresh(project)
        return project
    except IntegrityError as e:
        db.rollback()
        logger.error(f"IntegrityError creating project: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Failed to create project. A member may already be assigned."
        )


@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.patch("/{project_id}", response_model=ProjectResponse)
async def update_project(
    project_id: str,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    update_data = project_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(value, 'value'):
            value = value.value
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is manager
    if project.manager_id != current_user.id:
        is_manager = any(role.role == "manager" for role in current_user.roles)
        if not is_manager:
            raise HTTPException(status_code=403, detail="Only project manager can delete")
    
    db.delete(project)
    db.commit()


@router.get("/{project_id}/members", response_model=List[UserResponse])
async def get_project_members(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    members = db.query(User).join(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).all()
    
    return [
        UserResponse(
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
        for user in members
    ]


class AddMemberRequest(BaseModel):
    user_id: str


@router.post("/{project_id}/members", status_code=status.HTTP_201_CREATED)
async def add_project_member(
    project_id: str,
    request: AddMemberRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is manager
    is_manager = any(role.role == "manager" for role in current_user.roles)
    if project.manager_id != current_user.id and not is_manager:
        raise HTTPException(status_code=403, detail="Only project manager can add members")
    
    # Check if member already exists
    existing = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == request.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User is already a member")
    
    # Add member
    member = ProjectMember(
        project_id=project_id,
        user_id=request.user_id,
        role="member"
    )
    db.add(member)
    db.commit()
    
    return {"message": "Member added successfully"}


@router.delete("/{project_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_project_member(
    project_id: str,
    user_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Verify project exists
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user is manager
    is_manager = any(role.role == "manager" for role in current_user.roles)
    if project.manager_id != current_user.id and not is_manager:
        raise HTTPException(status_code=403, detail="Only project manager can remove members")
    
    # Can't remove the manager
    if user_id == project.manager_id:
        raise HTTPException(status_code=400, detail="Cannot remove project manager")
    
    # Find and remove member
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == user_id
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    db.delete(member)
    db.commit()


@router.get("/{project_id}/tasks", response_model=List[TaskResponse])
async def get_project_tasks(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).filter(Task.project_id == project_id).all()
    return tasks


@router.get("/{project_id}/events", response_model=List[EventResponse])
async def get_project_events(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    events = db.query(Event).filter(Event.project_id == project_id).order_by(Event.created_at.desc()).all()
    return events
