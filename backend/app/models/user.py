import uuid
import enum
from sqlalchemy import Column, String, Date, Text, Boolean, DateTime, func
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.orm import relationship
from app.database.session import Base


class UserRole(str, enum.Enum):
    member = "member"
    coach = "coach"
    admin = "admin"


class UserStatus(str, enum.Enum):
    active = "active"
    inactive = "inactive"
    suspended = "suspended"


_role_enum   = ENUM("member", "coach", "admin",   name="user_role",   create_type=False)
_status_enum = ENUM("active", "inactive", "suspended", name="user_status", create_type=False)


class User(Base):
    __tablename__ = "users"

    id            = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username      = Column(String(50),  nullable=False, unique=True)
    email         = Column(String(255), nullable=False, unique=True)
    password_hash = Column(Text, nullable=False)
    first_name    = Column(String(100), nullable=False)
    last_name     = Column(String(100), nullable=False)
    role          = Column(_role_enum,   nullable=False, default="member")
    status        = Column(_status_enum, nullable=False, default="active")
    phone         = Column(String(20))
    date_of_birth = Column(Date)
    gender        = Column(String(20))
    timezone      = Column(String(60), nullable=False, default="UTC")
    avatar_url    = Column(Text)
    created_at    = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at    = Column(DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now())

    # Relationships
    user_plans      = relationship("UserPlan",     foreign_keys="UserPlan.user_id",       back_populates="user", cascade="all, delete-orphan")
    onboarding      = relationship("Onboarding",   back_populates="user", uselist=False,   cascade="all, delete-orphan")
    weekly_actions  = relationship("WeeklyAction", foreign_keys="WeeklyAction.user_id",   back_populates="user", cascade="all, delete-orphan")
    checkins        = relationship("CheckIn",       foreign_keys="CheckIn.user_id",        back_populates="user", cascade="all, delete-orphan")
    notifications   = relationship("Notification", back_populates="user",                  cascade="all, delete-orphan")
    activity_logs   = relationship("ActivityLog",  foreign_keys="ActivityLog.user_id",    back_populates="user")
    refresh_tokens  = relationship("RefreshToken", back_populates="user",                  cascade="all, delete-orphan")

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"
