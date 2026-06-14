from datetime import datetime, timezone
from typing import List, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.action_repository import ActionRepository
from app.schemas.weekly_action import WeeklyActionCreate, WeeklyActionUpdate, WeeklyActionOut


class ActionService:
    def __init__(self, db: Session):
        self.repo = ActionRepository(db)

    def list_actions(self, user_id, week: Optional[int] = None, year: Optional[int] = None,
                     category: Optional[str] = None) -> List[WeeklyActionOut]:
        if week and year:
            actions = self.repo.get_by_user_week(user_id, week, year)
        else:
            actions = self.repo.get_by_user(user_id, category)
        return [WeeklyActionOut.model_validate(a) for a in actions]

    def create_action(self, data: WeeklyActionCreate, created_by) -> WeeklyActionOut:
        action = self.repo.create(**data.model_dump(), created_by=created_by)
        return WeeklyActionOut.model_validate(action)

    def update_action(self, action_id, user_id, data: WeeklyActionUpdate) -> WeeklyActionOut:
        action = self.repo.get(action_id)
        if not action or str(action.user_id) != str(user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")

        updates = {k: v for k, v in data.model_dump().items() if v is not None}

        if updates.get("status") == "completed" and not action.completed_at:
            updates["completed_at"] = datetime.now(timezone.utc)

        action = self.repo.update(action, **updates)
        return WeeklyActionOut.model_validate(action)

    def delete_action(self, action_id, user_id) -> None:
        action = self.repo.get(action_id)
        if not action or str(action.user_id) != str(user_id):
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Action not found")
        self.repo.delete(action)
