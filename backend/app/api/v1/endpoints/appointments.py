from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.core.dependencies import get_current_member, get_current_user
from app.models.user import User
from app.services.appointment_service import AppointmentService
from app.schemas.appointment import AppointmentOut

router = APIRouter(prefix="/appointments", tags=["Appointments"])


def _serialize(appt, db: Session) -> AppointmentOut:
    from app.models.user import User as U
    coach  = db.query(U).filter(U.id == appt.coach_id).first()
    member = db.query(U).filter(U.id == appt.member_id).first()
    return AppointmentOut(
        id=appt.id,
        member_id=appt.member_id,
        coach_id=appt.coach_id,
        scheduled_at=appt.scheduled_at,
        duration_minutes=appt.duration_minutes,
        status=appt.status,
        title=appt.title,
        notes=appt.notes,
        created_at=appt.created_at,
        coach_name=f"{coach.first_name} {coach.last_name}" if coach else None,
        member_name=f"{member.first_name} {member.last_name}" if member else None,
    )


@router.get("", response_model=List[AppointmentOut])
def get_my_appointments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    svc   = AppointmentService(db)
    appts = svc.get_member_appointments(current_user.id)
    return [_serialize(a, db) for a in appts]


@router.delete("/{appointment_id}", response_model=AppointmentOut)
def cancel_appointment(
    appointment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_member),
):
    svc  = AppointmentService(db)
    appt = svc.cancel_appointment(appointment_id, current_user.id)
    if not appt:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    return _serialize(appt, db)


@router.post("/assign-coach/{coach_id}", response_model=dict)
def assign_coach(
    coach_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Admin or member can assign a coach to themselves (admin sets for others via query param)."""
    svc = AppointmentService(db)
    svc.assign_coach(current_user.id, coach_id)
    return {"detail": "Coach assigned successfully"}
