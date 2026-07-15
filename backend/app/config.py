import os

from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
GROQ_API_KEY = os.getenv("GROQ_API_KEY")

# gemma2-9b-it has been deprecated on Groq. llama-3.3-70b-versatile is the
# supported default; override with the GROQ_MODEL env var if needed.
GROQ_MODEL = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL is not set. Create backend/.env with a valid "
        "PostgreSQL connection string (see README.md)."
    )

if not GROQ_API_KEY:
    raise RuntimeError(
        "GROQ_API_KEY is not set. Create backend/.env with a valid "
        "Groq API key (see README.md)."
    )
