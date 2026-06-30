from datetime import datetime, date, time, timezone, timedelta
from typing import Optional, List, Tuple
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.appointment import Appointment, CoachAvailability, MemberCoach
from app.models.notification import Notification
from app.models.user import User

_DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']


class AppointmentService:
    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------
    # Coach assignment
    # ------------------------------------------------------------------

    def get_member_coach(self, member_id: UUID) -> Optional[User]:
        row = (
            self.db.query(MemberCoach)
            .filter(MemberCoach.member_id == member_id, MemberCoach.is_active == True)
            .first()
        )
        if not row:
            return None
        return self.db.query(User).filter(User.id == row.coach_id).first()

    def assign_coach(self, member_id: UUID, coach_id: UUID) -> MemberCoach:
        self.db.query(MemberCoach).filter(MemberCoach.member_id == member_id).delete()
        row = MemberCoach(member_id=member_id, coach_id=coach_id)
        self.db.add(row)
        self.db.commit()
        self.db.refresh(row)
        return row

    def auto_assign_coach(self, member_id: UUID) -> Optional[MemberCoach]:
        """Assign the active coach with the fewest current members."""
        from sqlalchemy import func

        coaches = (
            self.db.query(User)
            .filter(User.role == "coach", User.status == "active")
            .all()
        )
        if not coaches:
            return None

        # Count active assignments per coach
        counts = {c.id: 0 for c in coaches}
        rows = (
            self.db.query(MemberCoach.coach_id, func.count(MemberCoach.id))
            .filter(MemberCoach.is_active == True)
            .group_by(MemberCoach.coach_id)
            .all()
        )
        for coach_id, n in rows:
            if coach_id in counts:
                counts[coach_id] = n

        lightest_id = min(counts, key=counts.get)
        return self.assign_coach(member_id, lightest_id)

    # ------------------------------------------------------------------
    # Slot availability
    # ------------------------------------------------------------------

    def check_slot_available(self, coach_id: UUID, scheduled_at: datetime) -> Tuple[bool, str]:
        now = datetime.now(timezone.utc)
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)

        if scheduled_at <= now:
            return False, "Cannot book slots in the past"

        scheduled_at = scheduled_at.replace(minute=0, second=0, microsecond=0)
        day_of_week  = scheduled_at.weekday()
        hour         = scheduled_at.hour

        avail = (
            self.db.query(CoachAvailability)
            .filter(
                CoachAvailability.coach_id    == coach_id,
                CoachAvailability.day_of_week == day_of_week,
                CoachAvailability.is_active   == True,
            )
            .first()
        )

        if not avail:
            return False, f"Your coach does not work on {_DAY_NAMES[day_of_week]}"

        if hour == 12:
            return False, "That's the coach's lunch break (12:00–13:00 UTC)"

        if hour < avail.start_hour or hour >= avail.end_hour:
            return False, f"Outside working hours ({avail.start_hour}:00–{avail.end_hour}:00 UTC)"

        conflict = (
            self.db.query(Appointment)
            .filter(
                Appointment.coach_id     == coach_id,
                Appointment.scheduled_at == scheduled_at,
                Appointment.status       == "confirmed",
            )
            .first()
        )
        if conflict:
            return False, "That slot is already booked"

        return True, "Available"

    def get_coach_free_slots(self, coach_id: UUID, date_from: date, days_ahead: int = 7) -> List[datetime]:
        now = datetime.now(timezone.utc)

        availabilities = {
            a.day_of_week: a
            for a in self.db.query(CoachAvailability).filter(
                CoachAvailability.coach_id == coach_id,
                CoachAvailability.is_active == True,
            ).all()
        }

        end_date = date_from + timedelta(days=days_ahead)
        range_start = datetime(date_from.year, date_from.month, date_from.day, 0, 0, tzinfo=timezone.utc)
        range_end   = datetime(end_date.year,  end_date.month,  end_date.day,  23, 59, tzinfo=timezone.utc)

        booked = {
            a.scheduled_at if a.scheduled_at.tzinfo else a.scheduled_at.replace(tzinfo=timezone.utc)
            for a in self.db.query(Appointment).filter(
                Appointment.coach_id     == coach_id,
                Appointment.scheduled_at >= range_start,
                Appointment.scheduled_at <= range_end,
                Appointment.status       == "confirmed",
            ).all()
        }

        free_slots: List[datetime] = []

        for offset in range(days_ahead):
            check_date  = date_from + timedelta(days=offset)
            day_of_week = check_date.weekday()

            if day_of_week not in availabilities:
                continue

            avail = availabilities[day_of_week]

            for hour in range(avail.start_hour, avail.end_hour):
                if hour == 12:
                    continue
                slot_dt = datetime(check_date.year, check_date.month, check_date.day, hour, 0, tzinfo=timezone.utc)
                if slot_dt <= now or slot_dt in booked:
                    continue
                free_slots.append(slot_dt)

        return free_slots[:20]

    # ------------------------------------------------------------------
    # Booking
    # ------------------------------------------------------------------

    def book_appointment(
        self,
        member_id:   UUID,
        coach_id:    UUID,
        scheduled_at: datetime,
        title:       str = "Wellness Coaching Session",
    ) -> Appointment:
        scheduled_at = scheduled_at.replace(minute=0, second=0, microsecond=0)
        if scheduled_at.tzinfo is None:
            scheduled_at = scheduled_at.replace(tzinfo=timezone.utc)

        appt = Appointment(
            member_id=member_id,
            coach_id=coach_id,
            scheduled_at=scheduled_at,
            title=title,
        )
        self.db.add(appt)
        self.db.flush()

        member = self.db.query(User).filter(User.id == member_id).first()
        coach  = self.db.query(User).filter(User.id == coach_id).first()
        label  = scheduled_at.strftime("%A, %B %d at %I:%M %p UTC")

        self.db.add(Notification(
            user_id=member_id,
            title="Appointment Confirmed",
            message=f"Your session with Coach {coach.first_name} is booked for {label}.",
            **{"type": "system"},
        ))
        self.db.add(Notification(
            user_id=coach_id,
            title="New Appointment",
            message=f"{member.first_name} {member.last_name} booked a session on {label}.",
            **{"type": "coach_message"},
        ))

        self.db.commit()
        self.db.refresh(appt)
        return appt

    # ------------------------------------------------------------------
    # Queries
    # ------------------------------------------------------------------

    def get_member_appointments(self, member_id: UUID) -> List[Appointment]:
        cutoff = datetime.now(timezone.utc) - timedelta(hours=1)
        return (
            self.db.query(Appointment)
            .filter(
                Appointment.member_id    == member_id,
                Appointment.scheduled_at >= cutoff,
            )
            .order_by(Appointment.scheduled_at)
            .all()
        )

    def cancel_appointment(self, appointment_id: UUID, member_id: UUID) -> Optional[Appointment]:
        appt = (
            self.db.query(Appointment)
            .filter(Appointment.id == appointment_id, Appointment.member_id == member_id)
            .first()
        )
        if not appt:
            return None
        appt.status = "cancelled"
        self.db.commit()
        self.db.refresh(appt)
        return appt
