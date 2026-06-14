import uuid
import enum
from sqlalchemy import Column, SmallInteger, Boolean, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class OnboardingStatus(str, enum.Enum):
    not_started = "not_started"
    in_progress = "in_progress"
    completed   = "completed"


_status_enum = ENUM("not_started", "in_progress", "completed", name="onboarding_status", create_type=False)


class Onboarding(Base):
    __tablename__ = "onboarding"

    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id           = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    step_1_data       = Column(JSONB)
    step_2_data       = Column(JSONB)
    step_3_data       = Column(JSONB)
    step_4_data       = Column(JSONB)
    step_5_data       = Column(JSONB)
    current_step      = Column(SmallInteger, nullable=False, default=1)
    onboarding_status = Column(_status_enum, nullable=False, default="not_started")
    gdpr_consent      = Column(Boolean, nullable=False, default=False)
    completed_at      = Column(DateTime(timezone=True))
    created_at        = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at        = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="onboarding")
