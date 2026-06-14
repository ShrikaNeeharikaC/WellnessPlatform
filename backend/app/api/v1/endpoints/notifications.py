from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationCreate, MarkReadRequest, NotificationOut, NotificationSummary
from app.core.dependencies import get_current_member, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.get("", response_model=List[NotificationOut])
def list_notifications(
    skip:  int = Query(0,  ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return NotificationService(db).list_notifications(current_user.id, skip, limit)


@router.get("/summary", response_model=NotificationSummary)
def notification_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return NotificationService(db).get_summary(current_user.id)


@router.post("", response_model=NotificationOut, status_code=201)
def create_notification(
    data: NotificationCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return NotificationService(db).create_notification(data)


@router.put("/read", response_model=dict)
def mark_read(
    data: MarkReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return NotificationService(db).mark_read(current_user.id, data)


@router.put("/read-all", response_model=dict)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return NotificationService(db).mark_all_read(current_user.id)
