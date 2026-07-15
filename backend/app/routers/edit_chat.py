from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.services.agent_runner import run_ai_tool

router = APIRouter(
    prefix="/edit-chat",
    tags=["Edit Interaction"],
)


class EditRequest(BaseModel):
    current_data: dict
    message: str = Field(min_length=1)


@router.post("/")
def edit_interaction(req: EditRequest):
    """Apply a natural-language edit on top of the in-progress interaction.

    Only fields explicitly mentioned in `message` are changed; every other
    field in `current_data` is preserved (see edit_interaction_tool).
    """
    return run_ai_tool(
        "edit_interaction",
        {
            "current_data": req.current_data,
            "message": req.message,
        },
    )
