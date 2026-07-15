from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.interaction import Interaction
from app.schemas.interaction import InteractionCreate, InteractionResponse

router = APIRouter(
    prefix="/interactions",
    tags=["Interactions"],
)


@router.post("/", response_model=InteractionResponse)
def create_interaction(
    interaction: InteractionCreate,
    db: Session = Depends(get_db),
):
    db_interaction = Interaction(**interaction.model_dump())

    try:
        db.add(db_interaction)
        db.commit()
        db.refresh(db_interaction)
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=400, detail=f"Could not save interaction: {exc}"
        ) from exc

    return db_interaction


@router.get("/", response_model=list[InteractionResponse])
def get_interactions(
    db: Session = Depends(get_db),
):
    return db.query(Interaction).order_by(Interaction.id.desc()).all()


@router.get("/{interaction_id}", response_model=InteractionResponse)
def get_interaction(
    interaction_id: int,
    db: Session = Depends(get_db),
):
    db_interaction = db.query(Interaction).filter(Interaction.id == interaction_id).first()

    if db_interaction is None:
        raise HTTPException(status_code=404, detail="Interaction not found")

    return db_interaction