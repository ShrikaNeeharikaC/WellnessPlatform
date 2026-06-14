import uuid
import enum
from sqlalchemy import Column, String, Text, SmallInteger, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from app.database.session import Base


class ActionCategory(str, enum.Enum):
    nutrition = "nutrition"
    fitness   = "fitness"
    wellness  = "wellness"


class ActionStatus(str, enum.Enum):
    pending   = "pending"
    completed = "completed"
    skipped   = "skipped"
    deferred  = "deferred"


_category_enum = ENUM("nutrition", "fitness", "wellness",              name="action_category", create_type=False)
_status_enum   = ENUM("pending", "completed", "skipped", "deferred",  name="action_status",   create_type=False)


class WeeklyAction(Base):
    __tablename__ = "weekly_actions"

    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id      = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),   nullable=False)
    created_by   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    title        = Column(String(200), nullable=False)
    description  = Column(Text)
    category     = Column(_category_enum, nullable=False)
    week_number  = Column(SmallInteger, nullable=False)
    year         = Column(SmallInteger, nullable=False)
    due_date     = Column(Date, nullable=False)
    status       = Column(_status_enum, nullable=False, default="pending")
    completed_at = Column(DateTime(timezone=True))
    created_at   = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at   = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user    = relationship("User", foreign_keys=[user_id],    back_populates="weekly_actions")
    creator = relationship("User", foreign_keys=[created_by])
