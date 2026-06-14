import uuid
import enum
from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class NotificationType(str, enum.Enum):
    pending_action = "pending_action"
    new_update     = "new_update"
    coach_message  = "coach_message"
    system         = "system"


_type_enum = ENUM(
    "pending_action", "new_update", "coach_message", "system",
    name="notification_type",
    create_type=False,
)


class Notification(Base):
    __tablename__ = "notifications"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title       = Column(String(200), nullable=False)
    message     = Column(Text, nullable=False)
    type        = Column(_type_enum, nullable=False)
    read_status = Column(Boolean, nullable=False, default=False)
    extra_data  = Column('metadata', JSONB)
    created_at  = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="notifications")
