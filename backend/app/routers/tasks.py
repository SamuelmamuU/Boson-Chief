from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from ..database import get_db
from ..models import Task, User
from ..schemas import TaskCreate, TaskUpdate, TaskResponse
from ..utils import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])


@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    tasks = db.query(Task).all()
    return tasks


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
async def create_task(
    task_data: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = Task(
        title=task_data.title,
        description=task_data.description,
        status=task_data.status.value if hasattr(task_data.status, 'value') else task_data.status,
        priority=task_data.priority.value if hasattr(task_data.priority, 'value') else task_data.priority,
        project_id=task_data.project_id,
        assigned_to=task_data.assigned_to,
        due_date=task_data.due_date,
        estimated_hours=task_data.estimated_hours,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    update_data = task_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        if hasattr(value, 'value'):
            value = value.value
        setattr(task, field, value)
    
    # Update completed_at if status changed to done
    if task_data.status and task_data.status.value == 'done':
        task.completed_at = datetime.utcnow()
    elif task_data.status and task_data.status.value != 'done':
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_task(
    task_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
