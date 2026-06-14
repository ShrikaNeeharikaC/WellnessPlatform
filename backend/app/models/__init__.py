# Import all models so SQLAlchemy registers them before create_all is called.
from app.models.user import User, UserRole, UserStatus
from app.models.plan import Plan, PlanType, PlanDuration
from app.models.user_plan import UserPlan, UserPlanStatus
from app.models.onboarding import Onboarding, OnboardingStatus
from app.models.weekly_action import WeeklyAction, ActionCategory, ActionStatus
from app.models.checkin import CheckIn
from app.models.notification import Notification, NotificationType
from app.models.activity_log import ActivityLog
from app.models.refresh_token import RefreshToken
