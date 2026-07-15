import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import Base, engine
from app.models.interaction import Interaction  # noqa: F401 - registers the table with Base
from app.routers import edit_chat, follow_up, insights, interaction, summary
from app.routers.chat import router as chat_router

app = FastAPI(
    title="AI First CRM API",
    version="1.0.0",
)

# Dev convenience: creates tables on first boot if they don't already exist.
# For schema changes on an existing database, run the migration manually
# (see README.md) since there's no Alembic migration chain set up.
Base.metadata.create_all(bind=engine)

# Support the common local frontend origins out of the box. Users can still
# override/extend this with CORS_ORIGINS in the environment.
_default_origins = ",".join(
    [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:4173",
        "http://127.0.0.1:4173",
    ]
)
cors_origins = [
    origin.strip()
    for origin in os.getenv("CORS_ORIGINS", _default_origins).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(interaction.router)
app.include_router(chat_router)
app.include_router(edit_chat.router)
app.include_router(summary.router)
app.include_router(follow_up.router)
app.include_router(insights.router)


@app.get("/")
def root():
    return {"message": "AI First CRM Backend Running"}
