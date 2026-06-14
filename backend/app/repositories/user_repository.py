from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)

    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.username == username.lower()
        ).first()

    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(
            User.email == email.lower()
        ).first()

    def get_by_role(self, role: str, skip: int = 0, limit: int = 100) -> List[User]:
        return self.db.query(User).filter(User.role == role).offset(skip).limit(limit).all()

    def username_exists(self, username: str) -> bool:
        return self.db.query(User.id).filter(User.username == username.lower()).scalar() is not None

    def email_exists(self, email: str) -> bool:
        return self.db.query(User.id).filter(User.email == email.lower()).scalar() is not None
