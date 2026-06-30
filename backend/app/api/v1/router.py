from fastapi import APIRouter
from app.api.v1.endpoints import (
    auth, plans, user_plan, onboarding,
    weekly_actions, notifications, checkins, coach, admin,
    appointments, chat,
)

api_router = APIRouter()

api_router.include_router(auth.router)
api_router.include_router(plans.router)
api_router.include_router(user_plan.router)
api_router.include_router(onboarding.router)
api_router.include_router(weekly_actions.router)
api_router.include_router(notifications.router)
api_router.include_router(checkins.router)
api_router.include_router(coach.router)
api_router.include_router(admin.router)
api_router.include_router(appointments.router)
api_router.include_router(chat.router)
