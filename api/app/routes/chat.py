from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from marshmallow import ValidationError
from app.models.user import User
from app.database import get_db
from app.schemas.chat import chat_request_schema, chat_response_schema
from app.utils.auth import get_current_user

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("")
def chat_with_agent(
    request_data: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        data = chat_request_schema.load(request_data)
    except ValidationError as err:
        raise HTTPException(status_code=422, detail=err.messages)

    # TODO: Implement your AI agent logic here
    # This is a placeholder response
    messages = data.get("messages", [])
    last_message = messages[-1]["content"] if messages else ""
    
    response = {
        "message": f"I received your message: '{last_message}'. AI agent integration pending.",
        "metadata": {
            "sources": ["placeholder"],
            "confidence": 0.0
        }
    }

    return chat_response_schema.dump(response)
