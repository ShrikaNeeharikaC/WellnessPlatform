-- =============================================================================
-- WELLNESS PLATFORM — DATABASE SCHEMA
-- PostgreSQL 15+
-- File: 01_schema.sql
-- Run order: 1st
-- =============================================================================

-- ---------------------------------------------------------------------------
-- EXTENSIONS
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pg_trgm";    -- trigram indexes for LIKE search

-- ---------------------------------------------------------------------------
-- ENUMS
-- ---------------------------------------------------------------------------
CREATE TYPE user_role   AS ENUM ('member', 'coach', 'admin');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'suspended');

CREATE TYPE plan_type     AS ENUM ('digital_wellness', 'coach_care', 'medical_care');
CREATE TYPE plan_duration AS ENUM ('1_week', '1_month');

CREATE TYPE user_plan_status AS ENUM ('active', 'expired', 'cancelled');

CREATE TYPE onboarding_status AS ENUM ('not_started', 'in_progress', 'completed');

CREATE TYPE action_category AS ENUM ('nutrition', 'fitness', 'wellness');
CREATE TYPE action_status   AS ENUM ('pending', 'completed', 'skipped', 'deferred');

CREATE TYPE notification_type AS ENUM (
    'pending_action',
    'new_update',
    'coach_message',
    'system'
);

-- ---------------------------------------------------------------------------
-- TABLE: users
-- ---------------------------------------------------------------------------
CREATE TABLE users (
    id            UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    username      VARCHAR(50)  NOT NULL UNIQUE,
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT         NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    role          user_role    NOT NULL DEFAULT 'member',
    status        user_status  NOT NULL DEFAULT 'active',
    phone         VARCHAR(20),
    date_of_birth DATE,
    gender        VARCHAR(20),
    timezone      VARCHAR(60)  NOT NULL DEFAULT 'UTC',
    avatar_url    TEXT,
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  users               IS 'All platform users: members, coaches, and admins.';
COMMENT ON COLUMN users.password_hash IS 'bcrypt hash — never store plaintext passwords.';
COMMENT ON COLUMN users.role          IS 'Controls access: member, coach, admin.';

-- ---------------------------------------------------------------------------
-- TABLE: plans
-- ---------------------------------------------------------------------------
CREATE TABLE plans (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_name        VARCHAR(150)  NOT NULL,
    plan_type        plan_type     NOT NULL,
    duration         plan_duration NOT NULL,
    description      TEXT          NOT NULL,
    benefits         JSONB         NOT NULL DEFAULT '[]',
    terms_conditions TEXT          NOT NULL,
    price            NUMERIC(10,2) NOT NULL CHECK (price >= 0),
    is_active        BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  plans          IS 'Catalog of all available wellness plans.';
COMMENT ON COLUMN plans.benefits IS 'JSON array of benefit strings shown on the plan selection screen.';
COMMENT ON COLUMN plans.duration IS '1_week or 1_month billing period.';

-- ---------------------------------------------------------------------------
-- TABLE: user_plan
-- ---------------------------------------------------------------------------
CREATE TABLE user_plan (
    id         UUID             PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID             NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id    UUID             NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
    start_date DATE             NOT NULL DEFAULT CURRENT_DATE,
    end_date   DATE             NOT NULL,
    status     user_plan_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ      NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ      NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_plan_dates CHECK (end_date > start_date)
);

COMMENT ON TABLE user_plan IS 'Tracks plan enrollment per member. A member may have one active plan at a time.';

-- ---------------------------------------------------------------------------
-- TABLE: onboarding
-- One row per user. JSONB columns store each step's form payload.
-- ---------------------------------------------------------------------------
CREATE TABLE onboarding (
    id                UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID              NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,

    -- Step 1: Basic profile extras (DOB, gender, timezone)
    step_1_data       JSONB,
    -- Step 2: Physical stats (height, weight, fitness level)
    step_2_data       JSONB,
    -- Step 3: Goals (primary goal, target timeline)
    step_3_data       JSONB,
    -- Step 4: Lifestyle (diet, equipment, availability)
    step_4_data       JSONB,
    -- Step 5: Health screen — GDPR consent required before collecting
    step_5_data       JSONB,

    current_step      SMALLINT          NOT NULL DEFAULT 1 CHECK (current_step BETWEEN 1 AND 5),
    onboarding_status onboarding_status NOT NULL DEFAULT 'not_started',
    gdpr_consent      BOOLEAN           NOT NULL DEFAULT FALSE,
    completed_at      TIMESTAMPTZ,
    created_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  onboarding             IS '5-step onboarding wizard. Exactly one row per user, resumable.';
COMMENT ON COLUMN onboarding.step_1_data IS 'e.g. {"dob":"1990-01-15","gender":"female","timezone":"Europe/London"}';
COMMENT ON COLUMN onboarding.step_2_data IS 'e.g. {"height_cm":165,"weight_kg":68,"fitness_level":"intermediate"}';
COMMENT ON COLUMN onboarding.step_3_data IS 'e.g. {"primary_goal":"weight_loss","target_timeline_weeks":12}';
COMMENT ON COLUMN onboarding.step_4_data IS 'e.g. {"dietary_prefs":["vegan"],"equipment":["home"],"days_per_week":4,"session_duration_min":30}';
COMMENT ON COLUMN onboarding.step_5_data IS 'e.g. {"injuries":["knee"],"medical_conditions":[],"doctor_clearance":false}';

-- ---------------------------------------------------------------------------
-- TABLE: weekly_actions
-- ---------------------------------------------------------------------------
CREATE TABLE weekly_actions (
    id           UUID            PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id      UUID            NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_by   UUID            REFERENCES users(id) ON DELETE SET NULL,
    title        VARCHAR(200)    NOT NULL,
    description  TEXT,
    category     action_category NOT NULL,
    week_number  SMALLINT        NOT NULL CHECK (week_number BETWEEN 1 AND 53),
    year         SMALLINT        NOT NULL CHECK (year >= 2024),
    due_date     DATE            NOT NULL,
    status       action_status   NOT NULL DEFAULT 'pending',
    completed_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  weekly_actions            IS 'Nutrition, fitness, and wellness tasks assigned to members weekly.';
COMMENT ON COLUMN weekly_actions.created_by IS 'NULL = system; UUID = coach or admin who manually assigned this task.';

-- ---------------------------------------------------------------------------
-- TABLE: checkins
-- One submission per user per week.
-- ---------------------------------------------------------------------------
CREATE TABLE checkins (
    id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id               UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    week_number           SMALLINT    NOT NULL CHECK (week_number BETWEEN 1 AND 53),
    year                  SMALLINT    NOT NULL CHECK (year >= 2024),
    completion_percentage SMALLINT    NOT NULL DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
    mood_score            SMALLINT    CHECK (mood_score BETWEEN 1 AND 10),
    comments              TEXT,
    coach_notes           TEXT,
    reviewed_by           UUID        REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at           TIMESTAMPTZ,
    submitted_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    UNIQUE (user_id, week_number, year)
);

COMMENT ON TABLE  checkins             IS 'Weekly progress check-in submissions from members.';
COMMENT ON COLUMN checkins.mood_score  IS '1 (very low) to 10 (excellent). Optional.';
COMMENT ON COLUMN checkins.reviewed_by IS 'Coach who reviewed and added notes (Coach tier).';

-- ---------------------------------------------------------------------------
-- TABLE: notifications
-- ---------------------------------------------------------------------------
CREATE TABLE notifications (
    id          UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID              NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(200)      NOT NULL,
    message     TEXT              NOT NULL,
    type        notification_type NOT NULL,
    read_status BOOLEAN           NOT NULL DEFAULT FALSE,
    metadata    JSONB,
    created_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  notifications          IS 'In-app notification inbox per user.';
COMMENT ON COLUMN notifications.type     IS 'pending_action: overdue tasks; new_update: plan/challenge updates; coach_message: from coach; system: platform alerts.';
COMMENT ON COLUMN notifications.metadata IS 'Optional context payload e.g. {"action_id":"...","week":4}.';

-- ---------------------------------------------------------------------------
-- TABLE: activity_logs
-- Append-only audit trail — never UPDATE or DELETE rows.
-- ---------------------------------------------------------------------------
CREATE TABLE activity_logs (
    id          UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID         REFERENCES users(id) ON DELETE SET NULL,
    activity    VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id   UUID,
    metadata    JSONB,
    ip_address  INET,
    user_agent  TEXT,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  activity_logs          IS 'Immutable audit trail. Never UPDATE or DELETE rows.';
COMMENT ON COLUMN activity_logs.activity IS 'Dot-notation event name e.g. "user.login", "action.completed", "plan.selected".';

-- ---------------------------------------------------------------------------
-- AUTO-UPDATE updated_at TRIGGER FUNCTION
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_plans_updated_at
    BEFORE UPDATE ON plans
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_user_plan_updated_at
    BEFORE UPDATE ON user_plan
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_onboarding_updated_at
    BEFORE UPDATE ON onboarding
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_weekly_actions_updated_at
    BEFORE UPDATE ON weekly_actions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
