from datetime import datetime
from pydantic import BaseModel


class ApiKeyCreate(BaseModel):
    provider: str
    key_value: str
    label: str | None = None


class ApiKeyOut(BaseModel):
    provider: str
    label: str | None
    created_at: datetime

    model_config = {"from_attributes": True}
