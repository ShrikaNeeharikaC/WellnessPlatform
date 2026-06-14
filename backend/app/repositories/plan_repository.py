from typing import List
from sqlalchemy.orm import Session
from app.models.plan import Plan
from app.repositories.base import BaseRepository


class PlanRepository(BaseRepository[Plan]):
    def __init__(self, db: Session):
        super().__init__(Plan, db)

    def get_active_plans(self) -> List[Plan]:
        return self.db.query(Plan).filter(Plan.is_active == True).all()
