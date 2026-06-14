from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.plan_repository import PlanRepository
from app.schemas.plan import PlanCreate, PlanUpdate, PlanOut


class PlanService:
    def __init__(self, db: Session):
        self.repo = PlanRepository(db)

    def list_plans(self, active_only: bool = True) -> List[PlanOut]:
        plans = self.repo.get_active_plans() if active_only else self.repo.get_all()
        return [PlanOut.model_validate(p) for p in plans]

    def get_plan(self, plan_id) -> PlanOut:
        plan = self.repo.get(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        return PlanOut.model_validate(plan)

    def create_plan(self, data: PlanCreate) -> PlanOut:
        plan = self.repo.create(**data.model_dump())
        return PlanOut.model_validate(plan)

    def update_plan(self, plan_id, data: PlanUpdate) -> PlanOut:
        plan = self.repo.get(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        updates = {k: v for k, v in data.model_dump().items() if v is not None}
        plan = self.repo.update(plan, **updates)
        return PlanOut.model_validate(plan)

    def delete_plan(self, plan_id) -> None:
        plan = self.repo.get(plan_id)
        if not plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
        self.repo.delete(plan)
