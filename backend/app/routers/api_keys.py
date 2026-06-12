from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.database import get_db
from app.models.api_key import ApiKey
from app.schemas.api_key import ApiKeyCreate, ApiKeyOut

router = APIRouter(prefix="/api/keys", tags=["api-keys"])


@router.get("", response_model=list[ApiKeyOut])
async def list_keys(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).order_by(ApiKey.provider))
    return result.scalars().all()


@router.post("", response_model=ApiKeyOut)
async def upsert_key(body: ApiKeyCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.provider == body.provider))
    existing = result.scalar_one_or_none()
    if existing:
        existing.key_value = body.key_value
        existing.label = body.label
    else:
        existing = ApiKey(provider=body.provider, key_value=body.key_value, label=body.label)
        db.add(existing)
    await db.commit()
    await db.refresh(existing)
    return existing


@router.delete("/{provider}", status_code=204)
async def delete_key(provider: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(delete(ApiKey).where(ApiKey.provider == provider))
    if result.rowcount == 0:
        raise HTTPException(status_code=404, detail="API key not found")
    await db.commit()
