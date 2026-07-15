from fastapi import APIRouter
from pydantic import BaseModel

from app.services.agent_runner import run_ai_tool

router = APIRouter(
    prefix="/summary",
    tags=["AI Summary"],
)


class SummaryRequest(BaseModel):
    interaction: dict


@router.post("/")
def generate_summary(req: SummaryRequest):
    """Return an exactly-3-bullet summary of the given interaction."""
    summary = run_ai_tool(
        "summarize_interaction",
        {
            "interaction": req.interaction,
        },
    )

    return {"summary": summary}
