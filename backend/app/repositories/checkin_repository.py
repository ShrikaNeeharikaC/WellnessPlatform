from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.checkin import CheckIn
from app.repositories.base import BaseRepository


class CheckInRepository(BaseRepository[CheckIn]):
    def __init__(self, db: Session):
        super().__init__(CheckIn, db)

    def get_by_user(self, user_id) -> List[CheckIn]:
        return (
            self.db.query(CheckIn)
            .filter(CheckIn.user_id == user_id)
            .order_by(CheckIn.year.desc(), CheckIn.week_number.desc())
            .all()
        )

    def get_by_user_week(self, user_id, week: int, year: int) -> Optional[CheckIn]:
        return (
            self.db.query(CheckIn)
            .filter(
                CheckIn.user_id     == user_id,
                CheckIn.week_number == week,
                CheckIn.year        == year,
            )
            .first()
        )

    def get_unreviewed(self) -> List[CheckIn]:
        return self.db.query(CheckIn).filter(CheckIn.reviewed_by == None).all()
