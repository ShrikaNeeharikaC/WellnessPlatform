from pydantic import BaseModel
from typing import Optional, Any, Dict
from datetime import datetime
from uuid import UUID
from app.models.onboarding import OnboardingStatus


class Step1Data(BaseModel):
    dob:      Optional[str] = None
    gender:   Optional[str] = None
    timezone: Optional[str] = None


class Step2Data(BaseModel):
    height_cm:     Optional[float] = None
    weight_kg:     Optional[float] = None
    fitness_level: Optional[str]   = None


class Step3Data(BaseModel):
    primary_goal:            Optional[str] = None
    target_timeline_weeks:   Optional[int] = None


class Step4Data(BaseModel):
    dietary_prefs:       Optional[list] = None
    equipment:           Optional[list] = None
    days_per_week:       Optional[int]  = None
    session_duration_min: Optional[int] = None


class Step5Data(BaseModel):
    injuries:           Optional[list] = None
    medical_conditions: Optional[list] = None
    doctor_clearance:   Optional[bool] = None


class OnboardingStepUpdate(BaseModel):
    step:        int
    data:        Dict[str, Any]
    gdpr_consent: Optional[bool] = None


class OnboardingOut(BaseModel):
    id:                UUID
    user_id:           UUID
    step_1_data:       Optional[Dict[str, Any]]
    step_2_data:       Optional[Dict[str, Any]]
    step_3_data:       Optional[Dict[str, Any]]
    step_4_data:       Optional[Dict[str, Any]]
    step_5_data:       Optional[Dict[str, Any]]
    current_step:      int
    onboarding_status: OnboardingStatus
    gdpr_consent:      bool
    completed_at:      Optional[datetime]
    created_at:        datetime
    updated_at:        datetime

    model_config = {"from_attributes": True}
