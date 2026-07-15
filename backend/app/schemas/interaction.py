from datetime import date, datetime, time

from pydantic import BaseModel, field_validator

VALID_SENTIMENTS = {"Positive", "Neutral", "Negative"}


class InteractionCreate(BaseModel):
    hcp_name: str
    interaction_type: str
    interaction_date: date
    interaction_time: time

    location: str | None = None
    discussion: str | None = None
    products_discussed: str | None = None
    materials_shared: str | None = None
    samples_distributed: str | None = None

    sentiment: str | None = None
    outcome: str | None = None
    follow_up: str | None = None
    ai_summary: str | None = None

    @field_validator("sentiment")
    @classmethod
    def normalize_sentiment(cls, value: str | None) -> str | None:
        """Coerce anything outside Positive/Neutral/Negative to Neutral
        instead of rejecting the request outright (the AI tools already do
        this too, but the API should be defensive on its own)."""
        if not value:
            return value
        return value if value in VALID_SENTIMENTS else "Neutral"


class InteractionResponse(BaseModel):
    id: int
    hcp_name: str
    interaction_type: str | None = None
    interaction_date: date | None = None
    interaction_time: time | None = None
    location: str | None = None
    discussion: str | None = None
    products_discussed: str | None = None
    materials_shared: str | None = None
    samples_distributed: str | None = None
    sentiment: str | None = None
    outcome: str | None = None
    follow_up: str | None = None
    ai_summary: str | None = None
    created_at: datetime | None = None

    class Config:
        from_attributes = True
