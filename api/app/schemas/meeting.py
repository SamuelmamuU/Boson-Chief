from marshmallow import Schema, fields, validate, post_load
from dataclasses import dataclass
from typing import Optional, List
from datetime import datetime

@dataclass
class CreateMeetingData:
    title: str
    start_time: datetime
    end_time: datetime
    description: Optional[str] = None
    project_id: Optional[str] = None
    location: Optional[str] = None
    meeting_type: str = "internal"
    participant_ids: List[str] = None

class CreateMeetingSchema(Schema):
    title = fields.Str(required=True, validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime(required=True)
    end_time = fields.DateTime(required=True)
    project_id = fields.Str(allow_none=True)
    location = fields.Str(allow_none=True)
    meeting_type = fields.Str(validate=validate.OneOf(["internal", "external", "review", "standup"]))
    participant_ids = fields.List(fields.Str(), load_default=[])

    @post_load
    def make_meeting(self, data, **kwargs):
        return CreateMeetingData(**data)

class UpdateMeetingSchema(Schema):
    title = fields.Str(validate=validate.Length(min=1, max=255))
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime()
    end_time = fields.DateTime()
    project_id = fields.Str(allow_none=True)
    location = fields.Str(allow_none=True)
    meeting_type = fields.Str(validate=validate.OneOf(["internal", "external", "review", "standup"]))
    participant_ids = fields.List(fields.Str())

class ParticipantProfileSchema(Schema):
    id = fields.Str()
    full_name = fields.Str()
    avatar_url = fields.Str(allow_none=True)

class MeetingParticipantSchema(Schema):
    id = fields.Str()
    profile_id = fields.Str()
    status = fields.Str()
    profile = fields.Nested(ParticipantProfileSchema)

class MeetingProjectSchema(Schema):
    id = fields.Str()
    name = fields.Str()

class MeetingCreatorSchema(Schema):
    id = fields.Str()
    full_name = fields.Str()
    avatar_url = fields.Str(allow_none=True)

class MeetingResponseSchema(Schema):
    id = fields.Str(required=True)
    title = fields.Str(required=True)
    description = fields.Str(allow_none=True)
    start_time = fields.DateTime()
    end_time = fields.DateTime()
    project_id = fields.Str(allow_none=True)
    created_by = fields.Str()
    location = fields.Str(allow_none=True)
    meeting_type = fields.Str()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()
    project = fields.Nested(MeetingProjectSchema, allow_none=True)
    creator = fields.Nested(MeetingCreatorSchema)
    participants = fields.List(fields.Nested(MeetingParticipantSchema))

create_meeting_schema = CreateMeetingSchema()
update_meeting_schema = UpdateMeetingSchema()
meeting_schema = MeetingResponseSchema()
meetings_schema = MeetingResponseSchema(many=True)
