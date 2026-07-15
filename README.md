# AI-First CRM - HCP Interaction Module

This project is an AI-first CRM module for healthcare and life sciences field representatives. It focuses on the HCP interaction workflow, allowing reps to log interactions through either a structured form or a conversational AI assistant.

The app uses a React + Redux frontend, a FastAPI backend, PostgreSQL for persistence, and a LangGraph-powered AI workflow backed by Groq's `llama-3.3-70b-versatile` model.

## What This Project Does

- Log HCP interactions using a structured form
- Log and edit interactions using a chat-based AI assistant
- Generate AI summaries for logged interactions
- Suggest follow-up actions for the rep
- Generate sales-facing insights from interaction data
- Show saved interactions in History, Dashboard, and HCP Directory views

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Redux Toolkit, Vite, Tailwind CSS |
| Backend | FastAPI, SQLAlchemy |
| AI Orchestration | LangGraph |
| LLM | Groq `llama-3.3-70b-versatile` |
| Database | PostgreSQL |

## Core Screens

- `Dashboard`: summary metrics and recent interactions
- `Log Interaction`: structured form + AI chat assistant
- `History`: saved HCP interaction records
- `HCP Directory`: derived HCP list based on saved interactions

## LangGraph Tools

The LangGraph agent exposes five tools:

1. `log_interaction`
   Extracts structured interaction fields from free-text chat input.
2. `edit_interaction`
   Applies natural-language edits to the current interaction without blanking unrelated fields.
3. `summarize_interaction`
   Generates a 3-bullet interaction summary.
4. `suggest_follow_up`
   Suggests 3 next-step actions for the rep.
5. `generate_insights`
   Produces sales-relevant insights from the interaction.

## Project Structure

```text
ai-first-crm/
├── backend/
│   ├── app/
│   │   ├── agents/
│   │   ├── langgraph/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── config.py
│   │   ├── database.py
│   │   └── main.py
│   ├── requirements.txt
│   └── docker-compose.yml
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   ├── package.json
│   └── index.html
└── README.md
```

## Environment Variables

Create `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_crm
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.3-70b-versatile
```

Optional frontend env at `frontend/.env`:

```env
VITE_API_URL=http://localhost:8000
```

If `VITE_API_URL` is not set, the frontend will use the current browser hostname and port `8000`.

## How to Run the Project

### 1. Start PostgreSQL

If you want to use Docker:

```bash
cd backend
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- pgAdmin on `http://localhost:5050`

### 2. Start the Backend

From the project root:

```bash
cd backend
python -m venv venv
```

Activate the environment:

Windows:

```bash
venv\Scripts\activate
```

macOS/Linux:

```bash
source venv/bin/activate
```

Install dependencies and run the API:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend URLs:

- API root: `http://localhost:8000/`
- Swagger docs: `http://localhost:8000/docs`

### 3. Start the Frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/interactions/` | Save a completed interaction |
| `GET` | `/interactions/` | Fetch all interactions |
| `GET` | `/interactions/{id}` | Fetch one interaction |
| `POST` | `/chat/` | AI log interaction |
| `POST` | `/edit-chat/` | AI edit interaction |
| `POST` | `/summary/` | AI summary generation |
| `POST` | `/follow-up/` | AI follow-up suggestions |
| `POST` | `/insights/` | AI insight generation |

## Notes for Demo / Submission

- The main assignment focus is the `Log Interaction` workflow.
- History, Dashboard, and HCP Directory are powered by the same saved interaction dataset.
- The AI flow is orchestrated through one LangGraph graph with independently callable tools.

## Troubleshooting

### History page shows a network error

Check the following:

- Backend is running on `http://localhost:8000`
- Frontend is running on `http://localhost:5173`
- PostgreSQL is running and `DATABASE_URL` is valid
- `GROQ_API_KEY` is present in `backend/.env`

### CORS error in browser

Make sure you are opening the frontend on `localhost:5173` and the backend on `localhost:8000`.

### Backend starts but `/interactions/` fails

This usually means the database is unavailable or the connection string is incorrect.

## Current Limitations

- No authentication/authorization layer
- Voice note support is transcript-based, not real audio recording
- Dashboard metrics are derived from saved interactions rather than dedicated analytics endpoints

