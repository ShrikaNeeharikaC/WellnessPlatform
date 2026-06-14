from typing import List
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.repositories.notification_repository import NotificationRepository
from app.schemas.notification import NotificationCreate, MarkReadRequest, NotificationOut, NotificationSummary
from app.models.notification import NotificationType


class NotificationService:
    def __init__(self, db: Session):
        self.repo = NotificationRepository(db)

    def list_notifications(self, user_id, skip: int = 0, limit: int = 50) -> List[NotificationOut]:
        notifs = self.repo.get_by_user(user_id, skip, limit)
        return [NotificationOut.model_validate(n) for n in notifs]

    def create_notification(self, data: NotificationCreate) -> NotificationOut:
        notif = self.repo.create(**data.model_dump())
        return NotificationOut.model_validate(notif)

    def mark_read(self, user_id, data: MarkReadRequest) -> dict:
        count = self.repo.mark_read_bulk(user_id, data.notification_ids)
        return {"marked_read": count}

    def mark_all_read(self, user_id) -> dict:
        count = self.repo.mark_all_read(user_id)
        return {"marked_read": count}

    def get_summary(self, user_id) -> NotificationSummary:
        from app.models.notification import Notification
        from sqlalchemy import func
        db = self.repo.db

        rows = (
            db.query(Notification.type, func.count(Notification.id))
            .filter(Notification.user_id == user_id, Notification.read_status == False)
            .group_by(Notification.type)
            .all()
        )
        counts = {r[0]: r[1] for r in rows}
        total  = sum(counts.values())

        return NotificationSummary(
            total_unread   = total,
            pending_action = counts.get(NotificationType.pending_action, 0),
            new_update     = counts.get(NotificationType.new_update,     0),
            coach_message  = counts.get(NotificationType.coach_message,  0),
            system         = counts.get(NotificationType.system,         0),
        )
