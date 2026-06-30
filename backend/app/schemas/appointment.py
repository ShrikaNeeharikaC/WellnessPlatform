from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class AppointmentOut(BaseModel):
    id:               UUID
    member_id:        UUID
    coach_id:         UUID
    scheduled_at:     datetime
    duration_minutes: int
    status:           str
    title:            str
    notes:            Optional[str] = None
    coach_name:       Optional[str] = None
    member_name:      Optional[str] = None
    created_at:       datetime

    model_config = {"from_attributes": True}


class ChatMessageIn(BaseModel):
    message: str


class ChatResponse(BaseModel):
    message:         str
    action:          str                   # "booked" | "slots_shown" | "no_action"
    appointment:     Optional[dict] = None
    available_slots: Optional[list] = None
