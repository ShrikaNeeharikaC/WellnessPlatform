from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_member
from app.models.user import User
from app.schemas.appointment import ChatMessageIn, ChatResponse
from app.agents.appointment.agent import run_appointment_agent

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/appointment", response_model=ChatResponse)
def appointment_chat(
    body: ChatMessageIn,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    """
    Natural language appointment scheduling via LangGraph + Gemini.
    The agent reads the DB via MCP-style tools and books/queries appointments.
    """
    if not body.message.strip():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Message cannot be empty")

    try:
        result = run_appointment_agent(
            message=body.message,
            member_id=str(current_user.id),
            db=db,
            current_dt=datetime.now(timezone.utc),
        )
    except Exception as e:
        import traceback
        traceback.print_exc()
        return ChatResponse(
            message="Sorry, I'm having trouble connecting to the scheduling service right now. Please try again shortly.",
            action="no_action",
        )

    return ChatResponse(**result)
