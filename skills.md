# Skills Reference — WellnessPlatform

Custom slash commands available when working in this project with Claude Code.

---

## /db-reset

Drops and rebuilds the local development database from scratch.

**When to use:** Schema changes that require clean state, or after pulling changes to `01_schema.sql`.

**Steps performed:**
```bash
psql -U postgres -c "DROP DATABASE IF EXISTS wellness_db;"
psql -U postgres -c "CREATE DATABASE wellness_db;"
psql -U postgres -d wellness_db -f database/01_schema.sql
psql -U postgres -d wellness_db -f database/02_indexes.sql
psql -U postgres -d wellness_db -f database/03_seed.sql
```

**Note:** Destroys all local data. Never run against production.

---

## /add-seed-user

Generates a `INSERT` statement for `03_seed.sql` for a new test user.

**Prompt pattern:** `/add-seed-user role=coach username=coach_new`

**What it produces:**
- Hashed password entry compatible with bcrypt (using `Wellness@123` default)
- Correct ENUM values for `role` and `status`
- UUID generated via `gen_random_uuid()`

---

## /new-endpoint

Scaffolds a complete CRUD endpoint from a single description.

**Prompt pattern:** `/new-endpoint resource=goals`

**What it creates:**
1. `app/models/goal.py` — SQLAlchemy model
2. `app/schemas/goal.py` — Pydantic request/response schemas
3. `app/repositories/goal_repository.py` — extends BaseRepository
4. `app/services/goal_service.py` — business logic layer
5. `app/routers/goals.py` — FastAPI router
6. Wires the router into `app/main.py`

**Conventions applied automatically:**
- UUID primary key
- `created_at` / `updated_at` with trigger
- Role guard matching the resource type (member/coach/admin)
- `create_type=False` on any new ENUM

---

## /new-page

Scaffolds a new React page component.

**Prompt pattern:** `/new-page name=GoalsPage role=member path=/goals`

**What it creates:**
1. `src/pages/member/GoalsPage.jsx` — MUI-styled page skeleton
2. Adds the import and `<Route>` to `src/routes/AppRoutes.jsx`
3. Adds a nav item to the appropriate role group in `AppLayout.jsx`

**Theme applied automatically:** indigo primary, emerald secondary, borderRadius 12px, Inter font.

---

## /check-auth

Audits authentication and authorization across the codebase.

**What it checks:**
- Every FastAPI router uses the correct `Depends(get_current_*)` guard
- No endpoint is accidentally public that should be protected
- Frontend `RequireAuth` role arrays match backend role guards for the same resource
- `refresh_tokens` table rows are revoked on logout (not just deleted)

---

## /run-tests

Runs the backend test suite and summarizes failures.

```bash
cd backend && pytest tests/ -v --tb=short 2>&1
```

Reports: total passed / failed / skipped, plus the first error message for each failure.

---

## /lint-frontend

Runs ESLint on the React source and surfaces actionable errors only (ignores style warnings).

```bash
cd frontend && npx eslint src/ --ext .jsx,.js --max-warnings 0
```

---

## /api-diff

Compares the routes registered in `app/routers/` against the API table in `CLAUDE.md` and reports any mismatches (missing routes, undocumented routes, wrong HTTP methods).

---

## /migration-plan

Given a description of a schema change, produces:
1. A safe `ALTER TABLE` / `CREATE TYPE` / `CREATE INDEX` script
2. A rollback script
3. A list of SQLAlchemy model fields to update
4. A list of Pydantic schemas to update

**Does not execute anything** — outputs only the plan for review.
