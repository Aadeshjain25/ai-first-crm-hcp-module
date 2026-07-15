from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.agent_runner import run_ai_tool

router = APIRouter(
    prefix="/chat",
    tags=["AI Chat"],
)


class ChatRequest(BaseModel):
    message: str = Field(min_length=1)


@router.post("/")
def chat(req: ChatRequest):
    """Log a new HCP interaction from free-text via the Log Interaction tool."""
    return run_ai_tool(
        "log_interaction",
        {
            "message": req.message,
        },
    )
