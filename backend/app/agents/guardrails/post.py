import re
from app.agents.checkin_summary.state import CheckInSummaryState

_MAX_LENGTH = 600
_MIN_LENGTH = 40

# Strip any medical advice or external URLs the LLM might hallucinate
_BLOCKED_OUTPUT_PATTERNS = [
    (r'https?://\S+',                          "[link removed]"),
    (r'\b(diagnose|prescribe|medication|drug|dosage|therapy\s+session)\b',
     "[professional advice removed]"),
]


def run_post_guardrails(state: CheckInSummaryState) -> CheckInSummaryState:
    response = (state.get("raw_llm_response") or "").strip()

    # 1 — Minimum length check
    if len(response) < _MIN_LENGTH:
        return {
            **state,
            "post_guard_passed": False,
            "summary_message": "",
            "error_message": "LLM response was too short to be useful.",
        }

    # 2 — Strip disallowed content
    for pattern, replacement in _BLOCKED_OUTPUT_PATTERNS:
        response = re.sub(pattern, replacement, response, flags=re.IGNORECASE)

    # 3 — Trim to max length at the nearest sentence boundary
    if len(response) > _MAX_LENGTH:
        truncated = response[:_MAX_LENGTH]
        last_period = truncated.rfind('.')
        response = (truncated[:last_period + 1] if last_period > 0 else truncated).strip()

    return {
        **state,
        "post_guard_passed": True,
        "summary_message": response,
        "error_message": "",
    }
