from marshmallow import Schema, fields

class UserSchema(Schema):
    id = fields.Str(required=True)
    email = fields.Email(required=True)
    full_name = fields.Str(required=True)
    avatar_url = fields.Str(allow_none=True)
    availability = fields.Str()
    cognitive_load = fields.Int()
    roles = fields.List(fields.Str())
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

user_schema = UserSchema()
users_schema = UserSchema(many=True)
