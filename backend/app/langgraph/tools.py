"""LangGraph tool node implementations.

Each function takes the graph's AgentState and returns a partial state update
(`{"response": ...}`). Every tool talks to Groq only through
`app.services.groq_service` (never the raw `llm` object) so error handling
and JSON parsing stay in one place.
"""

from datetime import date

from app.langgraph.state import AgentState
from app.services.groq_service import ask_groq, parse_json_response
from app.services.prompts import (
    build_edit_interaction_prompt,
    build_follow_up_prompt,
    build_insights_prompt,
    build_log_interaction_prompt,
    build_summary_prompt,
)

VALID_SENTIMENTS = {"Positive", "Neutral", "Negative"}

# The only fields an edit is ever allowed to touch. Keeps a misbehaving LLM
# response from injecting arbitrary keys into a saved interaction.
EDITABLE_INTERACTION_FIELDS = {
    "hcp_name",
    "interaction_type",
    "interaction_date",
    "interaction_time",
    "location",
    "discussion",
    "products_discussed",
    "materials_shared",
    "samples_distributed",
    "sentiment",
    "outcome",
    "follow_up",
}

INTERACTION_FIELD_DEFAULTS = {field: "" for field in EDITABLE_INTERACTION_FIELDS}


def _normalize_interaction_fields(data: dict) -> dict:
    """Fill in any missing keys and coerce sentiment to a valid value."""
    if not isinstance(data, dict):
        data = {}

    normalized = {**INTERACTION_FIELD_DEFAULTS}
    for key in EDITABLE_INTERACTION_FIELDS:
        value = data.get(key, "")
        normalized[key] = "" if value is None else str(value).strip()

    if normalized["sentiment"] not in VALID_SENTIMENTS:
        normalized["sentiment"] = "Neutral"

    return normalized


def _extract_bullets(raw: str, expected: int, fallback_prefix: str) -> list[str]:
    """Pull up to `expected` bullet lines out of raw model text.

    Tolerates "-", "*", "•" markers and numbered lists ("1.", "1)"), and
    pads/truncates so the caller always gets exactly `expected` items.
    """
    lines = []
    for line in raw.strip().splitlines():
        line = line.strip()
        if not line:
            continue
        line = line.lstrip("-*•").strip()
        line = line.lstrip("0123456789.)").strip() if line[:1].isdigit() else line
        if line:
            lines.append(line)

    if len(lines) > expected:
        lines = lines[:expected]
    while len(lines) < expected:
        lines.append(f"{fallback_prefix} #{len(lines) + 1}")

    return lines


def _coerce_string_list(value, expected: int, fallback_prefix: str) -> list[str]:
    items = [str(item).strip() for item in value if str(item).strip()] if isinstance(value, list) else []

    if len(items) > expected:
        items = items[:expected]
    while len(items) < expected:
        items.append(f"{fallback_prefix} #{len(items) + 1}")

    return items


def log_interaction_tool(state: AgentState) -> dict:
    message = state["payload"]["message"]

    prompt = build_log_interaction_prompt(message, today=date.today().isoformat())
    raw = ask_groq(prompt)
    data = parse_json_response(raw)

    return {"response": _normalize_interaction_fields(data)}


def edit_interaction_tool(state: AgentState) -> dict:
    payload = state["payload"]
    current_data = payload.get("current_data") or {}
    message = payload["message"]

    prompt = build_edit_interaction_prompt(current_data, message)
    raw = ask_groq(prompt)
    changes = parse_json_response(raw)

    if not isinstance(changes, dict):
        changes = {}

    # Defense in depth: only ever apply non-empty values for known fields.
    # This guarantees an edit can never blank out an existing value, even if
    # the model ignores the prompt's instructions.
    merged = dict(current_data)
    for key, value in changes.items():
        if key not in EDITABLE_INTERACTION_FIELDS:
            continue
        if value is None:
            continue
        value = str(value).strip()
        if value:
            merged[key] = value

    return {"response": _normalize_interaction_fields(merged)}


def summarize_interaction_tool(state: AgentState) -> dict:
    interaction = state["payload"]["interaction"]

    prompt = build_summary_prompt(interaction)
    raw = ask_groq(prompt)
    bullets = _extract_bullets(raw, expected=3, fallback_prefix="Note")

    return {"response": "\n".join(f"- {bullet}" for bullet in bullets)}


def suggest_follow_up_tool(state: AgentState) -> dict:
    interaction = state["payload"]["interaction"]
    hcp_name = interaction.get("hcp_name") or "the HCP"

    prompt = build_follow_up_prompt(interaction)
    raw = ask_groq(prompt)
    data = parse_json_response(raw)

    actions = data.get("actions") if isinstance(data, dict) else data
    actions = _coerce_string_list(
        actions, expected=3, fallback_prefix=f"Follow up with {hcp_name}"
    )

    return {"response": {"actions": actions}}


def generate_insights_tool(state: AgentState) -> dict:
    interaction = state["payload"]["interaction"]

    prompt = build_insights_prompt(interaction)
    raw = ask_groq(prompt)
    data = parse_json_response(raw)

    insights = data.get("insights") if isinstance(data, dict) else data
    if not isinstance(insights, list):
        insights = []
    insights = [str(item).strip() for item in insights if str(item).strip()]

    if not insights:
        insights = ["Not enough interaction detail to generate a sales insight yet."]

    return {"response": {"insights": insights}}
