from app.langgraph.graph import graph


def run_agent(tool: str, payload: dict):
    """Invoke the LangGraph agent for a single named tool and return its
    response payload. Errors raised inside a tool node (e.g. GroqServiceError)
    propagate up to the caller (the FastAPI router), which turns them into a
    clean HTTP error instead of a bare 500/KeyError.
    """
    result = graph.invoke(
        {
            "tool": tool,
            "payload": payload,
            "response": None,
        }
    )

    if "response" not in result:
        raise RuntimeError(f"LangGraph tool '{tool}' did not produce a response")

    return result["response"]
