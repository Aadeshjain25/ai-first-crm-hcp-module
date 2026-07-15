from fastapi import APIRouter
from pydantic import BaseModel

from app.services.agent_runner import run_ai_tool

router = APIRouter(
    prefix="/insights",
    tags=["Insights"],
)


class InsightRequest(BaseModel):
    interaction: dict


@router.post("/")
def generate_insights(req: InsightRequest):
    """Return meaningful sales insights as {"insights": [...]}"""
    return run_ai_tool(
        "generate_insights",
        {
            "interaction": req.interaction,
        },
    )
