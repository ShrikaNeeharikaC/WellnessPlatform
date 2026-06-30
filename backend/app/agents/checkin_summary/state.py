from typing import TypedDict, Optional


class CheckInSummaryState(TypedDict):
    # ── Input ──────────────────────────────────────────────────────────────
    member_name:           str
    completion_percentage: int
    mood_score:            int
    comments:              str
    week_number:           int
    year:                  int
    past_checkins:         list   # last 3 check-ins for trend context

    # ── Pre-guardrail ──────────────────────────────────────────────────────
    sanitized_comments:    str
    pre_guard_passed:      bool
    pre_guard_reason:      str

    # ── LLM output ─────────────────────────────────────────────────────────
    raw_llm_response:      str

    # ── Post-guardrail / final ─────────────────────────────────────────────
    post_guard_passed:     bool
    summary_message:       str
    error_message:         str
