# WellnessPlatform — Setup Guide

Follow these steps on a fresh Windows machine to get the project running locally.

---

## Prerequisites

Install all three before proceeding.

| Tool | Version | Download |
|------|---------|----------|
| PostgreSQL | 15+ | https://www.postgresql.org/download |
| Python | 3.11 | https://www.python.org/downloads/release/python-3119 |
| Node.js | 20+ | https://nodejs.org |

> **Important during installation:**
> - PostgreSQL: note the password you set for the `postgres` superuser
> - Python 3.11: check **"Add python.exe to PATH"**
> - Node.js: the installer adds to PATH automatically

---

## Step 1 — Clone the Repository

```cmd
git clone <repository-url>
cd WellnessPlatform
```

---

## Step 2 — Database Setup

### 2a — Create the database and user

Open a terminal and connect as the PostgreSQL superuser:

```cmd
psql -U postgres
```

Run these commands inside psql (type each line and press Enter):

```sql
CREATE DATABASE wellness_db;
CREATE USER wellness_user WITH PASSWORD 'wellness_pass';
GRANT ALL PRIVILEGES ON DATABASE wellness_db TO wellness_user;
GRANT CREATE ON SCHEMA public TO wellness_user;
\q
```

### 2b — Run the schema and seed files

Navigate to the project folder, then run the three SQL files in order:

```cmd
cd "WellnessPlatform"
psql -U wellness_user -d wellness_db -f database/01_schema.sql
psql -U wellness_user -d wellness_db -f database/02_indexes.sql
psql -U wellness_user -d wellness_db -f database/03_seed.sql
```

Enter `wellness_pass` when prompted for the password.

**Expected output after 03_seed.sql:**
```
INSERT 0 7    ← users
INSERT 0 6    ← plans
INSERT 0 4    ← user_plan
INSERT 0 4    ← onboarding
INSERT 0 8    ← weekly_actions
INSERT 0 3    ← checkins
INSERT 0 6    ← notifications
INSERT 0 8    ← activity_logs
```

---

## Step 3 — Backend Setup

### 3a — Create virtual environment and install dependencies

```cmd
cd backend
py -3.11 -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
pip install "bcrypt==3.2.2"
```

> The last line pins bcrypt to a version compatible with passlib.

### 3b — Create the environment file

```cmd
copy .env.example .env
```

Open `backend\.env` in any text editor and replace the contents with:

```env
APP_NAME="Wellness Platform API"
APP_VERSION="1.0.0"
DEBUG=false
DATABASE_URL=postgresql://wellness_user:wellness_pass@localhost:5432/wellness_db
SECRET_KEY=my-super-secret-key-for-wellness-platform-2026
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
CORS_ORIGINS=["http://localhost:3000"]
```

Save the file.

### 3c — Start the backend server

```cmd
uvicorn app.main:app --reload --port 8000
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete.
```

Verify at **http://localhost:8000/docs** — you should see the full API documentation.

---

## Step 4 — Frontend Setup

Open a **second terminal** (keep the backend terminal running).

```cmd
cd WellnessPlatform/frontend
npm install
npm start
```

**Expected output:**
```
Compiled successfully!
Local: http://localhost:3000
```

The app will open automatically at **http://localhost:3000**.

---

## Seed Accounts

All seed accounts use the password: **`Wellness@123`**

| Username | Role | Access |
|----------|------|--------|
| admin_sarah | Admin | Full platform management |
| coach_james | Coach | Member management, check-in reviews |
| coach_priya | Coach | Member management, check-in reviews |
| member_alex | Member | Dashboard, actions, check-ins |
| member_maya | Member | Dashboard, actions, check-ins |
| member_chris | Member | Dashboard, actions, check-ins |
| member_lisa | Member | Dashboard, actions, check-ins |

---

## Restarting After Shutdown

PostgreSQL starts automatically on Windows boot. Just open two terminals:

**Terminal 1 — Backend:**
```cmd
cd WellnessPlatform/backend
venv\Scripts\activate
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — Frontend:**
```cmd
cd WellnessPlatform/frontend
npm start
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| `psql: command not found` | Add `C:\Program Files\PostgreSQL\15\bin` to system PATH |
| `permission denied for schema public` | Run `GRANT CREATE ON SCHEMA public TO wellness_user;` as postgres superuser |
| `CORS_ORIGINS` parse error | Make sure the value in `.env` is `["http://localhost:3000"]` with square brackets |
| `bcrypt` / password error | Run `pip install "bcrypt==3.2.2"` |
| `py -3.11` not found | Ensure Python 3.11 is installed; check with `py -0` to list versions |
| Blank white screen in browser | Open DevTools (F12) → Console to see the error |
