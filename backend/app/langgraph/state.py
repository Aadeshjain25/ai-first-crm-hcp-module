from typing import Any, TypedDict


class AgentState(TypedDict):
    tool: str
    payload: dict[str, Any]
    response: Any
