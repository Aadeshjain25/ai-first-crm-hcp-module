"""Shared helper so every AI router calls the LangGraph agent the same way.

Turns GroqServiceError (bad/failed LLM call) into a 502 and any other
unexpected failure into a 500, instead of letting FastAPI's default
unhandled-exception behavior leak a raw traceback to the client.
"""

from fastapi import HTTPException

from app.agents.agent import run_agent
from app.services.groq_service import GroqServiceError


def run_ai_tool(tool: str, payload: dict):
    try:
        return run_agent(tool, payload)
    except GroqServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except KeyError as exc:
        raise HTTPException(
            status_code=422, detail=f"Missing required field: {exc}"
        ) from exc
    except Exception as exc:  # noqa: BLE001 - guarantees a clean JSON error
        raise HTTPException(status_code=500, detail=f"AI tool failed: {exc}") from exc
