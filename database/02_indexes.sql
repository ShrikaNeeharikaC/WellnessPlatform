-- =============================================================================
-- WELLNESS PLATFORM — INDEXES
-- File: 02_indexes.sql
-- Run order: 2nd (after 01_schema.sql)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- users
-- ---------------------------------------------------------------------------

-- Auth lookups: login by username or email
CREATE UNIQUE INDEX idx_users_username_lower
    ON users (LOWER(username));

CREATE UNIQUE INDEX idx_users_email_lower
    ON users (LOWER(email));

-- Admin user list: filter by role and status
CREATE INDEX idx_users_role
    ON users (role);

CREATE INDEX idx_users_status
    ON users (status);

-- Coach dashboard: coach searches members by name
CREATE INDEX idx_users_name_trgm
    ON users USING GIN ((first_name || ' ' || last_name) gin_trgm_ops);

-- ---------------------------------------------------------------------------
-- plans
-- ---------------------------------------------------------------------------

-- Plan selection screen: only show active plans
CREATE INDEX idx_plans_is_active
    ON plans (is_active)
    WHERE is_active = TRUE;

CREATE INDEX idx_plans_type
    ON plans (plan_type);

-- ---------------------------------------------------------------------------
-- user_plan
-- ---------------------------------------------------------------------------

-- Most common query: get active plan for a specific member
CREATE INDEX idx_user_plan_user_id
    ON user_plan (user_id);

CREATE INDEX idx_user_plan_plan_id
    ON user_plan (plan_id);

-- Filter to a member's currently active plan
CREATE INDEX idx_user_plan_user_active
    ON user_plan (user_id, status)
    WHERE status = 'active';

-- ---------------------------------------------------------------------------
-- onboarding
-- ---------------------------------------------------------------------------

-- Always looked up by user_id (1:1 relationship, unique enforced in schema)
CREATE INDEX idx_onboarding_user_id
    ON onboarding (user_id);

CREATE INDEX idx_onboarding_status
    ON onboarding (onboarding_status);

-- ---------------------------------------------------------------------------
-- weekly_actions
-- ---------------------------------------------------------------------------

-- Dashboard and Action Center: actions for a user in a given week
CREATE INDEX idx_weekly_actions_user_week
    ON weekly_actions (user_id, year, week_number);

-- Filter pending tasks for a user
CREATE INDEX idx_weekly_actions_user_status
    ON weekly_actions (user_id, status);

-- Category filter on Action Center tabs
CREATE INDEX idx_weekly_actions_category
    ON weekly_actions (user_id, category, status);

-- Due date for overdue notification jobs
CREATE INDEX idx_weekly_actions_due_date
    ON weekly_actions (due_date)
    WHERE status = 'pending';

-- ---------------------------------------------------------------------------
-- checkins
-- ---------------------------------------------------------------------------

-- Fetch a user's check-in history
CREATE INDEX idx_checkins_user_id
    ON checkins (user_id);

-- Composite: look up specific week (unique constraint already covers this,
-- but explicit index aids range queries by coach)
CREATE INDEX idx_checkins_user_year_week
    ON checkins (user_id, year, week_number);

-- Coach review queue: unreviewed check-ins
CREATE INDEX idx_checkins_unreviewed
    ON checkins (reviewed_by, submitted_at)
    WHERE reviewed_by IS NULL;

-- ---------------------------------------------------------------------------
-- notifications
-- ---------------------------------------------------------------------------

-- Notification Center: user's unread notifications first
CREATE INDEX idx_notifications_user_unread
    ON notifications (user_id, read_status, created_at DESC)
    WHERE read_status = FALSE;

-- All notifications for a user (inbox scroll)
CREATE INDEX idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

-- Filter by type (pending_action badge counts)
CREATE INDEX idx_notifications_user_type
    ON notifications (user_id, type, read_status);

-- ---------------------------------------------------------------------------
-- activity_logs
-- ---------------------------------------------------------------------------

-- Audit queries by user and time range
CREATE INDEX idx_activity_logs_user_created
    ON activity_logs (user_id, created_at DESC);

-- Admin audit log: filter by event type
CREATE INDEX idx_activity_logs_activity
    ON activity_logs (activity, created_at DESC);

-- Entity-level audit (e.g., all events on a specific action)
CREATE INDEX idx_activity_logs_entity
    ON activity_logs (entity_type, entity_id)
    WHERE entity_id IS NOT NULL;
