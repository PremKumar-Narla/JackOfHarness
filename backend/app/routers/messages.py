import uuid
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.message import MessageCreate
from app.services import chat_service

router = APIRouter(prefix="/api/conversations", tags=["messages"])


@router.post("/{conv_id}/messages")
async def send_message(
    conv_id: uuid.UUID,
    body: MessageCreate,
    db: AsyncSession = Depends(get_db),
):
    async def event_generator():
        async for chunk in chat_service.stream_response(db, conv_id, body.content):
            payload = json.dumps({
                "delta": chunk.delta,
                "is_final": chunk.is_final,
                "total_tokens": chunk.total_tokens,
            })
            yield f"data: {payload}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "X-Accel-Buffering": "no",
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )
