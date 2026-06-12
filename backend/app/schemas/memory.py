import uuid
from datetime import datetime
from pydantic import BaseModel


class MemoryItemCreate(BaseModel):
    content: str
    source_conversation_id: uuid.UUID | None = None


class MemoryItemUpdate(BaseModel):
    content: str | None = None
    is_active: bool | None = None


class MemoryItemOut(BaseModel):
    id: uuid.UUID
    content: str
    source_conversation_id: uuid.UUID | None
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
