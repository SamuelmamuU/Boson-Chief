from marshmallow import Schema, fields, validate, post_load
from dataclasses import dataclass
from typing import Optional
from datetime import datetime

@dataclass
class CreateTaskData:
    title: str
    project_id: str
    description: Optional[str] = None
    status: str = "todo"
    priority: str = "medium"
    assigned_to: Optional[str] = None
    due_date: Optional[datetime] = None
    estimated_hours: Optional[int] = None

class CreateTaskSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["todo", "in_progress", "done"]))
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high"]))
    project_id = fields.Str(required=True)
    assigned_to = fields.Str(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    estimated_hours = fields.Int(allow_none=True)

    @post_load
    def make_task(self, data, **kwargs):
        return CreateTaskData(**data)

class UpdateTaskSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["todo", "in_progress", "done"]))
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high"]))
    assigned_to = fields.Str(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    estimated_hours = fields.Int(allow_none=True)

class TaskResponseSchema(Schema):
    id = fields.Str(required=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    status = fields.Str()
    priority = fields.Str()
    project_id = fields.Str()
    assigned_to = fields.Str(allow_none=True)
    due_date = fields.DateTime(allow_none=True)
    estimated_hours = fields.Int(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

create_task_schema = CreateTaskSchema()
update_task_schema = UpdateTaskSchema()
task_schema = TaskResponseSchema()
tasks_schema = TaskResponseSchema(many=True)
