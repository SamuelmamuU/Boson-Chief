from marshmallow import Schema, fields

class EventResponseSchema(Schema):
    id = fields.Str(required=True)
    project_id = fields.Str()
    type = fields.Str()
    title = fields.Str()
    description = fields.Str(allow_none=True)
    ai_generated = fields.Bool()
    created_at = fields.DateTime()

event_schema = EventResponseSchema()
events_schema = EventResponseSchema(many=True)
