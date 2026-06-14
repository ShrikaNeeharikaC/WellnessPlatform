from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.checkin_service import CheckInService
from app.schemas.checkin import CheckInReview, CheckInOut
from app.schemas.user import UserOut
from app.core.dependencies import get_current_coach
from app.models.user import User, UserRole
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/coach", tags=["Coach"])


@router.get("/members", response_model=List[UserOut])
def get_assigned_members(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach),
):
    repo = UserRepository(db)
    return repo.get_by_role(UserRole.member.value)


@router.get("/members/{member_id}/checkins", response_model=List[CheckInOut])
def get_member_checkins(
    member_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_coach),
):
    return CheckInService(db).get_history(member_id)


@router.put("/checkins/{checkin_id}/review", response_model=CheckInOut)
def review_checkin(
    checkin_id: UUID,
    data: CheckInReview,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach),
):
    return CheckInService(db).add_coach_notes(checkin_id, current_user.id, data)
