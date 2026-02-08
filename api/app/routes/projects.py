from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from app.models.project import Project
from app.models.user import User
from app.database import get_db
from app.schemas.project import (
    create_project_schema, update_project_schema, 
    project_schema, projects_schema
)
from app.schemas.user import users_schema
from app.schemas.task import tasks_schema
from app.schemas.event import events_schema
from app.utils.auth import get_current_user
from app.routes.users import serialize_user

router = APIRouter(prefix="/api/projects", tags=["projects"])

def serialize_project(project: Project) -> dict:
    return {
        "id": str(project.id),
        "name": project.name,
        "description": project.description,
        "health": project.health.value if project.health else "healthy",
        "progress": project.progress or 0,
        "priority": project.priority.value if project.priority else "medium",
        "manager_id": str(project.manager_id) if project.manager_id else None,
        "created_at": project.created_at,
        "updated_at": project.updated_at
    }

def serialize_task(task) -> dict:
    return {
        "id": str(task.id),
        "title": task.title,
        "description": task.description,
        "status": task.status.value if task.status else "todo",
        "priority": task.priority.value if task.priority else "medium",
        "project_id": str(task.project_id),
        "assigned_to": str(task.assigned_to) if task.assigned_to else None,
        "due_date": task.due_date,
        "estimated_hours": task.estimated_hours,
        "created_at": task.created_at,
        "updated_at": task.updated_at
    }

def serialize_event(event) -> dict:
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
def list_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    projects = db.query(Project).all()
    return projects_schema.dump([serialize_project(p) for p in projects])

@router.post("", status_code=201)
def create_project(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        data = create_project_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    project = Project(
        name=data.name,
        description=data.description,
        priority=data.priority,
        manager_id=data.manager_id or str(current_user.id)
    )
    db.add(project)
    db.commit()
    db.refresh(project)

    return project_schema.dump(serialize_project(project))

@router.get("/{project_id}")
def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project_schema.dump(serialize_project(project))

@router.patch("/{project_id}")
def update_project(
    project_id: str,
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        data = update_project_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    for key, value in request_data.items():
        if hasattr(project, key) and value is not None:
            setattr(project, key, value)

    db.commit()
    db.refresh(project)

    return project_schema.dump(serialize_project(project))

@router.delete("/{project_id}", status_code=204)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return Response(status_code=204)

@router.get("/{project_id}/members")
def get_project_members(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return users_schema.dump([serialize_user(m) for m in project.members])

@router.get("/{project_id}/tasks")
def get_project_tasks(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return tasks_schema.dump([serialize_task(t) for t in project.tasks])

@router.get("/{project_id}/events")
def get_project_events(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return events_schema.dump([serialize_event(e) for e in project.events])
