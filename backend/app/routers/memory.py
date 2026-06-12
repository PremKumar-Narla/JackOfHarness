import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.memory import MemoryItem
from app.schemas.memory import MemoryItemCreate, MemoryItemUpdate, MemoryItemOut

router = APIRouter(prefix="/api/memory", tags=["memory"])


@router.get("", response_model=list[MemoryItemOut])
async def list_memory(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MemoryItem).order_by(MemoryItem.created_at))
    return result.scalars().all()


@router.post("", response_model=MemoryItemOut)
async def create_memory(body: MemoryItemCreate, db: AsyncSession = Depends(get_db)):
    item = MemoryItem(**body.model_dump())
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


@router.patch("/{item_id}", response_model=MemoryItemOut)
async def update_memory(item_id: uuid.UUID, body: MemoryItemUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(MemoryItem).where(MemoryItem.id == item_id))
    item = result.scalar_one_or_none()
    if not item:
        raise HTTPException(status_code=404, detail="Memory item not found")
    for field, value in body.model_dump(exclude_none=True).items():
        setattr(item, field, value)
    await db.commit()
    await db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
async def delete_memory(item_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(MemoryItem).where(MemoryItem.id == item_id))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="Memory item not found")
    await db.commit()
