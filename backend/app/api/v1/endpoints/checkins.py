from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.checkin_service import CheckInService
from app.schemas.checkin import CheckInCreate, CheckInOut
from app.core.dependencies import get_current_member
from app.models.user import User

router = APIRouter(prefix="/checkins", tags=["Check-Ins"])


@router.post("", response_model=CheckInOut, status_code=status.HTTP_201_CREATED)
def submit_checkin(
    data: CheckInCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return CheckInService(db).submit(current_user.id, data)


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
