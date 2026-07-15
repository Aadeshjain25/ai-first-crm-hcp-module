"""Thin wrapper around the Groq LLM client used by every LangGraph tool.

Centralizes the model call and the JSON-extraction logic so tools.py never
talks to the network or parses raw model output directly.
"""

import json
import re

from langchain_groq import ChatGroq

from app.config import GROQ_API_KEY, GROQ_MODEL


class GroqServiceError(Exception):
    """Raised when the Groq call fails or its response can't be parsed."""


llm = ChatGroq(
    api_key=GROQ_API_KEY,
    model=GROQ_MODEL,
    temperature=0,
)

_CODE_FENCE_RE = re.compile(r"^```(?:json)?\s*|\s*```$", re.IGNORECASE | re.MULTILINE)
_JSON_BLOCK_RE = re.compile(r"(\{.*\}|\[.*\])", re.DOTALL)


def ask_groq(prompt: str) -> str:
    """Call the LLM and return its raw text content.

    Raises GroqServiceError on network/auth failures or an empty response so
    callers can turn it into a clean HTTP error instead of a bare 500.
    """
    try:
        response = llm.invoke(prompt)
    except Exception as exc:  # noqa: BLE001 - surface any provider failure uniformly
        raise GroqServiceError(f"Groq request failed: {exc}") from exc

    content = getattr(response, "content", None)
    if not content or not isinstance(content, str):
        raise GroqServiceError("Groq returned an empty or invalid response")

    return content


def parse_json_response(raw: str) -> dict | list:
    """Best-effort parsing of a JSON object/array out of raw LLM text.

    Handles the common failure modes seen from Groq/llama models:
    - the whole thing wrapped in ```json ... ``` (or plain ```) fences
    - leading/trailing prose around the JSON payload
    """
    cleaned = _CODE_FENCE_RE.sub("", raw.strip()).strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        pass

    match = _JSON_BLOCK_RE.search(cleaned)
    if match:
        try:
            return json.loads(match.group(1))
        except json.JSONDecodeError as exc:
            raise GroqServiceError(
                f"Model response did not contain valid JSON: {exc}"
            ) from exc

    raise GroqServiceError("Model response did not contain any JSON payload")
