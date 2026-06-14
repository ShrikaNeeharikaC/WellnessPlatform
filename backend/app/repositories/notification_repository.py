from typing import List
from sqlalchemy.orm import Session
from app.models.notification import Notification
from app.repositories.base import BaseRepository


class NotificationRepository(BaseRepository[Notification]):
    def __init__(self, db: Session):
        super().__init__(Notification, db)

    def get_by_user(self, user_id, skip: int = 0, limit: int = 50) -> List[Notification]:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id)
            .order_by(Notification.read_status.asc(), Notification.created_at.desc())
            .offset(skip).limit(limit)
            .all()
        )

    def get_unread_count(self, user_id) -> int:
        return (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.read_status == False)
            .count()
        )

    def mark_read_bulk(self, user_id, ids: List) -> int:
        updated = (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.id.in_(ids))
            .update({"read_status": True}, synchronize_session=False)
        )
        self.db.commit()
        return updated

    def mark_all_read(self, user_id) -> int:
        updated = (
            self.db.query(Notification)
            .filter(Notification.user_id == user_id, Notification.read_status == False)
            .update({"read_status": True}, synchronize_session=False)
        )
        self.db.commit()
        return updated
