-- =============================================================================
-- WELLNESS PLATFORM — SEED DATA
-- File: 03_seed.sql
-- Run order: 3rd (after 01_schema.sql and 02_indexes.sql)
--
-- Password for ALL seed users: Wellness@123
-- bcrypt hash generated with 12 rounds.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- USERS
-- Roles: 1 admin, 2 coaches, 4 members
-- ---------------------------------------------------------------------------
INSERT INTO users (id, username, email, password_hash, first_name, last_name, role, status, phone, date_of_birth, gender, timezone)
VALUES
    -- Admin
    ('a0000000-0000-0000-0000-000000000001',
     'admin_sarah',
     'sarah.admin@wellnessplatform.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Sarah', 'Mitchell', 'admin', 'active',
     '+44-7700-900001', '1985-03-12', 'female', 'Europe/London'),

    -- Coaches
    ('b0000000-0000-0000-0000-000000000001',
     'coach_james',
     'james.coach@wellnessplatform.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'James', 'Rodriguez', 'coach', 'active',
     '+44-7700-900002', '1988-07-22', 'male', 'Europe/London'),

    ('b0000000-0000-0000-0000-000000000002',
     'coach_priya',
     'priya.coach@wellnessplatform.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Priya', 'Sharma', 'coach', 'active',
     '+44-7700-900003', '1991-11-05', 'female', 'Asia/Kolkata'),

    -- Members
    ('c0000000-0000-0000-0000-000000000001',
     'member_alex',
     'alex.member@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Alex', 'Thompson', 'member', 'active',
     '+44-7700-900004', '1995-02-14', 'male', 'Europe/London'),

    ('c0000000-0000-0000-0000-000000000002',
     'member_maya',
     'maya.member@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Maya', 'Patel', 'member', 'active',
     '+44-7700-900005', '1998-06-30', 'female', 'Asia/Kolkata'),

    ('c0000000-0000-0000-0000-000000000003',
     'member_chris',
     'chris.member@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Chris', 'Walker', 'member', 'active',
     '+44-7700-900006', '1993-09-18', 'male', 'America/New_York'),

    ('c0000000-0000-0000-0000-000000000004',
     'member_lisa',
     'lisa.member@example.com',
     '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KN9e3.',
     'Lisa', 'Chen', 'member', 'inactive',
     '+44-7700-900007', '1990-12-01', 'female', 'Asia/Singapore');

-- ---------------------------------------------------------------------------
-- PLANS
-- 6 plans: 3 types × 2 durations
-- ---------------------------------------------------------------------------
INSERT INTO plans (id, plan_name, plan_type, duration, description, benefits, terms_conditions, price, is_active)
VALUES
    -- Digital Wellness — 1 Week
    ('d0000000-0000-0000-0000-000000000001',
     'Digital Wellness — Starter',
     'digital_wellness', '1_week',
     'A self-guided 7-day introduction to wellness. Track your habits, complete daily tasks, and build momentum at your own pace.',
     '["Self-guided wellness journey","Daily nutrition & fitness tasks","Progress tracking dashboard","Access to wellness article library","Weekly check-in tool"]',
     'This plan auto-renews weekly. Cancel anytime before renewal. No refunds for partially used weeks. Health advice is informational only and does not constitute medical guidance.',
     9.99, TRUE),

    -- Digital Wellness — 1 Month
    ('d0000000-0000-0000-0000-000000000002',
     'Digital Wellness — Monthly',
     'digital_wellness', '1_month',
     'A comprehensive 30-day self-guided wellness program with structured weekly plans, habit tracking, and progress insights.',
     '["Self-guided wellness journey","Structured 4-week program","Daily nutrition & fitness tasks","Progress tracking & analytics","Weekly check-in tool","Access to full wellness library"]',
     'This plan auto-renews monthly. Cancel anytime before the renewal date. No refunds for partially used months. Health advice is informational only.',
     29.99, TRUE),

    -- Coach Care — 1 Week
    ('d0000000-0000-0000-0000-000000000003',
     'Coach Care — Starter',
     'coach_care', '1_week',
     'Get personalised guidance from a dedicated wellness coach for 7 days. Includes a scheduled call, personalised task assignments, and weekly review.',
     '["Dedicated wellness coach assigned","1 scheduled coach video call","Personalised weekly task plan","Coach reviews your check-in","Direct coach messaging","Priority support"]',
     'Coach availability is subject to scheduling. Scheduled calls must be booked 24 hours in advance. Missed calls are non-refundable. Cancel anytime before renewal.',
     49.99, TRUE),

    -- Coach Care — 1 Month
    ('d0000000-0000-0000-0000-000000000004',
     'Coach Care — Monthly',
     'coach_care', '1_month',
     'A full month of personalised coaching. Your coach designs your weekly plan, reviews progress, and adapts your programme every week.',
     '["Dedicated wellness coach assigned","4 scheduled coach video calls (weekly)","Fully personalised monthly plan","Coach reviews every weekly check-in","Direct messaging (48h response SLA)","Progress report at month end","Priority support"]',
     'Calls must be booked 24 hours in advance. Unused calls do not roll over. Cancel before renewal for a full refund of the unused portion.',
     149.99, TRUE),

    -- Medical Care — 1 Week
    ('d0000000-0000-0000-0000-000000000005',
     'Medical Care — Starter',
     'medical_care', '1_week',
     'Healthcare-backed wellness support for 7 days. Suitable for members with specific medical conditions or who require clinical oversight.',
     '["Healthcare professional oversight","Initial health assessment","Medically reviewed task plan","Emergency escalation protocol","Secure health data handling","Doctor clearance workflow"]',
     'This plan does not replace professional medical treatment. Content is reviewed by qualified healthcare professionals. In an emergency, contact your local emergency services immediately. Medical data is processed under GDPR Art. 9.',
     79.99, TRUE),

    -- Medical Care — 1 Month
    ('d0000000-0000-0000-0000-000000000006',
     'Medical Care — Monthly',
     'medical_care', '1_month',
     'A month of clinically supported wellness. Ideal for members managing chronic conditions, post-rehabilitation, or requiring medically tailored programmes.',
     '["Healthcare professional oversight","Comprehensive health assessment","Medically reviewed monthly programme","Weekly clinical check-in review","Secure health record access","Emergency escalation protocol","Doctor clearance workflow","Priority clinical support"]',
     'Does not replace medical treatment. By enrolling you confirm you have or will obtain doctor clearance where required. Processed under GDPR Art. 9 with explicit consent.',
     249.99, TRUE);

-- ---------------------------------------------------------------------------
-- USER_PLAN
-- Assign members to plans
-- ---------------------------------------------------------------------------
INSERT INTO user_plan (id, user_id, plan_id, start_date, end_date, status)
VALUES
    -- Alex: Coach Care Monthly (active)
    ('e0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'd0000000-0000-0000-0000-000000000004',
     '2026-06-01', '2026-07-01', 'active'),

    -- Maya: Digital Wellness Monthly (active)
    ('e0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000002',
     'd0000000-0000-0000-0000-000000000002',
     '2026-06-01', '2026-07-01', 'active'),

    -- Chris: Digital Wellness Starter (active)
    ('e0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000003',
     'd0000000-0000-0000-0000-000000000001',
     '2026-06-09', '2026-06-16', 'active'),

    -- Lisa: Coach Care Monthly (expired — inactive user)
    ('e0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000004',
     'd0000000-0000-0000-0000-000000000004',
     '2026-05-01', '2026-06-01', 'expired');

-- ---------------------------------------------------------------------------
-- ONBOARDING
-- ---------------------------------------------------------------------------
INSERT INTO onboarding (
    id, user_id,
    step_1_data, step_2_data, step_3_data, step_4_data, step_5_data,
    current_step, onboarding_status, gdpr_consent, completed_at
)
VALUES
    -- Alex: fully completed onboarding
    ('f0000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     '{"dob":"1995-02-14","gender":"male","timezone":"Europe/London"}',
     '{"height_cm":178,"weight_kg":82,"fitness_level":"intermediate"}',
     '{"primary_goal":"weight_loss","target_timeline_weeks":12}',
     '{"dietary_prefs":["none"],"equipment":["gym"],"days_per_week":4,"session_duration_min":45}',
     '{"injuries":[],"medical_conditions":[],"doctor_clearance":false}',
     5, 'completed', TRUE, '2026-06-01 10:30:00+00'),

    -- Maya: fully completed onboarding
    ('f0000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000002',
     '{"dob":"1998-06-30","gender":"female","timezone":"Asia/Kolkata"}',
     '{"height_cm":162,"weight_kg":56,"fitness_level":"beginner"}',
     '{"primary_goal":"general_wellness","target_timeline_weeks":4}',
     '{"dietary_prefs":["vegetarian"],"equipment":["home"],"days_per_week":3,"session_duration_min":30}',
     NULL,
     5, 'completed', FALSE, '2026-06-01 08:15:00+00'),

    -- Chris: in progress at step 3
    ('f0000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000003',
     '{"dob":"1993-09-18","gender":"male","timezone":"America/New_York"}',
     '{"height_cm":185,"weight_kg":90,"fitness_level":"advanced"}',
     NULL, NULL, NULL,
     3, 'in_progress', FALSE, NULL),

    -- Lisa: completed (but plan expired)
    ('f0000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000004',
     '{"dob":"1990-12-01","gender":"female","timezone":"Asia/Singapore"}',
     '{"height_cm":158,"weight_kg":60,"fitness_level":"beginner"}',
     '{"primary_goal":"stress_relief","target_timeline_weeks":4}',
     '{"dietary_prefs":["vegan"],"equipment":["home"],"days_per_week":3,"session_duration_min":20}',
     '{"injuries":["lower_back"],"medical_conditions":["anxiety"],"doctor_clearance":true}',
     5, 'completed', TRUE, '2026-05-01 12:00:00+00');

-- ---------------------------------------------------------------------------
-- WEEKLY_ACTIONS
-- Actions for current week (week 24, 2026) for Alex and Maya
-- ---------------------------------------------------------------------------
INSERT INTO weekly_actions (
    id, user_id, created_by,
    title, description, category,
    week_number, year, due_date, status, completed_at
)
VALUES
    -- Alex — week 24 nutrition tasks
    ('10000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'Log all meals today',
     'Use the food diary to log breakfast, lunch, dinner, and snacks. Aim for 2,000 kcal with 40% carbs / 30% protein / 30% fat.',
     'nutrition', 24, 2026, '2026-06-13', 'completed',
     '2026-06-13 09:15:00+00'),

    ('10000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     'Drink 2.5L of water',
     'Hydration is essential for recovery. Track your intake using the water log or a marked bottle.',
     'nutrition', 24, 2026, '2026-06-13', 'pending', NULL),

    -- Alex — week 24 fitness tasks
    ('10000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     '45-min strength session — Upper Body',
     'Bench press 3×10, Shoulder press 3×10, Lat pulldown 3×12, Bicep curl 3×12. Rest 60s between sets.',
     'fitness', 24, 2026, '2026-06-13', 'completed',
     '2026-06-13 07:00:00+00'),

    ('10000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     '30-min Zone 2 cardio',
     'Low intensity steady-state cardio. Maintain heart rate at 60–70% of max. Walk briskly or use a stationary bike.',
     'fitness', 24, 2026, '2026-06-14', 'pending', NULL),

    -- Alex — week 24 wellness task
    ('10000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000001',
     'b0000000-0000-0000-0000-000000000001',
     '10-min mindfulness meditation',
     'Use the Breathe section of the app or any guided meditation. Log your mood score before and after.',
     'wellness', 24, 2026, '2026-06-13', 'pending', NULL),

    -- Maya — week 24 nutrition task
    ('10000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000002',
     NULL,
     'Prepare a balanced vegetarian meal',
     'Cook a meal with lentils, quinoa, or tofu as the protein source. Include at least 2 portions of vegetables.',
     'nutrition', 24, 2026, '2026-06-13', 'pending', NULL),

    -- Maya — week 24 fitness task
    ('10000000-0000-0000-0000-000000000007',
     'c0000000-0000-0000-0000-000000000002',
     NULL,
     '20-min beginner yoga flow',
     'Follow the Day 1 yoga video in your plan library. Focus on breathing and holding each pose for 5 full breaths.',
     'fitness', 24, 2026, '2026-06-13', 'pending', NULL),

    -- Maya — week 24 wellness task
    ('10000000-0000-0000-0000-000000000008',
     'c0000000-0000-0000-0000-000000000002',
     NULL,
     'Journal: 3 things you are grateful for',
     'Spend 5 minutes writing in your wellness journal. Research shows gratitude journalling improves mood and reduces anxiety.',
     'wellness', 24, 2026, '2026-06-15', 'pending', NULL);

-- ---------------------------------------------------------------------------
-- CHECKINS
-- ---------------------------------------------------------------------------
INSERT INTO checkins (
    id, user_id,
    week_number, year,
    completion_percentage, mood_score, comments,
    coach_notes, reviewed_by, reviewed_at, submitted_at
)
VALUES
    -- Alex — week 23 check-in (reviewed by coach James)
    ('20000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     23, 2026, 80, 8,
     'Had a great week overall. Missed one workout on Thursday due to work but made it up on Saturday.',
     'Excellent progress Alex — consistency is the key. Make sure to prioritise rest days. Carry this momentum into week 24.',
     'b0000000-0000-0000-0000-000000000001',
     '2026-06-10 11:00:00+00',
     '2026-06-08 18:30:00+00'),

    -- Maya — week 23 check-in (not yet reviewed)
    ('20000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000002',
     23, 2026, 67, 6,
     'Struggled a bit this week with energy levels but completed the yoga sessions. Nutrition tracking felt overwhelming.',
     NULL, NULL, NULL,
     '2026-06-08 20:00:00+00'),

    -- Alex — week 22 check-in (historical)
    ('20000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000001',
     22, 2026, 100, 9,
     'Best week yet! Hit every target and feeling really good.',
     'Perfect week Alex. Keep it going.',
     'b0000000-0000-0000-0000-000000000001',
     '2026-06-03 09:00:00+00',
     '2026-06-01 19:00:00+00');

-- ---------------------------------------------------------------------------
-- NOTIFICATIONS
-- ---------------------------------------------------------------------------
INSERT INTO notifications (id, user_id, title, message, type, read_status, metadata)
VALUES
    -- Alex: unread pending action
    ('30000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'Hydration task pending',
     'You haven''t logged your water intake yet today. Stay hydrated — it''s key to your recovery!',
     'pending_action', FALSE,
     '{"action_id":"10000000-0000-0000-0000-000000000002","week":24}'),

    -- Alex: unread coach message
    ('30000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'Message from Coach James',
     'Great effort this week Alex! I''ve reviewed your check-in. Let''s discuss your goals for next week on our call Friday.',
     'coach_message', FALSE, NULL),

    -- Alex: read new update
    ('30000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000001',
     'New weekly challenge added',
     '7-day sleep improvement challenge is now live. Complete all 7 sleep hygiene tasks to earn your badge.',
     'new_update', TRUE, NULL),

    -- Maya: unread pending action (check-in)
    ('30000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000002',
     'Weekly check-in is due',
     'Week 24 is almost over. Submit your weekly check-in to keep your progress streak going!',
     'pending_action', FALSE,
     '{"week":24}'),

    -- Maya: unread new update
    ('30000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000002',
     'New beginner yoga plan added',
     'A new 4-week beginner yoga series has been added to your plan library. Check it out!',
     'new_update', FALSE, NULL),

    -- Chris: system notification (onboarding incomplete)
    ('30000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000003',
     'Complete your onboarding',
     'You''re halfway through onboarding. Finish the last 2 steps so we can set up your personalised plan.',
     'system', FALSE,
     '{"current_step":3,"onboarding_status":"in_progress"}');

-- ---------------------------------------------------------------------------
-- ACTIVITY_LOGS
-- Sample audit trail entries
-- ---------------------------------------------------------------------------
INSERT INTO activity_logs (id, user_id, activity, entity_type, entity_id, metadata, ip_address)
VALUES
    ('40000000-0000-0000-0000-000000000001',
     'c0000000-0000-0000-0000-000000000001',
     'user.login', NULL, NULL,
     '{"method":"password"}', '82.45.12.100'),

    ('40000000-0000-0000-0000-000000000002',
     'c0000000-0000-0000-0000-000000000001',
     'plan.selected', 'user_plan',
     'e0000000-0000-0000-0000-000000000001',
     '{"plan_name":"Coach Care — Monthly","plan_type":"coach_care"}', '82.45.12.100'),

    ('40000000-0000-0000-0000-000000000003',
     'c0000000-0000-0000-0000-000000000001',
     'action.completed', 'weekly_actions',
     '10000000-0000-0000-0000-000000000001',
     '{"title":"Log all meals today","category":"nutrition","week":24}', '82.45.12.100'),

    ('40000000-0000-0000-0000-000000000004',
     'c0000000-0000-0000-0000-000000000001',
     'action.completed', 'weekly_actions',
     '10000000-0000-0000-0000-000000000003',
     '{"title":"45-min strength session — Upper Body","category":"fitness","week":24}', '82.45.12.100'),

    ('40000000-0000-0000-0000-000000000005',
     'c0000000-0000-0000-0000-000000000002',
     'user.login', NULL, NULL,
     '{"method":"password"}', '103.21.56.77'),

    ('40000000-0000-0000-0000-000000000006',
     'c0000000-0000-0000-0000-000000000002',
     'checkin.submitted', 'checkins',
     '20000000-0000-0000-0000-000000000002',
     '{"week":23,"completion_percentage":67,"mood_score":6}', '103.21.56.77'),

    ('40000000-0000-0000-0000-000000000007',
     'b0000000-0000-0000-0000-000000000001',
     'checkin.reviewed', 'checkins',
     '20000000-0000-0000-0000-000000000001',
     '{"member_id":"c0000000-0000-0000-0000-000000000001","week":23}', '91.108.4.15'),

    ('40000000-0000-0000-0000-000000000008',
     'a0000000-0000-0000-0000-000000000001',
     'plan.created', 'plans',
     'd0000000-0000-0000-0000-000000000001',
     '{"plan_name":"Digital Wellness — Starter"}', '10.0.0.1');
