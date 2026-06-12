from collections.abc import AsyncGenerator
import google.generativeai as genai
from .base import BaseProvider, ChatMessage, StreamChunk


class GeminiProvider(BaseProvider):
    async def stream_chat(
        self,
        model: str,
        messages: list[ChatMessage],
        system_prompt: str | None = None,
    ) -> AsyncGenerator[StreamChunk, None]:
        genai.configure(api_key=self.api_key)
        config = {}
        if system_prompt:
            config["system_instruction"] = system_prompt
        gmodel = genai.GenerativeModel(model, **config)

        history = []
        for m in messages[:-1]:
            history.append({
                "role": "user" if m.role == "user" else "model",
                "parts": [{"text": m.content}],
            })
        last = messages[-1].content

        chat = gmodel.start_chat(history=history)
        response = await chat.send_message_async(last, stream=True)
        async for chunk in response:
            if chunk.text:
                yield StreamChunk(delta=chunk.text, is_final=False)
        yield StreamChunk(delta="", is_final=True)

    async def list_models(self) -> list[str]:
        genai.configure(api_key=self.api_key)
        models = []
        for m in genai.list_models():
            if "generateContent" in m.supported_generation_methods and "gemini" in m.name:
                models.append(m.name.replace("models/", ""))
        return sorted(models, reverse=True)
