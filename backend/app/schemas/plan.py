from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from app.models.plan import PlanType, PlanDuration


class PlanOut(BaseModel):
    id:               UUID
    plan_name:        str
    plan_type:        PlanType
    duration:         PlanDuration
    description:      str
    benefits:         List[str]
    terms_conditions: str
    price:            float
    is_active:        bool
    created_at:       datetime

    model_config = {"from_attributes": True}


class PlanCreate(BaseModel):
    plan_name:        str
    plan_type:        PlanType
    duration:         PlanDuration
    description:      str
    benefits:         List[str]
    terms_conditions: str
    price:            float


class PlanUpdate(BaseModel):
    plan_name:        Optional[str]          = None
    description:      Optional[str]          = None
    benefits:         Optional[List[str]]    = None
    terms_conditions: Optional[str]          = None
    price:            Optional[float]        = None
    is_active:        Optional[bool]         = None
