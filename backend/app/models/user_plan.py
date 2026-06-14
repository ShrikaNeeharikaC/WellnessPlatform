import uuid
import enum
from sqlalchemy import Column, Date, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from app.database.session import Base


class UserPlanStatus(str, enum.Enum):
    active    = "active"
    expired   = "expired"
    cancelled = "cancelled"


_status_enum = ENUM("active", "expired", "cancelled", name="user_plan_status", create_type=False)


class UserPlan(Base):
    __tablename__ = "user_plan"

    id         = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id    = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"),   nullable=False)
    plan_id    = Column(UUID(as_uuid=True), ForeignKey("plans.id", ondelete="RESTRICT"),  nullable=False)
    start_date = Column(Date, nullable=False)
    end_date   = Column(Date, nullable=False)
    status     = Column(_status_enum, nullable=False, default="active")
    created_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="user_plans")
    plan = relationship("Plan", back_populates="user_plans")
