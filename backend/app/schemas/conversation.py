import uuid
from datetime import datetime
from pydantic import BaseModel


class ConversationCreate(BaseModel):
    provider: str
    model: str
    title: str = "New Chat"
    use_memory: bool = True
    system_prompt: str | None = None


class ConversationUpdate(BaseModel):
    title: str | None = None
    use_memory: bool | None = None
    model: str | None = None
    system_prompt: str | None = None


class ConversationOut(BaseModel):
    id: uuid.UUID
    title: str
    provider: str
    model: str
    use_memory: bool
    system_prompt: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
