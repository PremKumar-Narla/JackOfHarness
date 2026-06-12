from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.memory import MemoryItem


async def get_active_items(db: AsyncSession) -> list[MemoryItem]:
    result = await db.execute(
        select(MemoryItem).where(MemoryItem.is_active == True).order_by(MemoryItem.created_at)
    )
    return list(result.scalars().all())


async def build_memory_block(db: AsyncSession) -> str:
    items = await get_active_items(db)
    if not items:
        return ""
    lines = "\n".join(f"- {item.content}" for item in items)
    return (
        "The following are persistent facts and preferences about the user. "
        "Use these to personalize your responses:\n" + lines
    )
