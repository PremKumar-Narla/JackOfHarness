from .base import BaseProvider, ChatMessage, StreamChunk
from .anthropic import AnthropicProvider
from .openai import OpenAIProvider
from .gemini import GeminiProvider
from .groq import GroqProvider

__all__ = ["BaseProvider", "ChatMessage", "StreamChunk", "get_provider"]

_PROVIDERS = {
    "anthropic": AnthropicProvider,
    "openai": OpenAIProvider,
    "gemini": GeminiProvider,
    "groq": GroqProvider,
}


def get_provider(provider: str, api_key: str) -> BaseProvider:
    cls = _PROVIDERS.get(provider)
    if not cls:
        raise ValueError(f"Unknown provider: {provider}")
    return cls(api_key=api_key)
