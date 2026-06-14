from datetime import date, timedelta
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.plan_repository import PlanRepository
from app.repositories.user_plan_repository import UserPlanRepository
from app.schemas.user_plan import UserPlanCreate, UserPlanOut


class UserPlanService:
    def __init__(self, db: Session):
        self.repo      = UserPlanRepository(db)
        self.plan_repo = PlanRepository(db)

    def assign_plan(self, user_id, data: UserPlanCreate) -> UserPlanOut:
        plan = self.plan_repo.get(data.plan_id)
        if not plan or not plan.is_active:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found or inactive")

        # Cancel any existing active plan first
        self.repo.cancel_active_plans(user_id)

        start = date.today()
        end   = start + (timedelta(days=7) if plan.duration == "1_week" else timedelta(days=30))

        user_plan = self.repo.create(
            user_id=user_id,
            plan_id=plan.id,
            start_date=start,
            end_date=end,
        )
        return UserPlanOut.model_validate(user_plan)

    def get_active_plan(self, user_id) -> UserPlanOut:
        user_plan = self.repo.get_active_plan(user_id)
        if not user_plan:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No active plan found")
        return UserPlanOut.model_validate(user_plan)

    def get_plan_history(self, user_id) -> list:
        plans = self.repo.get_user_plans(user_id)
        return [UserPlanOut.model_validate(p) for p in plans]
