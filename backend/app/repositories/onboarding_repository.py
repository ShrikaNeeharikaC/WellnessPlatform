from typing import Optional
from sqlalchemy.orm import Session
from app.models.onboarding import Onboarding
from app.repositories.base import BaseRepository


class OnboardingRepository(BaseRepository[Onboarding]):
    def __init__(self, db: Session):
        super().__init__(Onboarding, db)

    def get_by_user(self, user_id) -> Optional[Onboarding]:
        return self.db.query(Onboarding).filter(Onboarding.user_id == user_id).first()
