from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.api_key import ApiKey
from app.providers import get_provider

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("/{provider}", response_model=list[str])
async def list_models(provider: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ApiKey).where(ApiKey.provider == provider))
    key_row = result.scalar_one_or_none()
    if not key_row:
        raise HTTPException(status_code=400, detail=f"No API key configured for provider '{provider}'")
    try:
        p = get_provider(provider, key_row.key_value)
        return await p.list_models()
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
