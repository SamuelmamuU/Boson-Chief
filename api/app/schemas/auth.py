from marshmallow import Schema, fields, validate, post_load
from dataclasses import dataclass

@dataclass
class SignUpData:
    email: str
    password: str
    full_name: str

@dataclass
class UserData:
    id: str
    email: str
    full_name: str

class SignUpSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=6))
    full_name = fields.Str(required=True, validate=validate.Length(min=1, max=255))

    @post_load
    def make_signup(self, data, **kwargs):
        return SignUpData(**data)

class UserResponseSchema(Schema):
    id = fields.Str(required=True)
    email = fields.Email(required=True)
    full_name = fields.Str(required=True)

class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, load_only=True)

login_schema = LoginSchema()

signup_schema = SignUpSchema()
user_response_schema = UserResponseSchema()
