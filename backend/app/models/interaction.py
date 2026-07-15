from sqlalchemy import Column, Integer, String, Text, Date, Time, DateTime
from sqlalchemy.sql import func

from app.database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(Integer, primary_key=True, index=True)

    hcp_name = Column(String(255), nullable=False)

    interaction_type = Column(String(100))

    interaction_date = Column(Date)

    interaction_time = Column(Time)

    location = Column(String(255))

    discussion = Column(Text)

    products_discussed = Column(Text)

    materials_shared = Column(Text)

    samples_distributed = Column(Text)

    sentiment = Column(String(50))

    outcome = Column(Text)

    follow_up = Column(Text)

    ai_summary = Column(Text)

    created_at = Column(DateTime(timezone=True), server_default=func.now())
