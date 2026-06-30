"""
LangGraph ReAct agent for appointment scheduling.
The agent uses MCP-style tools (LangChain @tool functions) to read/write
the appointments database, allowing the LLM to act on natural language
scheduling requests.
"""
import json
from datetime import datetime, timezone
from typing import Optional

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage, ToolMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from sqlalchemy.orm import Session

from app.core.config import settings
from app.agents.appointment.tools import make_appointment_tools

_SYSTEM_TEMPLATE = """You are a wellness appointment scheduling assistant for WellnessHub.

Current date and time (UTC): {current_datetime}

Your role is to help members book, check, and manage appointments with their assigned wellness coach.

Rules:
- Always use tools to fetch real data — never guess availability.
- When a member asks to book a slot: first call check_slot_available.
  - If available → call book_appointment immediately and confirm the booking.
  - If not available → call get_free_slots and list the options clearly, asking the member to choose.
- When a member says "book the slot at [datetime_iso]" — call book_appointment directly.
- Present dates in a friendly format like "Tuesday, June 24 at 2:00 PM UTC".
- Keep responses concise and friendly (2–4 sentences).
- If the member has no coach assigned, tell them to contact their admin.
- Never invent appointment times or availability.
"""


def _extract_structured(messages: list) -> tuple[Optional[dict], Optional[list]]:
    """Pull booking result and slot list out of ToolMessage history."""
    booked = None
    slots  = None

    for msg in messages:
        if not isinstance(msg, ToolMessage):
            continue

        try:
            data = json.loads(msg.content) if isinstance(msg.content, str) else msg.content
        except Exception:
            continue

        if msg.name == "book_appointment" and isinstance(data, dict) and data.get("success"):
            booked = data.get("appointment")

        elif msg.name == "get_free_slots" and isinstance(data, list) and data:
            slots = data

    return booked, slots


def run_appointment_agent(
    message: str,
    member_id: str,
    db: Session,
    current_dt: Optional[datetime] = None,
) -> dict:
    """
    Run the appointment scheduling agent and return a structured response.

    Returns:
        {
            "message": str,          # Natural language reply for the chat UI
            "action": str,           # "booked" | "slots_shown" | "no_action"
            "appointment": dict|None,
            "available_slots": list|None,
        }
    """
    if current_dt is None:
        current_dt = datetime.now(timezone.utc)

    tools = make_appointment_tools(db, member_id, current_dt)

    llm = ChatGoogleGenerativeAI(
        model=settings.GEMINI_MODEL,
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0.3,
        max_output_tokens=400,
    )

    system_prompt = _SYSTEM_TEMPLATE.format(
        current_datetime=current_dt.strftime("%A, %B %d, %Y at %I:%M %p")
    )

    agent = create_react_agent(llm, tools)

    result = agent.invoke({
        "messages": [
            SystemMessage(content=system_prompt),
            HumanMessage(content=message),
        ]
    })

    messages = result.get("messages", [])

    # Extract final AI text
    ai_text = ""
    for msg in reversed(messages):
        if isinstance(msg, AIMessage) and not getattr(msg, "tool_calls", None):
            ai_text = msg.content if isinstance(msg.content, str) else str(msg.content)
            break

    booked, slots = _extract_structured(messages)

    action = "booked" if booked else ("slots_shown" if slots else "no_action")

    return {
        "message":         ai_text or "I'm here to help you schedule appointments!",
        "action":          action,
        "appointment":     booked,
        "available_slots": slots,
    }
