from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AgentTypeEnum(str, Enum):
    global_ = "global"
    local = "local"


class MessageRoleEnum(str, Enum):
    user = "user"
    assistant = "assistant"
    system = "system"


class ChatMessage(BaseModel):
    role: MessageRoleEnum
    content: str


class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    project_id: Optional[str] = None
    agent_type: AgentTypeEnum = AgentTypeEnum.global_


class ChatMetadata(BaseModel):
    sources: List[str] = []
    confidence: float = 0.0


class ChatResponse(BaseModel):
    message: str
    metadata: Optional[ChatMetadata] = None
