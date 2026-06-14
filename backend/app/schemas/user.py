from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import date, datetime
from uuid import UUID
from app.models.user import UserRole, UserStatus


class UserOut(BaseModel):
    id:            UUID
    username:      str
    email:         EmailStr
    first_name:    str
    last_name:     str
    role:          UserRole
    status:        UserStatus
    phone:         Optional[str]
    date_of_birth: Optional[date]
    gender:        Optional[str]
    timezone:      str
    avatar_url:    Optional[str]
    created_at:    datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    first_name:    Optional[str] = None
    last_name:     Optional[str] = None
    phone:         Optional[str] = None
    date_of_birth: Optional[date] = None
    gender:        Optional[str] = None
    timezone:      Optional[str] = None
    avatar_url:    Optional[str] = None


class AdminUserUpdate(BaseModel):
    role:   Optional[UserRole]   = None
    status: Optional[UserStatus] = None
