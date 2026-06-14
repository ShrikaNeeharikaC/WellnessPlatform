import uuid
from sqlalchemy import Column, String, Text, DateTime, ForeignKey, func
from sqlalchemy.dialects.postgresql import UUID, JSONB, INET
from sqlalchemy.orm import relationship
from app.database.session import Base


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    activity    = Column(String(100), nullable=False)
    entity_type = Column(String(50))
    entity_id   = Column(UUID(as_uuid=True))
    extra_data  = Column('metadata', JSONB)
    ip_address  = Column(INET)
    user_agent  = Column(Text)
    created_at  = Column(DateTime(timezone=True), nullable=False, server_default=func.now())

    user = relationship("User", foreign_keys=[user_id], back_populates="activity_logs")
