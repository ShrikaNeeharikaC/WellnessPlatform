from datetime import datetime, timezone
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.onboarding_repository import OnboardingRepository
from app.schemas.onboarding import OnboardingStepUpdate, OnboardingOut

STEP_FIELDS = {
    1: "step_1_data",
    2: "step_2_data",
    3: "step_3_data",
    4: "step_4_data",
    5: "step_5_data",
}


class OnboardingService:
    def __init__(self, db: Session):
        self.repo = OnboardingRepository(db)

    def get(self, user_id) -> OnboardingOut:
        onboarding = self.repo.get_by_user(user_id)
        if not onboarding:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding record not found")
        return OnboardingOut.model_validate(onboarding)

    def update_step(self, user_id, data: OnboardingStepUpdate) -> OnboardingOut:
        if data.step not in STEP_FIELDS:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid step number (1–5)")

        onboarding = self.repo.get_by_user(user_id)
        if not onboarding:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding record not found")

        if data.step == 5 and not onboarding.gdpr_consent and not data.gdpr_consent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="GDPR consent required before submitting health data",
            )

        setattr(onboarding, STEP_FIELDS[data.step], data.data)

        if data.gdpr_consent is not None:
            onboarding.gdpr_consent = data.gdpr_consent

        # Advance current_step only if moving forward
        if data.step >= onboarding.current_step:
            onboarding.current_step = min(data.step + 1, 5)

        # Mark as in_progress unless it was already completed
        if onboarding.onboarding_status == "not_started":
            onboarding.onboarding_status = "in_progress"

        # Complete when all mandatory steps (1-3) are filled and we're past step 3
        mandatory_done = all(
            getattr(onboarding, STEP_FIELDS[s]) is not None for s in [1, 2, 3]
        )
        if mandatory_done and data.step >= 3 and onboarding.onboarding_status != "completed":
            if data.step == 5 or (data.step >= 3 and not onboarding.step_4_data):
                pass  # keep in_progress until they explicitly finish
            if data.step == 5:
                onboarding.onboarding_status = "completed"
                onboarding.completed_at      = datetime.now(timezone.utc)

        self.repo.save(onboarding)
        return OnboardingOut.model_validate(onboarding)

    def complete(self, user_id) -> OnboardingOut:
        onboarding = self.repo.get_by_user(user_id)
        if not onboarding:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Onboarding record not found")

        for s in [1, 2, 3]:
            if getattr(onboarding, STEP_FIELDS[s]) is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Step {s} is required and not yet completed",
                )

        onboarding.onboarding_status = "completed"
        onboarding.completed_at      = datetime.now(timezone.utc)
        self.repo.save(onboarding)
        return OnboardingOut.model_validate(onboarding)
