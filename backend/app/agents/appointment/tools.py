"""
LangChain tools that give the LLM access to the appointments database.
The factory function injects the DB session and member context so tools
can be used safely per-request without global state.
"""
from datetime import datetime, timezone
from uuid import UUID

from langchain_core.tools import tool
from sqlalchemy.orm import Session

from app.models.user import User
from app.services.appointment_service import AppointmentService


def _parse_dt(dt_str: str) -> datetime:
    """Parse ISO datetime string into an aware UTC datetime."""
    s = dt_str.strip()
    if s.endswith("Z"):
        s = s[:-1] + "+00:00"
    try:
        dt = datetime.fromisoformat(s)
    except ValueError:
        dt = datetime.strptime(s[:19], "%Y-%m-%dT%H:%M:%S")
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


def make_appointment_tools(db: Session, member_id: str, current_dt: datetime) -> list:
    """
    Return a list of bound LangChain tools for the appointment agent.
    All tools share the same DB session and member context.
    """
    svc = AppointmentService(db)
    mid = UUID(member_id)

    @tool
    def get_my_coach() -> dict:
        """Get the wellness coach currently assigned to this member."""
        coach = svc.get_member_coach(mid)
        if not coach:
            return {"error": "You don't have a coach assigned yet. Please contact your admin."}
        return {
            "coach_id":   str(coach.id),
            "coach_name": f"{coach.first_name} {coach.last_name}",
            "email":      coach.email,
        }

    @tool
    def check_slot_available(datetime_iso: str) -> dict:
        """
        Check whether a specific date/time slot is free for your coach.

        Args:
            datetime_iso: ISO 8601 datetime string, e.g. '2026-06-25T14:00:00'
        """
        coach = svc.get_member_coach(mid)
        if not coach:
            return {"available": False, "reason": "No coach assigned"}
        try:
            slot_dt = _parse_dt(datetime_iso)
        except Exception as e:
            return {"available": False, "reason": f"Could not parse datetime: {e}"}

        available, reason = svc.check_slot_available(coach.id, slot_dt)
        return {
            "available":    available,
            "reason":       reason,
            "datetime_iso": slot_dt.replace(minute=0, second=0, microsecond=0).isoformat(),
        }

    @tool
    def get_free_slots(days_ahead: int = 7) -> list:
        """
        Return available appointment slots for your coach over the next N days.

        Args:
            days_ahead: Number of days to look ahead (1–14, default 7)
        """
        coach = svc.get_member_coach(mid)
        if not coach:
            return []
        days = max(1, min(14, days_ahead))
        slots = svc.get_coach_free_slots(coach.id, current_dt.date(), days)
        return [
            {
                "datetime_iso": s.isoformat(),
                "label":        s.strftime("%A, %B %d at %I:%M %p UTC"),
            }
            for s in slots
        ]

    @tool
    def book_appointment(datetime_iso: str, title: str = "Wellness Coaching Session") -> dict:
        """
        Book an appointment with your coach at the given date and time.
        Only call this after confirming the slot is available.

        Args:
            datetime_iso: ISO 8601 datetime string for the appointment
            title: Short description / title for the session
        """
        coach = svc.get_member_coach(mid)
        if not coach:
            return {"success": False, "error": "No coach assigned"}

        try:
            slot_dt = _parse_dt(datetime_iso)
        except Exception as e:
            return {"success": False, "error": f"Could not parse datetime: {e}"}

        available, reason = svc.check_slot_available(coach.id, slot_dt)
        if not available:
            return {"success": False, "error": reason}

        appt = svc.book_appointment(mid, coach.id, slot_dt, title)
        return {
            "success": True,
            "appointment": {
                "id":               str(appt.id),
                "scheduled_at":     appt.scheduled_at.isoformat(),
                "label":            appt.scheduled_at.strftime("%A, %B %d at %I:%M %p UTC"),
                "coach_name":       f"{coach.first_name} {coach.last_name}",
                "title":            appt.title,
                "status":           appt.status,
                "duration_minutes": appt.duration_minutes,
            },
        }

    @tool
    def get_my_appointments() -> list:
        """Return the member's upcoming (confirmed) appointments."""
        appts = svc.get_member_appointments(mid)
        result = []
        for a in appts:
            coach = svc.db.query(User).filter_by(id=a.coach_id).first()
            result.append({
                "id":               str(a.id),
                "scheduled_at":     a.scheduled_at.isoformat(),
                "label":            a.scheduled_at.strftime("%A, %B %d at %I:%M %p UTC"),
                "coach_name":       f"{coach.first_name} {coach.last_name}" if coach else "Unknown",
                "title":            a.title,
                "status":           a.status,
                "duration_minutes": a.duration_minutes,
            })
        return result

    return [get_my_coach, check_slot_available, get_free_slots, book_appointment, get_my_appointments]
