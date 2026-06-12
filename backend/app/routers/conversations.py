import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.conversation import Conversation
from app.models.message import Message
from app.schemas.conversation import ConversationCreate, ConversationUpdate, ConversationOut
from app.schemas.message import MessageOut

router = APIRouter(prefix="/api/conversations", tags=["conversations"])


@router.get("", response_model=list[ConversationOut])
async def list_conversations(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Conversation).order_by(Conversation.updated_at.desc()))
    return result.scalars().all()


@router.post("", response_model=ConversationOut)
async def create_conversation(body: ConversationCreate, db: AsyncSession = Depends(get_db)):
    conv = Conversation(**body.model_dump())
    db.add(conv)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.get("/{conv_id}", response_model=ConversationOut)
async def get_conversation(conv_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.patch("/{conv_id}", response_model=ConversationOut)
async def update_conversation(conv_id: uuid.UUID, body: ConversationUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Conversation).where(Conversation.id == conv_id))
    conv = result.scalar_one_or_none()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(conv, field, value)
    await db.commit()
    await db.refresh(conv)
    return conv


@router.delete("/{conv_id}", status_code=204)
async def delete_conversation(conv_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(Conversation).where(Conversation.id == conv_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Conversation not found")
    await db.commit()


@router.get("/{conv_id}/messages", response_model=list[MessageOut])
async def get_messages(conv_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Message).where(Message.conversation_id == conv_id).order_by(Message.created_at)
    )
    return result.scalars().all()
