import uuid
import enum
from sqlalchemy import Column, String, Text, Numeric, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ENUM, JSONB
from sqlalchemy.orm import relationship
from app.database.session import Base


class PlanType(str, enum.Enum):
    digital_wellness = "digital_wellness"
    coach_care       = "coach_care"
    medical_care     = "medical_care"


class PlanDuration(str, enum.Enum):
    one_week  = "1_week"
    one_month = "1_month"


_plan_type_enum     = ENUM("digital_wellness", "coach_care", "medical_care", name="plan_type",     create_type=False)
_plan_duration_enum = ENUM("1_week", "1_month",                              name="plan_duration", create_type=False)


class Plan(Base):
    __tablename__ = "plans"

    id               = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    plan_name        = Column(String(150), nullable=False)
    plan_type        = Column(_plan_type_enum,     nullable=False)
    duration         = Column(_plan_duration_enum, nullable=False)
    description      = Column(Text, nullable=False)
    benefits         = Column(JSONB, nullable=False, default=list)
    terms_conditions = Column(Text, nullable=False)
    price            = Column(Numeric(10, 2), nullable=False)
    is_active        = Column(Boolean, nullable=False, default=True)
    created_at       = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at       = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    user_plans = relationship("UserPlan", back_populates="plan")
