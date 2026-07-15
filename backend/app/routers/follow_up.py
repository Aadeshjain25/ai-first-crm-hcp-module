from fastapi import APIRouter
from pydantic import BaseModel

from app.services.agent_runner import run_ai_tool

router = APIRouter(
    prefix="/follow-up",
    tags=["Follow Up"],
)


class FollowUpRequest(BaseModel):
    interaction: dict


@router.post("/")
def generate_follow_up(req: FollowUpRequest):
    """Return exactly 3 suggested follow-up actions as {"actions": [...]}"""
    return run_ai_tool(
        "suggest_follow_up",
        {
            "interaction": req.interaction,
        },
    )
