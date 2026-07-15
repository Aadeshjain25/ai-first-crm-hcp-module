"""Prompt templates for every LangGraph tool.

Kept in one place so the five tools in app/langgraph/tools.py share the same
persona, JSON-formatting rules, and field vocabulary instead of re-typing
slightly different wording per tool.
"""

import json

PERSONA = (
    "You are an AI Medical CRM assistant that helps pharmaceutical field "
    "representatives log, edit, and analyze their HCP (Healthcare "
    "Professional) interactions."
)

JSON_ONLY_RULES = """Rules:
- Respond with ONLY a single valid JSON value (object or array).
- Do not wrap the JSON in markdown code fences.
- Do not include any explanation, preamble, or text outside the JSON.
"""

INTERACTION_FIELDS_JSON_SHAPE = """{
  "hcp_name": "",
  "interaction_type": "",
  "interaction_date": "",
  "interaction_time": "",
  "location": "",
  "discussion": "",
  "products_discussed": "",
  "materials_shared": "",
  "samples_distributed": "",
  "sentiment": "",
  "outcome": "",
  "follow_up": ""
}"""

FIELD_GUIDANCE = """Field guidance:
- hcp_name: the doctor / healthcare professional's name.
- interaction_type: one of "Meeting", "Phone Call", "Video Call", "Email". \
Use "Meeting" for in-person visits, "Phone Call" for phone, "Video Call" for \
video/virtual, "Email" for email. Default to "Meeting" if not mentioned.
- interaction_date / interaction_time: only fill these if a specific day or \
time is mentioned (e.g. "yesterday", "this morning", "at 3pm"); use an ISO \
date (YYYY-MM-DD) and 24h time (HH:MM). Leave as "" otherwise.
- location: clinic, hospital, attendees, or meeting location mentioned.
- discussion: a concise summary of the topics discussed.
- products_discussed: product/drug names mentioned, comma separated.
- materials_shared: brochures or materials mentioned, comma separated.
- samples_distributed: samples mentioned, comma separated.
- sentiment: exactly one of "Positive", "Neutral", "Negative". Positive if \
the HCP is interested, asks for more evidence, requests samples, or agrees \
to a follow-up. Negative if dismissive or declines further contact. \
Neutral otherwise.
- outcome: the key result or agreement reached.
- follow_up: the next step or action agreed on, if any.
"""


def build_log_interaction_prompt(message: str, today: str) -> str:
    return f"""{PERSONA}

Extract structured HCP interaction details from the field rep's message below.
Today's date is {today}.

{FIELD_GUIDANCE}
{JSON_ONLY_RULES}
Use an empty string "" for any field that is not mentioned. Do not invent
information that isn't in the message.

JSON shape:
{INTERACTION_FIELDS_JSON_SHAPE}

Field rep's message:
\"\"\"{message}\"\"\"
"""


def build_edit_interaction_prompt(current_data: dict, message: str) -> str:
    current_json = json.dumps(current_data, indent=2, default=str)
    return f"""{PERSONA}

The rep is editing a previously logged interaction. Here is the current
record (JSON):
{current_json}

The rep's requested change:
\"\"\"{message}\"\"\"

{FIELD_GUIDANCE}
Rules:
- Return ONLY a JSON object containing the fields that should change, based
  strictly on the rep's requested change above.
- Do NOT include any field the rep did not ask to change.
- Do NOT return empty strings, nulls, or placeholder values for any field.
- Never invent or modify a field the rep did not mention.
- Do not wrap the JSON in markdown code fences.

Example: if the rep only says "change sentiment to negative", return
{{"sentiment": "Negative"}} and nothing else.
"""


def build_summary_prompt(interaction: dict) -> str:
    interaction_json = json.dumps(interaction, indent=2, default=str)
    return f"""{PERSONA}

Summarize the HCP interaction below for a sales manager reviewing field
activity.

Interaction (JSON):
{interaction_json}

Rules:
- Return EXACTLY 3 bullet points, no more, no fewer.
- Each bullet must be on its own line, starting with "- ".
- Keep each bullet concise (under 20 words).
- Cover: who/what was discussed, the HCP's sentiment/outcome, and any
  follow-up or next step.
- Do not include any heading, preamble, or text other than the 3 bullets.
"""


def build_follow_up_prompt(interaction: dict) -> str:
    interaction_json = json.dumps(interaction, indent=2, default=str)
    return f"""{PERSONA}

Suggest concrete follow-up actions for the field rep based on this
interaction.

Interaction (JSON):
{interaction_json}

Rules:
- Return EXACTLY 3 follow-up actions, no more, no fewer.
- Each action must be specific and actionable (e.g. "Schedule a follow-up
  call with Dr. Smith next week to review trial data"), not generic.
- Base the actions on the interaction's outcome, sentiment, and any
  follow-up already mentioned.
{JSON_ONLY_RULES}
JSON shape:
{{"actions": ["...", "...", "..."]}}
"""


def build_insights_prompt(interaction: dict) -> str:
    interaction_json = json.dumps(interaction, indent=2, default=str)
    return f"""{PERSONA}

Generate meaningful sales insights from this HCP interaction for a
pharmaceutical sales manager. Focus on patterns, risks, or opportunities
that would help prioritize future engagement with this HCP.

Interaction (JSON):
{interaction_json}

Rules:
- Return 3 to 5 insights, each a specific, non-generic observation tied to
  the actual interaction data (sentiment, products discussed, outcome,
  materials/samples shared).
- Avoid vague statements like "the interaction went well".
{JSON_ONLY_RULES}
JSON shape:
{{"insights": ["...", "...", "..."]}}
"""
