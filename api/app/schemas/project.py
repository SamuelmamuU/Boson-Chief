from marshmallow import Schema, fields, validate, post_load
from dataclasses import dataclass
from typing import Optional

@dataclass
class CreateProjectData:
    name: str
    description: Optional[str] = None
    priority: str = "medium"
    manager_id: Optional[str] = None

@dataclass
class UpdateProjectData:
    name: Optional[str] = None
    description: Optional[str] = None
    health: Optional[str] = None
    progress: Optional[int] = None
    priority: Optional[str] = None
    manager_id: Optional[str] = None

class CreateProjectSchema(Schema):
    name = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high", "critical"]))
    manager_id = fields.Str(allow_none=True)

    @post_load
    def make_project(self, data, **kwargs):
        return CreateProjectData(**data)

class UpdateProjectSchema(Schema):
    name = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    health = fields.Str(validate=validate.OneOf(["healthy", "at-risk", "critical", "blocked"]))
    progress = fields.Int(validate=validate.Range(min=0, max=100))
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high", "critical"]))
    manager_id = fields.Str(allow_none=True)

class ProjectResponseSchema(Schema):
    id = fields.Str(required=True)
    name = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    health = fields.Str()
    progress = fields.Int()
    priority = fields.Str()
    manager_id = fields.Str(allow_none=True)
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

create_project_schema = CreateProjectSchema()
update_project_schema = UpdateProjectSchema()
project_schema = ProjectResponseSchema()
projects_schema = ProjectResponseSchema(many=True)
