# Subagent Patterns — WellnessPlatform

How to use Claude Code subagents effectively in this project.

---

## When to use subagents

Use subagents when a task:
- Requires searching across many files simultaneously (Explore agent)
- Needs an independent second opinion on a design or security decision
- Can be parallelized with other work (e.g., write backend + frontend simultaneously)
- Involves open-ended research that would pollute the main conversation context

Do NOT spawn a subagent for:
- Single-file edits
- Straightforward bug fixes
- Tasks you already know the answer to from context

---

## Recommended subagent patterns for this project

### Pattern 1 — Parallel feature build

When adding a new feature that touches both backend and frontend, spawn two agents in parallel:

```
Agent 1 (backend): "Add the /goals endpoint to FastAPI following the
  layered architecture in CLAUDE.md: model → repo → service → router.
  Use UUID PK, set_updated_at trigger, and require get_current_member.
  Do not touch the frontend."

Agent 2 (frontend): "Add GoalsPage.jsx for the /goals route in React.
  Use MUI with the indigo/emerald theme from src/theme.js.
  Wire it into AppRoutes.jsx and AppLayout.jsx nav for members.
  Do not touch the backend."
```

Wait for both to complete, then verify the API contract matches between the two.

---

### Pattern 2 — Schema change audit

Before altering the database schema, use an Explore agent to find every file affected:

```
Explore agent: "Find every file in the WellnessPlatform project that
  references the 'onboarding_status' PostgreSQL enum by name — including
  SQL files, SQLAlchemy models, Pydantic schemas, and service code.
  Report file paths and line numbers. Search breadth: very thorough."
```

Use the results to build a complete migration checklist before touching anything.

---

### Pattern 3 — Independent security review

After writing an auth-related endpoint, spawn a review agent for a second opinion:

```
Agent (general-purpose, research only): "Review the JWT refresh flow in
  backend/app/services/auth_service.py and backend/app/routers/auth.py.
  Check for: token replay attacks, is_revoked bypass, missing expiry
  validation, concurrent refresh race conditions. Report findings only —
  do not edit any files."
```

---

### Pattern 4 — Test generation

Spawn a dedicated agent to write tests after endpoint code is stable:

```
Agent (general-purpose): "Write pytest tests for the /checkins endpoints
  in backend/tests/test_checkins.py. Use the existing fixtures in
  tests/conftest.py (client, auth_headers). Cover: submit check-in,
  duplicate week rejected, get history, coach review endpoint.
  Model after the pattern in tests/test_auth.py."
```

---

### Pattern 5 — Explore before editing

Before editing any file you haven't read recently, use Explore to locate all relevant symbols:

```
Explore agent (quick): "Where is the OnboardingService defined?
  Find the file path and the method that handles step submission."
```

This avoids editing the wrong file or duplicating logic.

---

## Agent type guide

| Task type                              | Agent           |
|----------------------------------------|-----------------|
| Find files / grep for symbols          | Explore         |
| Plan a multi-file implementation       | Plan            |
| Write or edit code                     | claude (default)|
| Ask about Claude Code features/API     | claude-code-guide|
| Open-ended research with many queries  | general-purpose |

---

## Project-specific context to include in every agent prompt

When briefing any subagent on this project, include:

1. **Directory**: `D:\Neeha personal\Innova Internship\Ahealthapp\WellnessPlatform`
2. **Architecture**: Router → Service → Repository → Model (never skip layers)
3. **ENUM rule**: Always `create_type=False` on SQLAlchemy enums
4. **No AI constraint**: Do not add AI/ML features
5. **Auth pattern**: `Depends(get_current_member/coach/admin)` not manual JWT decode
6. **Frontend theme**: indigo `#4F46E5`, emerald `#10B981`, MUI v5 only (no Tailwind)

---

## Anti-patterns to avoid

- **Do not** spawn an agent to "finish the rest" of a task — finish it yourself or give explicit scope
- **Do not** use an Explore agent for a single known file path — use Read directly
- **Do not** spawn parallel agents that edit the same file (merge conflicts)
- **Do not** delegate understanding — read and synthesize results yourself before acting on them
