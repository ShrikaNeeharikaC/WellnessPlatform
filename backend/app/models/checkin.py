import uuid
from sqlalchemy import Column, SmallInteger, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.session import Base


class CheckIn(Base):
    __tablename__ = "checkins"

    id                    = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id               = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    week_number           = Column(SmallInteger, nullable=False)
    year                  = Column(SmallInteger, nullable=False)
    completion_percentage = Column(SmallInteger, nullable=False, default=0)
    mood_score            = Column(SmallInteger)
    comments              = Column(Text)
    coach_notes           = Column(Text)
    reviewed_by           = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    reviewed_at           = Column(DateTime(timezone=True))
    submitted_at          = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    created_at            = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user     = relationship("User", foreign_keys=[user_id],    back_populates="checkins")
    reviewer = relationship("User", foreign_keys=[reviewed_by])
