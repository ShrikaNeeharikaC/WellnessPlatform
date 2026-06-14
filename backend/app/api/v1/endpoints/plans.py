from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.plan_service import PlanService
from app.schemas.plan import PlanOut, PlanCreate, PlanUpdate
from app.core.dependencies import get_current_member, get_current_admin
from app.models.user import User

router = APIRouter(prefix="/plans", tags=["Plans"])


@router.get("", response_model=List[PlanOut])
def list_plans(db: Session = Depends(get_db)):
    return PlanService(db).list_plans(active_only=True)


@router.get("/{plan_id}", response_model=PlanOut)
def get_plan(plan_id: UUID, db: Session = Depends(get_db)):
    return PlanService(db).get_plan(plan_id)


@router.post("", response_model=PlanOut, status_code=status.HTTP_201_CREATED)
def create_plan(
    data: PlanCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return PlanService(db).create_plan(data)


@router.put("/{plan_id}", response_model=PlanOut)
def update_plan(
    plan_id: UUID,
    data: PlanUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return PlanService(db).update_plan(plan_id, data)


@router.delete("/{plan_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan(
    plan_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    PlanService(db).delete_plan(plan_id)
