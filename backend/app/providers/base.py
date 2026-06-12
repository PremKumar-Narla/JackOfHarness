from abc import ABC, abstractmethod
from collections.abc import AsyncGenerator
from dataclasses import dataclass


@dataclass
class ChatMessage:
    role: str  # "user" | "assistant" | "system"
    content: str


@dataclass
class StreamChunk:
    delta: str
    is_final: bool
    total_tokens: int | None = None


class BaseProvider(ABC):
    def __init__(self, api_key: str):
        self.api_key = api_key

    @abstractmethod
    async def stream_chat(
        self,
        model: str,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[StreamChunk, None]: ...

    @abstractmethod
    async def list_models(self) -> list[str]: ...
