from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.checkin_service import CheckInService
from app.schemas.checkin import CheckInCreate, CheckInOut
from app.core.dependencies import get_current_member
from app.models.user import User
from app.agents.checkin_summary.graph import generate_checkin_summary

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])


@router.post("", response_model=CheckInOut, status_code=status.HTTP_201_CREATED)
def submit_checkin(
    data: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    service = CheckInService(db)
    checkin = service.submit(current_user.id, data)

    # Fetch last 3 check-ins for trend context (excludes the one just submitted)
    history = service.get_history(current_user.id)
    past = [
        {
            "week_number":           c.week_number,
            "year":                  c.year,
            "completion_percentage": c.completion_percentage,
            "mood_score":            c.mood_score,
        }
        for c in history
        if str(c.id) != str(checkin.id)
    ][:3]

    # Generate AI summary — never blocks the response if it fails
    summary = generate_checkin_summary(
        member_name=current_user.first_name,
        completion_percentage=data.completion_percentage,
        mood_score=data.mood_score or 5,
        comments=data.comments or "",
        week_number=data.week_number,
        year=data.year,
        past_checkins=past,
    )

    checkin.summary_message = summary
    return checkin


@router.get("", response_model=List[CheckInOut])
def get_checkin_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return CheckInService(db).get_history(current_user.id)


@router.get("/{checkin_id}", response_model=CheckInOut)
def get_checkin(
    checkin_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return CheckInService(db).get_checkin(checkin_id)
