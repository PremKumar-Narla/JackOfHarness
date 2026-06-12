import uuid
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from fastapi import HTTPException

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.api_key import ApiKey
from app.providers import get_provider, ChatMessage, StreamChunk
from app.services import memory_service


async def _get_conversation(db: AsyncSession, conv_id: uuid.UUID) -> Conversation:
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


async def _get_api_key(db: AsyncSession, provider: str) -> str:
    result = await db.execute(select(ApiKey).where(ApiKey.provider == provider))
    key_row = result.scalar_one_or_none()
    if not key_row:
        raise HTTPException(status_code=400, detail=f"No API key configured for provider '{provider}'")
    return key_row.key_value


async def _get_messages(db: AsyncSession, conv_id: uuid.UUID) -> list[Message]:
    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conv_id)
        .order_by(Message.created_at)
    )
    return list(result.scalars().all())


async def _save_message(
    db: AsyncSession,
    conv_id: uuid.UUID,
    role: str,
    content: str,
    token_count: int | None = None,
) -> Message:
    msg = Message(conversation_id=conv_id, role=role, content=content, token_count=token_count)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)
    return msg


async def _auto_title(db: AsyncSession, conv: Conversation, first_user_msg: str) -> None:
    title = first_user_msg.strip()
    if len(title) > 60:
        cut = title[:60].rsplit(" ", 1)
        title = cut[0] if len(cut) > 1 else title[:60]
    conv.title = title
    await db.commit()


async def stream_response(
    db: AsyncSession,
    conv_id: uuid.UUID,
    user_content: str,
) -> AsyncGenerator[StreamChunk, None]:
    conv = await _get_conversation(db, conv_id)
    api_key = await _get_api_key(db, conv.provider)
    provider = get_provider(conv.provider, api_key)

    await _save_message(db, conv_id, "user", user_content)

    history = await _get_messages(db, conv_id)

    system_prompt = conv.system_prompt or ""
    if conv.use_memory:
        memory_block = await memory_service.build_memory_block(db)
        if memory_block:
            system_prompt = memory_block + ("\n\n" + system_prompt if system_prompt else "")

    chat_messages = [ChatMessage(role=m.role, content=m.content) for m in history]

    full_response: list[str] = []
    total_tokens: int | None = None

    async for chunk in provider.stream_chat(conv.model, chat_messages, system_prompt or None):
        full_response.append(chunk.delta)
        if chunk.total_tokens:
            total_tokens = chunk.total_tokens
        yield chunk

    await _save_message(db, conv_id, "assistant", "".join(full_response), total_tokens)

    if len(history) == 1:
        await _auto_title(db, conv, user_content)
