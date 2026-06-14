# WellnessPlatform — Verification Guide

Step-by-step instructions to go from zero to a fully running application.
Two paths: **Local** (PostgreSQL + Python + Node directly) and **Docker** (one command).

---

## Prerequisites

### Local path
| Tool        | Required version | Check command          |
|-------------|-----------------|------------------------|
| PostgreSQL  | 15+             | `psql --version`       |
| Python      | 3.11+           | `python --version`     |
| Node.js     | 20+             | `node --version`       |
| npm         | 9+              | `npm --version`        |

### Docker path
| Tool           | Required version | Check command              |
|----------------|-----------------|----------------------------|
| Docker Engine  | 24+             | `docker --version`         |
| Docker Compose | v2 (plugin)     | `docker compose version`   |

---

## Path A — Local Development

### Step 1 — Create the database

```bash
# Connect as superuser
psql -U postgres

# Inside psql:
CREATE DATABASE wellness_db;
CREATE USER wellness_user WITH PASSWORD 'wellness_pass';
GRANT ALL PRIVILEGES ON DATABASE wellness_db TO wellness_user;
\q
```

### Step 2 — Run DDL scripts (in order)

```bash
psql -U wellness_user -d wellness_db -f database/01_schema.sql
psql -U wellness_user -d wellness_db -f database/02_indexes.sql
psql -U wellness_user -d wellness_db -f database/03_seed.sql
```

**Expected output after 01_schema.sql:**
```
CREATE EXTENSION
CREATE EXTENSION
CREATE TYPE        (×9 — one per ENUM)
CREATE TABLE       (×8 — users through activity_logs)
CREATE FUNCTION
CREATE TRIGGER     (×8 — set_updated_at on each table)
```

**Expected output after 02_indexes.sql:**
```
CREATE INDEX       (×20)
```

**Expected output after 03_seed.sql:**
```
INSERT 0 7         -- users
INSERT 0 6         -- plans
INSERT 0 4         -- user_plan
INSERT 0 4         -- onboarding
INSERT 0 8         -- weekly_actions
INSERT 0 3         -- checkins
INSERT 0 6         -- notifications
INSERT 0 8         -- activity_logs
```

### Step 3 — Verify seed data

```bash
psql -U wellness_user -d wellness_db -c "SELECT username, role, status FROM users ORDER BY role;"
```

Expected:
```
   username    |  role  | status
---------------+--------+--------
 admin_sarah   | admin  | active
 coach_james   | coach  | active
 coach_priya   | coach  | active
 member_alex   | member | active
 member_chris  | member | active
 member_lisa   | member | active
 member_maya   | member | active
(7 rows)
```

---

### Step 4 — Start the backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate
# macOS / Linux
source venv/bin/activate

pip install -r requirements.txt

# Create .env from template
copy .env.example .env        # Windows
cp .env.example .env          # macOS/Linux
```

Edit `backend/.env`:
```env
DATABASE_URL=postgresql://wellness_user:wellness_pass@localhost:5432/wellness_db
SECRET_KEY=any-random-string-at-least-32-characters-long
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=http://localhost:3000
```

```bash
uvicorn app.main:app --reload --port 8000
```

**Expected startup output:**
```
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
```

No errors means the `refresh_tokens` table was created by `Base.metadata.create_all()`.

---

### Step 5 — Smoke-test the API

Open http://localhost:8000/docs — you should see the FastAPI Swagger UI with all route groups.

**Test login via curl:**
```bash
curl -s -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"member_alex","password":"Wellness@123"}' | python -m json.tool
```

Expected response shape:
```json
{
  "access_token": "eyJ...",
  "refresh_token": "eyJ...",
  "token_type": "bearer"
}
```

**Test /auth/me:**
```bash
# Paste the access_token from above
curl -s http://localhost:8000/api/v1/auth/me \
  -H "Authorization: Bearer <access_token>" | python -m json.tool
```

Expected:
```json
{
  "id": "...",
  "username": "member_alex",
  "role": "member",
  "status": "active",
  ...
}
```

---

### Step 6 — Run backend tests

```bash
cd backend
pytest tests/ -v
```

Expected output:
```
tests/test_auth.py::TestRegister::test_register_success           PASSED
tests/test_auth.py::TestRegister::test_duplicate_username         PASSED
tests/test_auth.py::TestRegister::test_weak_password              PASSED
tests/test_auth.py::TestRegister::test_password_mismatch          PASSED
tests/test_auth.py::TestRegister::test_invalid_email              PASSED
tests/test_auth.py::TestLogin::test_login_success                 PASSED
tests/test_auth.py::TestLogin::test_wrong_password                PASSED
tests/test_auth.py::TestLogin::test_unknown_user                  PASSED
tests/test_auth.py::TestMeEndpoint::test_get_me                   PASSED
tests/test_auth.py::TestMeEndpoint::test_no_token                 PASSED
tests/test_auth.py::TestRefreshAndLogout::test_refresh            PASSED
tests/test_auth.py::TestRefreshAndLogout::test_logout             PASSED

12 passed in x.xx seconds
```

---

### Step 7 — Start the frontend

```bash
cd frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!

You can now view wellness-platform in the browser.
  Local:   http://localhost:3000
  On Your Network: http://xxx.xxx.xxx.xxx:3000
```

Open http://localhost:3000 — the login page should render with the indigo gradient background.

---

## Path B — Docker (all-in-one)

### Step 1 — Create root .env

```bash
copy .env.docker .env        # Windows
cp .env.docker .env          # macOS/Linux
```

Edit `.env` — at minimum change `SECRET_KEY` to a real random string:
```bash
# Generate a key
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 2 — Build and start all containers

```bash
docker compose up --build
```

First run takes ~3-5 minutes (pulls images, installs deps, builds React).

**Expected startup sequence:**
```
[db]       database system is ready to accept connections
[db]       /docker-entrypoint-initdb.d/01_schema.sql
[db]       /docker-entrypoint-initdb.d/02_indexes.sql
[db]       /docker-entrypoint-initdb.d/03_seed.sql
[backend]  Application startup complete.
[frontend] (nginx starts, no output)
```

**Verify all three containers are healthy:**
```bash
docker compose ps
```

Expected:
```
NAME                STATUS          PORTS
wellness_db         healthy         0.0.0.0:5432->5432/tcp
wellness_backend    running         0.0.0.0:8000->8000/tcp
wellness_frontend   running         0.0.0.0:80->80/tcp
```

### Step 3 — Verify Docker endpoints

| URL                              | Expected                        |
|----------------------------------|---------------------------------|
| http://localhost                 | React login page                |
| http://localhost/api/v1/plans    | JSON array of plans (no auth)   |
| http://localhost:8000/docs       | FastAPI Swagger UI              |

The React app sends API calls to `/api/v1/…` which nginx proxies to the backend container — no CORS headers needed.

### Dev mode with hot reload

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

Frontend at http://localhost:3000 (Node dev server, not nginx).
Source changes in `frontend/src/` and `backend/app/` reflect immediately.

---

## End-to-End Flow Verification

Walk through the complete member journey to confirm all layers work together.

### 1 — Register a new member

Navigate to http://localhost:3000/register (or http://localhost/register in Docker).

| Field      | Value                  |
|------------|------------------------|
| First Name | Test                   |
| Last Name  | User                   |
| Username   | testuser01             |
| Email      | testuser01@example.com |
| Password   | Wellness@123           |
| Confirm    | Wellness@123           |

Click **Create Account**. Should redirect to `/plan-selection`.

### 2 — Select a plan

- Toggle between **1 Week** and **1 Month** durations — prices should update
- Click **Choose Plan** on any card
- Accept the terms dialog
- Should redirect to `/onboarding`

### 3 — Complete onboarding (5 steps)

| Step | Fields to fill                                           |
|------|----------------------------------------------------------|
| 1    | Age, height, weight, gender                              |
| 2    | Health goals (multi-select chips)                        |
| 3    | Dietary preferences, restrictions                        |
| 4    | Fitness level, available equipment                       |
| 5    | GDPR consent checkbox — **must check to proceed**        |

On step 5, checking GDPR and clicking **Complete Onboarding** should redirect to `/dashboard`.

### 4 — Dashboard checks

- Greeting banner shows "Good morning/afternoon/evening, Test"
- 4 stat cards render (may show 0s for fresh account)
- Notification bell in top bar shows badge count

### 5 — Weekly actions

Navigate to **Weekly Actions** (`/actions`).
- Category cards (Nutrition / Fitness / Wellness) show 0/0 for a new member
- Checking/unchecking a task (if any exist) updates the completion chip optimistically

### 6 — Submit a check-in

Navigate to **Check-In** (`/checkin`).
- Drag the completion slider to 75%
- Click mood bubble 8
- Add a comment
- Click **Submit Check-In**
- Green checkmark + "Check-in submitted!" message appears
- The **Past Check-Ins** panel on the right shows the new entry

### 7 — Coach portal

Log out. Log in as `coach_james` / `Wellness@123`.

- Sidebar shows **My Members** link
- Navigate to `/coach` — member table should list assigned members
- Click **View** on a member — check-in history loads
- Click **Review** on a check-in — submit coach notes
- Member's check-in entry should now show "Reviewed" chip

### 8 — Admin portal

Log out. Log in as `admin_sarah` / `Wellness@123`.

- Sidebar shows **Admin Dashboard**, **Manage Plans**, **Manage Users**
- `/admin` — pie chart (users by role) and bar chart (plans by type) render
- `/admin/plans` — all 6 seed plans listed; click **Edit** on one, change price, save
- `/admin/users` — all 7 seed users listed; search filters in real time; click **Edit** to change a user's role or status

---

## Common Issues

### `psql: FATAL: role "wellness_user" does not exist`
Create the user first:
```sql
CREATE USER wellness_user WITH PASSWORD 'wellness_pass';
```

### `sqlalchemy.exc.ProgrammingError: type "user_role" already exists`
The schema was run twice. Drop and recreate the DB, then re-run the scripts.

### `ModuleNotFoundError: No module named 'app'`
Run uvicorn from inside the `backend/` directory, not the project root.

### `Network Error` in the browser (frontend can't reach API)
- Local: confirm `CORS_ORIGINS=http://localhost:3000` in `backend/.env`
- Docker: confirm `wellness_backend` container is healthy (`docker compose ps`)

### React page shows blank / white screen
Open browser DevTools → Console. Most common cause: missing `.env` variable.
Check that `REACT_APP_API_URL` is set (local: `http://localhost:8000/api/v1`, Docker: `/api/v1`).

### Docker: `wellness_db` unhealthy
```bash
docker compose logs db
```
Usually a wrong password or port conflict. Check `.env` values match across all services.

### `refresh_tokens` table missing
FastAPI creates it on startup via `Base.metadata.create_all()`. If you see errors about it, ensure `app/models/__init__.py` imports `refresh_token` before `main.py` calls `create_all`.

---

## Quick Reference

| Action                       | Local command                                      |
|------------------------------|----------------------------------------------------|
| Start DB + API + UI          | Three terminals: psql running + `uvicorn` + `npm start` |
| Run all Docker services      | `docker compose up --build`                        |
| Stop Docker services         | `docker compose down`                              |
| Wipe DB volume and restart   | `docker compose down -v && docker compose up --build` |
| View backend logs (Docker)   | `docker compose logs -f backend`                   |
| Open psql in Docker DB       | `docker compose exec db psql -U wellness_user -d wellness_db` |
| Run tests                    | `cd backend && pytest tests/ -v`                   |
| Rebuild only backend image   | `docker compose build backend`                     |
