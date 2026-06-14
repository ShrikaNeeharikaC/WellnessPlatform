from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.weekly_action import ActionCategory, ActionStatus


class WeeklyActionCreate(BaseModel):
    user_id:     UUID
    title:       str
    description: Optional[str] = None
    category:    ActionCategory
    week_number: int
    year:        int
    due_date:    date


class WeeklyActionUpdate(BaseModel):
    status:      Optional[ActionStatus] = None
    title:       Optional[str]          = None
    description: Optional[str]          = None
    due_date:    Optional[date]          = None


class WeeklyActionOut(BaseModel):
    id:          UUID
    user_id:     UUID
    created_by:  Optional[UUID]
    title:       str
    description: Optional[str]
    category:    ActionCategory
    week_number: int
    year:        int
    due_date:    date
    status:      ActionStatus
    completed_at: Optional[datetime]
    created_at:  datetime

    model_config = {"from_attributes": True}
