from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class CheckInCreate(BaseModel):
    week_number:           int
    year:                  int
    completion_percentage: int
    mood_score:            Optional[int] = None
    comments:              Optional[str] = None


class CheckInReview(BaseModel):
    coach_notes: str


class CheckInOut(BaseModel):
    id:                    UUID
    user_id:               UUID
    week_number:           int
    year:                  int
    completion_percentage: int
    mood_score:            Optional[int]
    comments:              Optional[str]
    coach_notes:           Optional[str]
    reviewed_by:           Optional[UUID]
    reviewed_at:           Optional[datetime]
    submitted_at:          datetime
    summary_message:       Optional[str] = None   # AI-generated after submission

    model_config = {"from_attributes": True}
