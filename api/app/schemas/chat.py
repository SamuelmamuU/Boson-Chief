from marshmallow import Schema, fields, validate

class ChatMessageSchema(Schema):
    role = fields.Str(required=True, validate=validate.OneOf(["user", "assistant", "system"]))
    content = fields.Str(required=True)

class ChatRequestSchema(Schema):
    messages = fields.List(fields.Nested(ChatMessageSchema), required=True)
    project_id = fields.Str(allow_none=True)
    agent_type = fields.Str(validate=validate.OneOf(["global", "local"]))

class ChatResponseSchema(Schema):
    message = fields.Str(required=True)
    metadata = fields.Dict(allow_none=True)

chat_request_schema = ChatRequestSchema()
chat_response_schema = ChatResponseSchema()
