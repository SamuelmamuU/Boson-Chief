from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from app.models.task import Task
from app.models.user import User
from app.database import get_db
from app.schemas.task import create_task_schema, update_task_schema, task_schema, tasks_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])

def serialize_task(task: Task) -> dict:
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

@router.get("")
def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).all()
    return tasks_schema.dump([serialize_task(t) for t in tasks])

@router.post("", status_code=201)
def create_task(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        data = create_task_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    task = Task(
        title=data.title,
        description=data.description,
        status=data.status,
        priority=data.priority,
        project_id=data.project_id,
        assigned_to=data.assigned_to,
        due_date=data.due_date,
        estimated_hours=data.estimated_hours
    )
    db.add(task)
    db.commit()
    db.refresh(task)

    return task_schema.dump(serialize_task(task))

@router.get("/{task_id}")
def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task_schema.dump(serialize_task(task))

@router.patch("/{task_id}")
def update_task(
    task_id: str,
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        update_task_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    for key, value in request_data.items():
        if hasattr(task, key) and value is not None:
            setattr(task, key, value)

    db.commit()
    db.refresh(task)

    return task_schema.dump(serialize_task(task))

@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    db.delete(task)
    db.commit()
    return Response(status_code=204)
