# US-02 Local development environment

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 2 SP |
| Depends on | [US-01](US-01-monorepo-and-tooling.md) |

## Story

**As a** developer, **I want** one command to start local dependencies, **so that** onboarding takes minutes.

## Acceptance Criteria

1. `docker compose -f compose.dev.yml up` starts PostgreSQL 17, Redis 7, MinIO.
2. `.env.example` lists every variable; env is validated with Zod at startup (fail fast).
3. `pnpm db:reset` migrates and seeds a demo tenant, branch, staff, menu and tables.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
