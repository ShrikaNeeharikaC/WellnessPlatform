import uuid
from sqlalchemy import Column, String, Text, Boolean, SmallInteger, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class MemberCoach(Base):
    __tablename__ = "member_coach"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True)
    coach_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    assigned_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    is_active   = Column(Boolean, nullable=False, default=True)


class CoachAvailability(Base):
    __tablename__ = "coach_availability"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    coach_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    day_of_week = Column(SmallInteger, nullable=False)   # 0=Mon, 6=Sun
    start_hour  = Column(SmallInteger, nullable=False)
    end_hour    = Column(SmallInteger, nullable=False)
    is_active   = Column(Boolean, nullable=False, default=True)


class Appointment(Base):
    __tablename__ = "appointments"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    member_id        = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    coach_id         = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheduled_at     = Column(DateTime(timezone=True), nullable=False)
    duration_minutes = Column(SmallInteger, nullable=False, default=60)
    status           = Column(String(20), nullable=False, default="confirmed")
    title            = Column(String(200), nullable=False, default="Wellness Coaching Session")
    notes            = Column(Text)
    created_at       = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    member = relationship("User", foreign_keys=[member_id])
    coach  = relationship("User", foreign_keys=[coach_id])
