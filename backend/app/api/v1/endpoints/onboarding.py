from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.services.onboarding_service import OnboardingService
from app.schemas.onboarding import OnboardingStepUpdate, OnboardingOut
from app.core.dependencies import get_current_member
from app.models.user import User

router = APIRouter(prefix="/onboarding", tags=["Onboarding"])


@router.get("", response_model=OnboardingOut)
def get_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return OnboardingService(db).get(current_user.id)


@router.post("/step", response_model=OnboardingOut)
def update_step(
    data: OnboardingStepUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return OnboardingService(db).update_step(current_user.id, data)


@router.post("/complete", response_model=OnboardingOut)
def complete_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    return OnboardingService(db).complete(current_user.id)
