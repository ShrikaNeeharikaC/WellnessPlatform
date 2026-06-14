from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.user import UserOut, AdminUserUpdate
from app.core.dependencies import get_current_admin
from app.models.user import User
from app.repositories.user_repository import UserRepository

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserOut])
def list_users(
    skip:  int = Query(0,   ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    return UserRepository(db).get_all(skip=skip, limit=limit)


@router.get("/users/{user_id}", response_model=UserOut)
def get_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from fastapi import HTTPException, status
    user = UserRepository(db).get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    return user


@router.put("/users/{user_id}", response_model=UserOut)
def update_user(
    user_id: UUID,
    data: AdminUserUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from fastapi import HTTPException, status
    repo = UserRepository(db)
    user = repo.get(user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updates = {k: v for k, v in data.model_dump().items() if v is not None}
    return repo.update(user, **updates)


@router.get("/reports/summary")
def reports_summary(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_admin),
):
    from app.models.user import UserRole, UserStatus
    from app.models.user_plan import UserPlan
    from app.models.checkin import CheckIn
    from sqlalchemy import func

    total_users   = db.query(User).count()
    active_users  = db.query(User).filter(User.status == UserStatus.active).count()
    total_members = db.query(User).filter(User.role == UserRole.member).count()
    total_coaches = db.query(User).filter(User.role == UserRole.coach).count()
    active_plans  = db.query(UserPlan).filter(UserPlan.status == "active").count()
    total_checkins = db.query(CheckIn).count()

    return {
        "total_users":    total_users,
        "active_users":   active_users,
        "total_members":  total_members,
        "total_coaches":  total_coaches,
        "active_plans":   active_plans,
        "total_checkins": total_checkins,
    }
