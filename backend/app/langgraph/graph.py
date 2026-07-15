"""The single LangGraph StateGraph used by every AI route in the app.

Topology: a "router" entry node inspects state["tool"] and dispatches to
exactly one of the five tool nodes below (Log Interaction, Edit Interaction,
Summary, Follow Up, Insights), each of which is independently invokable via
app.agents.agent.run_agent(tool_name, payload) and terminates at END. This
satisfies "each tool should be callable individually" while still keeping a
single compiled graph, router, and shared AgentState as the one entry point
for all AI behavior in the app (routers never call the tool functions or
Groq directly).
"""

from langgraph.graph import END, StateGraph

from app.langgraph.state import AgentState
from app.langgraph.tools import (
    edit_interaction_tool,
    generate_insights_tool,
    log_interaction_tool,
    suggest_follow_up_tool,
    summarize_interaction_tool,
)


def route_tool(state: AgentState) -> str:
    return state["tool"]


builder = StateGraph(AgentState)

builder.add_node("router", lambda state: state)
builder.add_node("log_interaction", log_interaction_tool)
builder.add_node("edit_interaction", edit_interaction_tool)
builder.add_node("summarize_interaction", summarize_interaction_tool)
builder.add_node("suggest_follow_up", suggest_follow_up_tool)
builder.add_node("generate_insights", generate_insights_tool)

builder.set_entry_point("router")

builder.add_conditional_edges(
    "router",
    route_tool,
    {
        "log_interaction": "log_interaction",
        "edit_interaction": "edit_interaction",
        "summarize_interaction": "summarize_interaction",
        "suggest_follow_up": "suggest_follow_up",
        "generate_insights": "generate_insights",
    },
)

builder.add_edge("log_interaction", END)
builder.add_edge("edit_interaction", END)
builder.add_edge("summarize_interaction", END)
builder.add_edge("suggest_follow_up", END)
builder.add_edge("generate_insights", END)

graph = builder.compile()
