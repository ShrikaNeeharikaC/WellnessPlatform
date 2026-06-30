import re
from app.agents.checkin_summary.state import CheckInSummaryState

# Patterns to redact from user-submitted comments before sending to LLM
_PII_PATTERNS = [
    r'\b[\w.+-]+@[\w-]+\.\w+\b',                          # email addresses
    r'\b(\+?\d[\d\s\-().]{7,}\d)\b',                      # phone numbers
    r'\b(passport|ssn|national\s+id|aadhar|pan)\b',        # ID document names
    r'\b\d{4}[\s\-]?\d{4}[\s\-]?\d{4}[\s\-]?\d{4}\b',   # card numbers
]

# Safety keywords — comments containing these get redacted, not blocked
_SAFETY_PATTERNS = [
    r'\b(suicide|self.harm|kill\s+myself|end\s+my\s+life)\b',
]


def run_pre_guardrails(state: CheckInSummaryState) -> CheckInSummaryState:
    comments = state.get("comments") or ""

    # 1 — Redact PII
    sanitized = comments
    for pattern in _PII_PATTERNS:
        sanitized = re.sub(pattern, "[REDACTED]", sanitized, flags=re.IGNORECASE)

    # 2 — Redact safety-sensitive phrases (keep comment, replace phrase)
    for pattern in _SAFETY_PATTERNS:
        sanitized = re.sub(pattern, "[sensitive content removed]", sanitized, flags=re.IGNORECASE)

    # 3 — Truncate to 500 chars to control token usage
    sanitized = sanitized.strip()[:500]

    # 4 — Validate numeric ranges
    pct = state.get("completion_percentage", 0)
    mood = state.get("mood_score", 5)

    if not (0 <= pct <= 100):
        return {**state, "pre_guard_passed": False,
                "pre_guard_reason": "completion_percentage out of range"}

    if not (1 <= mood <= 10):
        return {**state, "pre_guard_passed": False,
                "pre_guard_reason": "mood_score out of range"}

    return {
        **state,
        "sanitized_comments": sanitized,
        "pre_guard_passed": True,
        "pre_guard_reason": "",
    }
