from pydantic import BaseModel
from datetime import date, datetime
from uuid import UUID
from app.models.user_plan import UserPlanStatus
from app.schemas.plan import PlanOut


class UserPlanCreate(BaseModel):
    plan_id: UUID


class UserPlanOut(BaseModel):
    id:         UUID
    user_id:    UUID
    plan_id:    UUID
    start_date: date
    end_date:   date
    status:     UserPlanStatus
    created_at: datetime
    plan:       PlanOut

    model_config = {"from_attributes": True}
