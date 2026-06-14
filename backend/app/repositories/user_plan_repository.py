from typing import Optional, List
from sqlalchemy.orm import Session, joinedload
from app.models.user_plan import UserPlan
from app.repositories.base import BaseRepository


class UserPlanRepository(BaseRepository[UserPlan]):
    def __init__(self, db: Session):
        super().__init__(UserPlan, db)

    def get_active_plan(self, user_id) -> Optional[UserPlan]:
        return (
            self.db.query(UserPlan)
            .options(joinedload(UserPlan.plan))
            .filter(UserPlan.user_id == user_id, UserPlan.status == "active")
            .first()
        )

    def get_user_plans(self, user_id) -> List[UserPlan]:
        return (
            self.db.query(UserPlan)
            .options(joinedload(UserPlan.plan))
            .filter(UserPlan.user_id == user_id)
            .order_by(UserPlan.created_at.desc())
            .all()
        )

    def cancel_active_plans(self, user_id) -> None:
        self.db.query(UserPlan).filter(
            UserPlan.user_id == user_id, UserPlan.status == "active"
        ).update({"status": "cancelled"})
        self.db.commit()
