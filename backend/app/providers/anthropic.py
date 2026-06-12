from collections.abc import AsyncGenerator
import anthropic as sdk
from .base import BaseProvider, ChatMessage, StreamChunk


class AnthropicProvider(BaseProvider):
    async def stream_chat(
        self,
        model: str,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[StreamChunk, None]:
        client = sdk.AsyncAnthropic(api_key=self.api_key)
        sdk_messages = [
            {"role": m.role, "content": m.content}
            for m in messages
            if m.role != "system"
        ]
        async with client.messages.stream(
            model=model,
            max_tokens=8096,
            system=system_prompt or "",
            messages=sdk_messages,
        ) as stream:
            async for text in stream.text_stream:
                yield StreamChunk(delta=text, is_final=False)
            final = await stream.get_final_message()
            total = final.usage.input_tokens + final.usage.output_tokens
            yield StreamChunk(delta="", is_final=True, total_tokens=total)

    async def list_models(self) -> list[str]:
        return [
            "claude-opus-4-5",
            "claude-sonnet-4-5",
            "claude-haiku-4-5",
            "claude-opus-4-0",
            "claude-sonnet-4-0",
        ]
