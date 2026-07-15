# AI-First CRM — HCP Interaction Module

An AI-first CRM module for pharmaceutical/healthcare field reps, centered on
the **Log HCP Interaction** screen. Reps can log a visit either through a
structured form or a conversational AI chat assistant; a LangGraph agent
backed by Groq's `llama-3.3-70b-versatile` model extracts structured fields,
applies edits, and generates summaries, follow-ups, and sales insights.

## Tech Stack

| Layer     | Technology |
|-----------|------------|
| Frontend  | React, Redux Toolkit, TailwindCSS, Lucide Icons, Vite |
| Backend   | FastAPI, SQLAlchemy, PostgreSQL |
| AI        | LangGraph, LangChain, Groq (`llama-3.3-70b-versatile`) |

## Features

- **Structured form** — HCP name, interaction type, date/time, attendees /
  location, topics discussed, materials shared, samples distributed
  (add/remove chips), observed sentiment, outcomes, and follow-up actions.
- **Conversational AI chat** — free-text logging ("Log" mode) and free-text
  editing of the in-progress interaction ("Edit" mode), with auto-scroll,
  distinct user/assistant/success/error message styling, and a typing
  indicator.
- **AI Log Interaction tool** — extracts HCP name, location, products,
  materials, samples, sentiment, outcome, and follow-up from free text.
- **AI Edit Interaction tool** — updates only the fields explicitly
  mentioned in an edit request; every other field is preserved exactly as
  it was (enforced in code, not just prompted).
- **AI Summary tool** — always returns exactly 3 bullet points.
- **AI Follow-up tool** — always returns exactly 3 suggested actions.
- **AI Insights tool** — returns 3-5 sales-relevant insights.
- **Dashboard, History, and HCP Directory** — all derived from the same
  normalized Redux slice backed by `GET /interactions/`, no hardcoded demo
  data.

## Project Architecture

```text
ai-first-crm/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI app, CORS, router registration
│   │   ├── config.py              # env vars (DATABASE_URL, GROQ_API_KEY, GROQ_MODEL)
│   │   ├── database.py            # SQLAlchemy engine/session
│   │   ├── models/interaction.py  # Interaction ORM model
│   │   ├── schemas/interaction.py # Pydantic request/response schemas
│   │   ├── routers/               # One router per REST resource
│   │   │   ├── interaction.py     #   /interactions  (CRUD, persisted to Postgres)
│   │   │   ├── chat.py            #   /chat          (AI: log interaction)
│   │   │   ├── edit_chat.py       #   /edit-chat     (AI: edit interaction)
│   │   │   ├── summary.py         #   /summary       (AI: 3-bullet summary)
│   │   │   ├── follow_up.py       #   /follow-up     (AI: 3 follow-up actions)
│   │   │   └── insights.py        #   /insights      (AI: sales insights)
│   │   ├── agents/agent.py        # run_agent(tool, payload) -> graph.invoke(...)
│   │   ├── langgraph/
│   │   │   ├── state.py           # AgentState (tool, payload, response)
│   │   │   ├── graph.py           # the StateGraph: router -> 5 tool nodes -> END
│   │   │   └── tools.py           # the 5 tool node implementations
│   │   └── services/
│   │       ├── groq_service.py    # ChatGroq client, ask_groq(), parse_json_response()
│   │       ├── prompts.py         # shared prompt templates for all 5 tools
│   │       └── agent_runner.py    # run_ai_tool() -> run_agent() + HTTPException mapping
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── pages/                 # Dashboard, LogInteraction, History, HCPs
│       ├── components/ui/
│       │   ├── interaction/       # InteractionForm.jsx, AIChat.jsx
│       │   ├── layout/            # Sidebar, Header, MainLayout
│       │   └── dashboard/         # StatCard, RecentInteractions
│       ├── store/
│       │   ├── index.js           # configureStore({ interaction, history })
│       │   └── slices/
│       │       ├── interactionSlice.js  # in-progress form + AI summary/follow-ups/insights
│       │       └── historySlice.js      # normalized { ids, entities } interaction list
│       └── services/api.js        # axios instance + named API functions
└── README.md
```

## AI Flow (LangGraph)

A single compiled `StateGraph` (`app/langgraph/graph.py`) is the one entry
point for every AI action in the app:

```
                      ┌────────────────────┐
   run_agent(tool, ─▶ │       router       │
   payload)           │ (reads state.tool) │
                      └─────────┬──────────┘
                                │ conditional edge on `tool`
        ┌───────────┬───────────┼────────────┬─────────────┐
        ▼           ▼           ▼            ▼             ▼
  log_interaction edit_interaction summarize_interaction suggest_follow_up generate_insights
        │           │           │            │             │
        ▼           ▼           ▼            ▼             ▼
       END         END         END          END           END
```

- **Router**: an entry node that inspects `state["tool"]` and dispatches to
  exactly one of the five tool nodes via `add_conditional_edges`.
- **Each tool is independently callable**: `app.agents.agent.run_agent(tool, payload)`
  invokes the graph fresh for a single tool and returns its `response`, so
  routers never touch Groq or the graph directly — the assignment's "each
  tool must be callable individually" requirement is satisfied by this
  star/fan-out topology (rather than a strictly linear chain), since the
  frontend calls Log, Edit, Summary, Follow-up, and Insights as separate
  steps in its own sequence.
- **Shared plumbing**: every tool calls `ask_groq()` (never `ChatGroq`
  directly) and `parse_json_response()` for JSON extraction, both in
  `app/services/groq_service.py`, and shares prompt wording via
  `app/services/prompts.py`. Errors (`GroqServiceError`) are translated into
  clean `HTTPException`s by `app/services/agent_runner.run_ai_tool()`
  instead of leaking raw tracebacks.
- **Edit safety**: `edit_interaction_tool` merges the model's suggested
  changes onto `current_data` in Python and only accepts non-empty values
  for known fields — so even if the model misbehaves, an edit can never
  blank out an existing field.
- **Exact counts enforced in code, not just in the prompt**: `summarize_interaction_tool`
  always returns exactly 3 bullets and `suggest_follow_up_tool` always
  returns exactly 3 actions (padding/truncating if the model returns the
  wrong count).

## Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- PostgreSQL 14+ (or Docker, see below)
- A Groq API key (https://console.groq.com)

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_crm
GROQ_API_KEY=your_groq_api_key
# Optional — defaults to llama-3.3-70b-versatile (gemma2-9b-it is deprecated on Groq)
GROQ_MODEL=llama-3.3-70b-versatile
```

Create `frontend/.env` (optional — defaults to `http://127.0.0.1:8000`):

```env
VITE_API_URL=http://127.0.0.1:8000
```

## Running PostgreSQL

The included `backend/docker-compose.yml` starts Postgres (and pgAdmin) with
matching credentials:

```bash
cd backend
docker compose up -d
```

This exposes Postgres on `localhost:5432` (db `ai_crm`, user/password
`postgres`/`postgres` — matches the `DATABASE_URL` above) and pgAdmin on
`http://localhost:5050`. If you already have a local Postgres instance,
just point `DATABASE_URL` at it instead.

Tables are created automatically on first backend startup
(`Base.metadata.create_all`) — there's no separate migration step needed for
a fresh database. If you're upgrading an existing database created before
this update, add the new `updated_at` column manually:

```sql
ALTER TABLE interactions ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
```

## Running the Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API runs at `http://127.0.0.1:8000`; interactive docs at
`http://127.0.0.1:8000/docs`.

## Running the Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## API Reference

| Method | Path                     | Purpose                                             |
|--------|--------------------------|------------------------------------------------------|
| POST   | `/interactions/`         | Persist a finished interaction to PostgreSQL         |
| GET    | `/interactions/`         | List all interactions (used by History/Dashboard/HCPs)|
| GET    | `/interactions/{id}`     | Fetch a single interaction                           |
| POST   | `/chat/`                 | AI: extract interaction fields from free text        |
| POST   | `/edit-chat/`             | AI: apply a natural-language edit                    |
| POST   | `/summary/`               | AI: exactly 3-bullet summary                         |
| POST   | `/follow-up/`             | AI: exactly 3 follow-up actions                       |
| POST   | `/insights/`              | AI: 3-5 sales insights                                |

## Known Limitations

- Voice note capture is consent-gated but text-based (paste/type a
  transcript) — there's no microphone/audio-to-text pipeline in this build.
- The HCP Directory and Dashboard stats are derived client-side from the
  interaction list rather than dedicated backend aggregation endpoints;
  fine at demo scale, but would move server-side for large datasets.
- No authentication/authorization layer — out of scope for this assignment.
