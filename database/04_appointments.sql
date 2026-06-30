-- =============================================================================
-- WELLNESS PLATFORM — APPOINTMENTS SCHEMA + SEED
-- File: 04_appointments.sql
-- Run order: 4th (after 03_seed.sql)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- TABLE: member_coach  (one coach per member)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS member_coach (
    id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id   UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id    UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE,
    UNIQUE(member_id)
);

-- ---------------------------------------------------------------------------
-- TABLE: appointments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS appointments (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id        UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    coach_id         UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    scheduled_at     TIMESTAMPTZ NOT NULL,
    duration_minutes SMALLINT    NOT NULL DEFAULT 60,
    status           VARCHAR(20) NOT NULL DEFAULT 'confirmed'
                                 CHECK (status IN ('confirmed','cancelled','completed')),
    title            VARCHAR(200) NOT NULL DEFAULT 'Wellness Coaching Session',
    notes            TEXT,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_appointments_updated_at
    BEFORE UPDATE ON appointments
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- TABLE: coach_availability  (recurring weekly working hours)
-- day_of_week: 0=Monday ... 6=Sunday
-- start_hour / end_hour: 0-23 in UTC
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS coach_availability (
    id          UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
    coach_id    UUID     NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    start_hour  SMALLINT NOT NULL CHECK (start_hour BETWEEN 0 AND 23),
    end_hour    SMALLINT NOT NULL CHECK (end_hour BETWEEN 1 AND 24),
    is_active   BOOLEAN  NOT NULL DEFAULT TRUE,
    UNIQUE(coach_id, day_of_week, start_hour)
);

-- ---------------------------------------------------------------------------
-- SEED: Assign coaches to members
-- coach_james (b0000000-...-001) → alex (c0000000-...-001), chris (c0000000-...-003)
-- coach_priya (b0000000-...-002) → maya (c0000000-...-002), lisa  (c0000000-...-004)
-- ---------------------------------------------------------------------------
INSERT INTO member_coach (member_id, coach_id) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'b0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002'),
    ('c0000000-0000-0000-0000-000000000003', 'b0000000-0000-0000-0000-000000000001'),
    ('c0000000-0000-0000-0000-000000000004', 'b0000000-0000-0000-0000-000000000002')
ON CONFLICT (member_id) DO NOTHING;

-- ---------------------------------------------------------------------------
-- SEED: Coach availability — Mon-Fri (0-4), 09:00-17:00 UTC
-- (lunch break at 12:00-13:00 is enforced in application logic)
-- ---------------------------------------------------------------------------
INSERT INTO coach_availability (coach_id, day_of_week, start_hour, end_hour)
SELECT coach_id, dow, 9, 17
FROM
    (VALUES
        ('b0000000-0000-0000-0000-000000000001'::UUID),
        ('b0000000-0000-0000-0000-000000000002'::UUID)
    ) AS coaches(coach_id),
    generate_series(0, 4) AS days(dow)
ON CONFLICT (coach_id, day_of_week, start_hour) DO NOTHING;
