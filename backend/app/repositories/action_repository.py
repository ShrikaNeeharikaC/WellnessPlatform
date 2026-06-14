from typing import List, Optional
from sqlalchemy.orm import Session
from app.models.weekly_action import WeeklyAction
from app.repositories.base import BaseRepository


class ActionRepository(BaseRepository[WeeklyAction]):
    def __init__(self, db: Session):
        super().__init__(WeeklyAction, db)

    def get_by_user_week(self, user_id, week: int, year: int) -> List[WeeklyAction]:
        return (
            self.db.query(WeeklyAction)
            .filter(
                WeeklyAction.user_id    == user_id,
                WeeklyAction.week_number == week,
                WeeklyAction.year        == year,
            )
            .all()
        )

    def get_pending_by_user(self, user_id) -> List[WeeklyAction]:
        return (
            self.db.query(WeeklyAction)
            .filter(WeeklyAction.user_id == user_id, WeeklyAction.status == "pending")
            .all()
        )

    def get_by_user(self, user_id, category: Optional[str] = None) -> List[WeeklyAction]:
        q = self.db.query(WeeklyAction).filter(WeeklyAction.user_id == user_id)
        if category:
            q = q.filter(WeeklyAction.category == category)
        return q.order_by(WeeklyAction.due_date).all()
