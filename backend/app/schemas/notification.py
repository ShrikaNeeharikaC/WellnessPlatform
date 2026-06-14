from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id:  UUID
    title:    str
    message:  str
    type:     NotificationType
    metadata: Optional[Dict[str, Any]] = None


class MarkReadRequest(BaseModel):
    notification_ids: List[UUID]


class NotificationOut(BaseModel):
    id:          UUID
    user_id:     UUID
    title:       str
    message:     str
    type:        NotificationType
    read_status: bool
    metadata:    Optional[Dict[str, Any]]
    created_at:  datetime

    model_config = {"from_attributes": True}


class NotificationSummary(BaseModel):
    total_unread:   int
    pending_action: int
    new_update:     int
    coach_message:  int
    system:         int
