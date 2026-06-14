from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.action_service import ActionService
from app.schemas.weekly_action import WeeklyActionCreate, WeeklyActionUpdate, WeeklyActionOut
from app.core.dependencies import get_current_member, get_current_coach
from app.models.user import User

router = APIRouter(prefix="/actions", tags=["Weekly Actions"])


@router.get("", response_model=List[WeeklyActionOut])
def list_actions(
    week:     Optional[int] = Query(None),
    year:     Optional[int] = Query(None),
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return ActionService(db).list_actions(current_user.id, week, year, category)


@router.post("", response_model=WeeklyActionOut)
def create_action(
    data: WeeklyActionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach),
):
    return ActionService(db).create_action(data, created_by=current_user.id)


@router.put("/{action_id}", response_model=WeeklyActionOut)
def update_action(
    action_id: UUID,
    data: WeeklyActionUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return ActionService(db).update_action(action_id, current_user.id, data)


@router.delete("/{action_id}", status_code=204)
def delete_action(
    action_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_coach),
):
    ActionService(db).delete_action(action_id, current_user.id)
