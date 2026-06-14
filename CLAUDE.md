# WellnessPlatform — CLAUDE.md

Project-level guidance for Claude Code working in this repository.

---

## Project Overview

A full-stack wellness management web application.

| Layer      | Technology                                    |
|------------|-----------------------------------------------|
| Frontend   | React 18, MUI v5, React Router v6, Axios      |
| Backend    | FastAPI, SQLAlchemy 2.x, Pydantic v2, Python  |
| Database   | PostgreSQL 15+, pgcrypto, pg_trgm, pgvector   |
| Auth       | JWT (access 30 min) + refresh token (7 days)  |

**Hard constraint: No AI/ML components until explicitly requested.**

---

## Directory Layout

```
WellnessPlatform/
├── database/
│   ├── 01_schema.sql      # Tables, ENUMs, triggers
│   ├── 02_indexes.sql     # All indexes (unique, partial, GIN, composite)
│   └── 03_seed.sql        # Dev seed data (7 users, 6 plans, …)
├── backend/
│   ├── .env               # Copy from .env.example, never commit
│   ├── requirements.txt
│   └── app/
│       ├── main.py        # FastAPI app, CORS, lifespan startup
│       ├── core/
│       │   ├── config.py        # Pydantic BaseSettings
│       │   ├── security.py      # JWT helpers, password hashing
│       │   └── dependencies.py  # get_current_user, role guards
│       ├── database/
│       │   └── session.py       # Engine, SessionLocal, Base, get_db
│       ├── models/              # SQLAlchemy ORM models
│       ├── schemas/             # Pydantic request/response schemas
│       ├── repositories/        # Data access layer (BaseRepository + specific)
│       ├── services/            # Business logic
│       └── routers/             # FastAPI route handlers
└── frontend/
    ├── public/
    └── src/
        ├── context/       # AuthContext, NotificationContext
        ├── hooks/         # useAuth, useNotifications
        ├── services/      # axios wrappers per domain
        ├── routes/        # AppRoutes.jsx (RequireAuth, PublicOnly)
        ├── components/
        │   └── common/    # AppLayout.jsx (sidebar + Outlet)
        ├── pages/
        │   ├── auth/      # LoginPage, RegisterPage, ForgotPasswordPage
        │   ├── member/    # Dashboard, Actions, CheckIn, Notifications, Profile, Onboarding, PlanSelection
        │   ├── coach/     # CoachDashboardPage, MemberDetailPage
        │   └── admin/     # AdminDashboardPage, PlanManagerPage, UserManagerPage
        └── theme.js       # MUI theme (indigo/emerald, Inter font)
```

---

## Running the Project

### Database
```bash
# Run in order against your PostgreSQL instance
psql -U postgres -d wellness_db -f database/01_schema.sql
psql -U postgres -d wellness_db -f database/02_indexes.sql
psql -U postgres -d wellness_db -f database/03_seed.sql
```

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
pip install -r requirements.txt
cp .env.example .env           # Fill in DATABASE_URL and SECRET_KEY
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs

### Frontend
```bash
cd frontend
npm install
npm start                      # http://localhost:3000
```

### Seed credentials (all passwords: `Wellness@123`)
| Username      | Role   |
|---------------|--------|
| admin_sarah   | admin  |
| coach_james   | coach  |
| coach_priya   | coach  |
| member_alex   | member |
| member_maya   | member |

---

## Backend Patterns

### Layered architecture
```
Router → Service → Repository → SQLAlchemy Model → PostgreSQL
```
Never call the DB session directly from a router. Always go through a repository.

### Enum models
All PostgreSQL ENUMs are defined in `01_schema.sql`. SQLAlchemy models reference them with `create_type=False` to avoid recreation:
```python
ENUM('member', 'coach', 'admin', name='user_role', create_type=False)
```

### The `refresh_tokens` table
This table is **not** in the SQL schema files. It is created automatically by `Base.metadata.create_all()` on FastAPI startup (`app/main.py` lifespan). Do not add it to `01_schema.sql`.

### Repository pattern
`BaseRepository[ModelType]` provides `get / get_all / create / update / delete / save`.
Domain-specific repos (e.g. `UserRepository`) extend it with custom queries.

### Dependency injection
```python
user: User = Depends(get_current_user)       # any authenticated role
user: User = Depends(get_current_member)     # role == member
user: User = Depends(get_current_coach)      # role == coach
user: User = Depends(get_current_admin)      # role == admin
```

### Auth flow
1. `POST /api/v1/auth/login` → returns `access_token` + `refresh_token`
2. Access token expires in 30 min; refresh token stored in DB (revocable)
3. `POST /api/v1/auth/refresh` exchanges refresh token for new access token
4. `POST /api/v1/auth/logout` revokes the refresh token (`is_revoked = True`)

---

## Frontend Patterns

### Routing
- `RequireAuth` checks `isAuthenticated` + optional `roles` array
- `PublicOnly` redirects authenticated users away from login/register
- Plan selection and onboarding are **full-screen** (no sidebar)
- All dashboard pages render inside `<AppLayout />` via `<Outlet />`

### API calls
All API calls go through `src/services/api.js` (Axios instance).
- Request interceptor: injects `Authorization: Bearer <token>` from localStorage
- Response interceptor: on 401 → attempts silent refresh → retries → clears auth + redirects to `/login`

### Service files
| File                   | Covers                              |
|------------------------|-------------------------------------|
| `authService.js`       | login, register, logout, me         |
| `planService.js`       | plans CRUD, user-plan assign/history|
| `onboardingService.js` | get, step submit, complete          |
| `actionService.js`     | weekly actions CRUD                 |
| `checkinService.js`    | submit check-in, get history        |
| `notificationService.js` | list, mark-read, mark-all-read   |
| `adminService.js`      | admin users, coach members, reports |

### Theme constants
```js
primary:    #4F46E5   // Indigo
secondary:  #10B981   // Emerald
background: #F1F5F9
font:        Inter
borderRadius: 12px (cards 16px, buttons 8px)
```

---

## Database Schema Summary

### Tables
`users`, `plans`, `user_plan`, `onboarding`, `weekly_actions`, `checkins`, `notifications`, `activity_logs`, `refresh_tokens` (auto-created)

### ENUMs
`user_role` · `user_status` · `plan_type` · `plan_duration` · `user_plan_status` · `onboarding_status` · `action_category` · `action_status` · `notification_type`

### Key constraints
- `checkins`: UNIQUE(user_id, week_number, year) — one check-in per week per user
- `user_plan`: check constraint end_date > start_date
- `activity_logs`: append-only, no `updated_at` column
- `onboarding`: step data stored as 5 JSONB columns (`step_1_data` … `step_5_data`)

---

## API Reference (all under `/api/v1`)

| Method | Path                              | Role         |
|--------|-----------------------------------|--------------|
| POST   | /auth/register                    | public       |
| POST   | /auth/login                       | public       |
| POST   | /auth/refresh                     | public       |
| POST   | /auth/logout                      | any auth     |
| GET    | /auth/me                          | any auth     |
| GET    | /plans                            | any auth     |
| POST   | /plans                            | admin        |
| PUT    | /plans/{id}                       | admin        |
| DELETE | /plans/{id}                       | admin        |
| POST   | /user-plan                        | member       |
| GET    | /user-plan/active                 | member       |
| GET    | /user-plan/history                | member       |
| GET    | /onboarding                       | member       |
| POST   | /onboarding/step                  | member       |
| POST   | /onboarding/complete              | member       |
| GET    | /actions                          | member       |
| POST   | /actions                          | coach/admin  |
| PUT    | /actions/{id}                     | coach/admin  |
| DELETE | /actions/{id}                     | coach/admin  |
| GET    | /checkins                         | member       |
| POST   | /checkins                         | member       |
| GET    | /notifications                    | any auth     |
| PUT    | /notifications/read               | any auth     |
| PUT    | /notifications/read-all           | any auth     |
| GET    | /coach/members                    | coach/admin  |
| GET    | /coach/members/{id}/checkins      | coach/admin  |
| PUT    | /coach/checkins/{id}/review       | coach/admin  |
| GET    | /admin/users                      | admin        |
| PUT    | /admin/users/{id}                 | admin        |
| GET    | /admin/reports/summary            | admin        |

---

## Testing

```bash
cd backend
pytest tests/ -v
```

Test DB uses SQLite in-memory. Fixtures: `setup_db`, `client`, `registered_user`, `auth_headers`.
Tests cover: register, login, /me, refresh, logout.

---

## What NOT to do

- Do not add AI/ML features (pgvector is installed but unused by design).
- Do not write directly to the DB session from routers — use repositories.
- Do not put the `refresh_tokens` table in SQL schema files.
- Do not commit `.env` files.
- Do not use `create_type=True` on any SQLAlchemy ENUM (will conflict with PG enums in schema).
