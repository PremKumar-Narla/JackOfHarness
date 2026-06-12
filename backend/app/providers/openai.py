from collections.abc import AsyncGenerator
from openai import AsyncOpenAI
from .base import BaseProvider, ChatMessage, StreamChunk


class OpenAIProvider(BaseProvider):
    base_url: str | None = None

    def _client(self) -> AsyncOpenAI:
        kwargs = {"api_key": self.api_key}
        if self.base_url:
            kwargs["base_url"] = self.base_url
        return AsyncOpenAI(**kwargs)

    async def stream_chat(
        self,
        model: str,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[StreamChunk, None]:
        client = self._client()
        sdk_messages = []
        if system_prompt:
            sdk_messages.append({"role": "system", "content": system_prompt})
        sdk_messages.extend({"role": m.role, "content": m.content} for m in messages)

        stream = await client.chat.completions.create(
            model=model,
            messages=sdk_messages,
            stream=True,
            stream_options={"include_usage": True},
        )
        total_tokens = None
        async for chunk in stream:
            if chunk.usage:
                total_tokens = chunk.usage.total_tokens
            if chunk.choices and chunk.choices[0].delta.content:
                yield StreamChunk(delta=chunk.choices[0].delta.content, is_final=False)
        yield StreamChunk(delta="", is_final=True, total_tokens=total_tokens)

    async def list_models(self) -> list[str]:
        client = self._client()
        response = await client.models.list()
        models = [m.id for m in response.data if m.id.startswith("gpt")]
        return sorted(models, reverse=True)
