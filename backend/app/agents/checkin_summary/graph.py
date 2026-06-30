from langgraph.graph import StateGraph, END
from app.agents.checkin_summary.state import CheckInSummaryState
from app.agents.checkin_summary.nodes import pre_guardrail_node, llm_node, post_guardrail_node


def _route_after_pre_guard(state: CheckInSummaryState) -> str:
    return "llm_call" if state.get("pre_guard_passed") else END


def build_graph():
    graph = StateGraph(CheckInSummaryState)

    graph.add_node("pre_guardrails",  pre_guardrail_node)
    graph.add_node("llm_call",        llm_node)
    graph.add_node("post_guardrails", post_guardrail_node)

    graph.set_entry_point("pre_guardrails")

    graph.add_conditional_edges("pre_guardrails", _route_after_pre_guard)
    graph.add_edge("llm_call",        "post_guardrails")
    graph.add_edge("post_guardrails", END)

    return graph.compile()


# Compiled once at import time — reused for every request
checkin_summary_graph = build_graph()


def generate_checkin_summary(
    member_name: str,
    completion_percentage: int,
    mood_score: int,
    comments: str,
    week_number: int,
    year: int,
    past_checkins: list,
) -> str:
    """
    Run the check-in summary graph and return the summary string.
    Returns an empty string if the LLM call or guardrails fail
    so the check-in submission itself is never blocked.
    """
    try:
        result = checkin_summary_graph.invoke({
            "member_name":           member_name,
            "completion_percentage": completion_percentage,
            "mood_score":            mood_score or 5,
            "comments":              comments or "",
            "week_number":           week_number,
            "year":                  year,
            "past_checkins":         past_checkins,
            "sanitized_comments":    "",
            "pre_guard_passed":      False,
            "pre_guard_reason":      "",
            "raw_llm_response":      "",
            "post_guard_passed":     False,
            "summary_message":       "",
            "error_message":         "",
        })
        return result.get("summary_message", "")
    except Exception as e:
        import traceback
        print(f"[AI Summary ERROR] {e}")
        traceback.print_exc()
        return ""
