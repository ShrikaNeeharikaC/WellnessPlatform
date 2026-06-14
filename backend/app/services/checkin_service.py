from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.checkin_repository import CheckInRepository
from app.schemas.checkin import CheckInCreate, CheckInReview, CheckInOut


class CheckInService:
    def __init__(self, db: Session):
        self.repo = CheckInRepository(db)

    def submit(self, user_id, data: CheckInCreate) -> CheckInOut:
        existing = self.repo.get_by_user_week(user_id, data.week_number, data.year)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Check-in for week {data.week_number}/{data.year} already submitted",
            )
        checkin = self.repo.create(user_id=user_id, **data.model_dump())
        return CheckInOut.model_validate(checkin)

    def get_history(self, user_id) -> List[CheckInOut]:
        checkins = self.repo.get_by_user(user_id)
        return [CheckInOut.model_validate(c) for c in checkins]

    def get_checkin(self, checkin_id) -> CheckInOut:
        checkin = self.repo.get(checkin_id)
        if not checkin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in not found")
        return CheckInOut.model_validate(checkin)

    def add_coach_notes(self, checkin_id, reviewer_id, data: CheckInReview) -> CheckInOut:
        from datetime import datetime, timezone
        checkin = self.repo.get(checkin_id)
        if not checkin:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Check-in not found")
        checkin = self.repo.update(
            checkin,
            coach_notes=data.coach_notes,
            reviewed_by=reviewer_id,
            reviewed_at=datetime.now(timezone.utc),
        )
        return CheckInOut.model_validate(checkin)
