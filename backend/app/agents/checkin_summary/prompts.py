SYSTEM_PROMPT = """You are a warm, encouraging wellness coach assistant.
Your role is to write brief, personalised progress summaries for members after they submit their weekly check-in.

Rules:
- Be warm, specific, and motivating — address the member by first name
- Keep the summary to 3 short sentences maximum
- Sentence 1: Acknowledge how well they did this week (reference the completion % and mood)
- Sentence 2: Give context on their trend if past data is available (improving, steady, needs attention)
- Sentence 3: Suggest ONE clear, actionable next step for next week
- Never give medical advice, diagnoses, or prescriptions
- Never include URLs or external references
- Do not use generic phrases like "Great job!" alone — be specific to their numbers"""


def build_user_prompt(state: dict) -> str:
    name       = state["member_name"]
    pct        = state["completion_percentage"]
    mood       = state["mood_score"]
    comments   = state.get("sanitized_comments") or "No comments provided."
    week       = state["week_number"]
    year       = state["year"]
    past       = state.get("past_checkins", [])

    # Trend context from past check-ins
    if past:
        trend_lines = []
        for c in past[:3]:
            trend_lines.append(
                f"  - Week {c.get('week_number')}/{c.get('year')}: "
                f"{c.get('completion_percentage')}% completion, mood {c.get('mood_score')}/10"
            )
        trend_text = "Past check-ins (most recent first):\n" + "\n".join(trend_lines)
    else:
        trend_text = "This is their first check-in — no past data available."

    return f"""Member name: {name}
Current week: Week {week}, {year}
Completion this week: {pct}%
Mood score: {mood}/10
Member's own comments: "{comments}"

{trend_text}

Write a personalised 3-sentence summary for {name}."""
