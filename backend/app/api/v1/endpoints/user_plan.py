from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.user_plan_service import UserPlanService
from app.schemas.user_plan import UserPlanCreate, UserPlanOut
from app.core.dependencies import get_current_member
from app.models.user import User

router = APIRouter(prefix="/user-plan", tags=["User Plan"])


@router.post("", response_model=UserPlanOut)
def assign_plan(
    data: UserPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return UserPlanService(db).assign_plan(current_user.id, data)


@router.get("/active", response_model=UserPlanOut)
def get_active_plan(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return UserPlanService(db).get_active_plan(current_user.id)


@router.get("/history", response_model=List[UserPlanOut])
def get_plan_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return UserPlanService(db).get_plan_history(current_user.id)
