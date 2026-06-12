from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import api_keys, conversations, messages, memory, models

app = FastAPI(title="JackOfHarness", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_keys.router)
app.include_router(conversations.router)
app.include_router(messages.router)
app.include_router(memory.router)
app.include_router(models.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
