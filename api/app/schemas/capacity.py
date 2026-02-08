from marshmallow import Schema, fields, validate

class UpdateCapacitySchema(Schema):
    hours_allocated = fields.Int(required=True, validate=validate.Range(min=0, max=168))

class CapacityResponseSchema(Schema):
    id = fields.Str(required=True)
    profile_id = fields.Str()
    project_id = fields.Str()
    week_start = fields.Date()
    hours_allocated = fields.Int()
    created_at = fields.DateTime()
    updated_at = fields.DateTime()

update_capacity_schema = UpdateCapacitySchema()
capacity_schema = CapacityResponseSchema()
capacities_schema = CapacityResponseSchema(many=True)
