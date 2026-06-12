# JackOfHarness

A fully local, open-source AI chat app. Bring your own API keys for Anthropic, OpenAI, Google Gemini, and Groq. Runs entirely in Docker — no account, no cloud, no tracking.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, Zustand, TanStack Query |
| Backend | Python 3.12, FastAPI, SQLAlchemy 2 async |
| Database | PostgreSQL 16 |
| Deployment | Docker Compose |

## Quick Start

**Prerequisites:** Docker Desktop (includes Compose v2)

```bash
git clone https://github.com/your-handle/jackofharness.git
cd jackofharness

# Build and start all services
docker compose up --build

# In a separate terminal, run DB migrations
docker compose exec backend alembic upgrade head
```

Open **http://localhost:3000**, go to **Settings**, and add at least one API key.

## Day-to-Day

```bash
docker compose up          # start (images already built)
docker compose down        # stop (data persists)
docker compose down -v     # stop + wipe all data
```

## Features

- **Bring Your Own API Key** — Anthropic, OpenAI, Google Gemini, Groq. Keys stored locally in PostgreSQL, never returned by the API.
- **Streaming responses** — tokens stream in real time via SSE.
- **Chat history** — all conversations persisted, browsable from the sidebar.
- **Cross-chat memory** — add persistent facts/preferences (Settings → Memory). Injected into every chat with Memory toggled On.
- **Memory toggle** — per-conversation On/Off toggle in the top bar.
- **Save to memory** — hover any AI message and click "Save to memory" to preserve it.
- **Model selector** — switch provider and model per conversation.

## Security Note

API keys are stored as plain text in PostgreSQL. This is intentional — JackOfHarness is designed for single-user local use only. Do not expose it to the internet.

## Adding a New DB Migration

```bash
docker compose exec backend alembic revision --autogenerate -m "describe_change"
docker compose exec backend alembic upgrade head
```

## License

MIT
