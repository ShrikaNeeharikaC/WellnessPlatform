# Database — Setup Guide

## Prerequisites
- PostgreSQL 15 or higher
- `psql` CLI available in your terminal

---

## Run Order

Always execute in this order:

```
01_schema.sql   →   02_indexes.sql   →   03_seed.sql
```

---

## Step-by-Step Instructions

### 1. Create the database

```bash
psql -U postgres -c "CREATE DATABASE wellness_platform;"
```

### 2. Run the schema (tables, enums, triggers)

```bash
psql -U postgres -d wellness_platform -f database/01_schema.sql
```

### 3. Run the indexes

```bash
psql -U postgres -d wellness_platform -f database/02_indexes.sql
```

### 4. Run the seed data

```bash
psql -U postgres -d wellness_platform -f database/03_seed.sql
```

### 5. Verify

```sql
-- Connect
psql -U postgres -d wellness_platform

-- Check tables exist
\dt

-- Check seed users
SELECT username, email, role, status FROM users;

-- Check plans
SELECT plan_name, plan_type, duration, price FROM plans;

-- Check a member's active plan
SELECT u.username, p.plan_name, up.start_date, up.end_date, up.status
FROM user_plan up
JOIN users u ON u.id = up.user_id
JOIN plans p ON p.id = up.plan_id
WHERE up.status = 'active';
```

---

## Seed Users

All seed users share the password: **Wellness@123**

| Username       | Role   | Email                              |
|----------------|--------|------------------------------------|
| admin_sarah    | admin  | sarah.admin@wellnessplatform.com   |
| coach_james    | coach  | james.coach@wellnessplatform.com   |
| coach_priya    | coach  | priya.coach@wellnessplatform.com   |
| member_alex    | member | alex.member@example.com            |
| member_maya    | member | maya.member@example.com            |
| member_chris   | member | chris.member@example.com           |
| member_lisa    | member | lisa.member@example.com (inactive) |

---

## Tables Summary

| Table          | Purpose                                      | Rows (seed) |
|----------------|----------------------------------------------|-------------|
| users          | All platform users                           | 7           |
| plans          | Plan catalog (3 types × 2 durations)         | 6           |
| user_plan      | Member-plan enrollments                      | 4           |
| onboarding     | 5-step onboarding state per user             | 4           |
| weekly_actions | Tasks per member per week                    | 8           |
| checkins       | Weekly progress submissions                  | 3           |
| notifications  | In-app notification inbox                    | 6           |
| activity_logs  | Audit trail                                  | 8           |

---

## Reset (start fresh)

```bash
psql -U postgres -c "DROP DATABASE IF EXISTS wellness_platform;"
psql -U postgres -c "CREATE DATABASE wellness_platform;"
psql -U postgres -d wellness_platform -f database/01_schema.sql
psql -U postgres -d wellness_platform -f database/02_indexes.sql
psql -U postgres -d wellness_platform -f database/03_seed.sql
```
