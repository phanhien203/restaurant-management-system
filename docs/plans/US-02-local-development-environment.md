# US-02 Local development environment – Implementation Plan

| Field | Value |
|---|---|
| Story | [US-02](../user-stories/US-02-local-development-environment.md) |
| Status | In progress |
| Owner | phanhien |
| Branch | feat/US-02-local-development-environment |
| Plan approved | 2026-10-30 by phanhien |
| PR | — |

## Approach

Split by the owner's decision (Q1): this branch delivers AC1 (Compose stack) and AC2 (`.env.example` + fail-fast Zod
env validation). AC3 (`pnpm db:reset` with demo data) needs the Prisma schema from US-03, which itself needs the
Postgres from AC1; so US-02 goes `Blocked` on AC3 after this PR, US-03 is built, and AC3 is finished on a follow-up
branch. One root `.env` (copied from `.env.example`) feeds Compose, `web` and `realtime`; loaded with Node's built-in
`process.loadEnvFile`, so no new dependency.

## Changes

| Area | Change |
|---|---|
| Schema / migration | none (US-03) |
| Contracts (`packages/shared`) | `src/env/`: Zod schemas `webEnvSchema`, `realtimeEnvSchema` (built from shared parts: database, redis, S3) and `parseEnv(schema, source)` that returns typed env or throws one error listing **every** invalid/missing variable by name and reason, never its value |
| Server (modules, handlers, actions) | `apps/web/instrumentation.ts` `register()` parses env on server start → process fails before serving; `apps/web/src/server/env.ts` exports the parsed env for server code. `apps/realtime/src/env.ts` parses on boot; on error logs the message and `process.exit(1)` |
| UI (routes, components) | none |
| Realtime events | none |
| i18n keys | none (developer-facing startup errors, not user-facing) |
| Env / config | `compose.dev.yml`: `postgres:17-alpine`, `redis:7-alpine`, `minio/minio` (all tags pinned), health checks, named volumes, ports bound to `127.0.0.1` and overridable (`${POSTGRES_PORT:-5432}` …). Root `.env.example` with every variable and a comment per variable. Load root `.env` in `next.config.ts` and `realtime` start scripts (`node --env-file-if-exists=../../.env`). README: setup steps for services + env, script/port table, troubleshooting (port in use) |

Variables (proposed): `NODE_ENV`, `DATABASE_URL`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`,
`POSTGRES_PORT`, `REDIS_URL`, `REDIS_PORT`, `S3_ENDPOINT`, `S3_REGION`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`,
`S3_BUCKET`, `MINIO_API_PORT`, `MINIO_CONSOLE_PORT`, `REALTIME_PORT`. Later stories add their own (session secret,
guest-token HMAC key) to `.env.example` and the schema in the same commit.

## AC → Test Map

| AC | Test (type · location) |
|---|---|
| 1. Compose starts PostgreSQL 17, Redis 7, MinIO | QA verify (scripted, from a clean clone): `docker compose -f compose.dev.yml up -d --wait` → all 3 healthy; `SELECT version()` reports 17.x; `redis-cli INFO server` reports 7.x; MinIO `/minio/health/live` 200; data survives `down` + `up`; `down -v` wipes it. Recorded in *Test report* |
| 2a. `.env.example` lists every variable | Unit · `packages/shared/src/env/env.test.ts`, `describe("AC2 · .env.example lists every variable")` (10 tests): schemas read exactly the planned variables (realtime: no DB/S3); every key of `webEnvSchema` ∪ `realtimeEnvSchema` appears in `.env.example`, and every key in `.env.example` is used by a schema or by Compose (no stale entries) |
| 2b. env validated with Zod, fail fast | Unit · same file, `describe("AC2 · …")` blocks: fresh `cp .env.example .env` boots; valid configurations parse to typed values; least privilege; missing or empty variables fail fast; malformed values fail fast; all problems in one error; errors never leak secrets; parseEnv is pure. Valid `.env.example` values parse; missing `DATABASE_URL`, non-URL `REDIS_URL`, non-numeric port → error naming each bad variable, all at once; error text never contains a secret value. QA verify: start `web` and `realtime` with a variable removed → process exits non-zero before listening, message names the variable |
| 3. `pnpm db:reset` migrates + seeds | **Deferred** to the follow-up branch after US-03 (Q1) |

## Risks

- **Secrets (CLAUDE.md rule 10):** `.env` stays git-ignored (already `.env*` / `!.env.example`); `.env.example` holds
  only local dev defaults; error messages print names, never values (unit test above).
- **Exposed dev services:** ports bound to `127.0.0.1` so Postgres/MinIO with default passwords are not reachable from
  the LAN.
- **Port clashes** with a locally installed Postgres/Redis: ports overridable from `.env`; README troubleshooting.
- No tenant data, money, auth or realtime logic touched.

## Out of Scope

- AC3 `pnpm db:reset` + demo seed (after US-03, Q1). Prisma setup (US-03).
- Creating the MinIO bucket, upload code (US-11). Production compose, Caddy (US-09). CI services (US-08).
- Test database for integration tests (US-07).

## Decisions & Questions

| # | Question | Answer (proposed / confirmed) |
|---|---|---|
| Q1 | AC3 seeds models that US-03 creates, and US-03 depends on US-02 | **Confirmed 2026-10-30 (owner):** do US-03 first, then finish AC3. This branch: AC1–AC2; then US-02 `Blocked` on AC3 |
| Q2 | How do AC1–AC2 reach `main` before US-03 starts (US-03 needs the Compose Postgres)? | **Confirmed 2026-10-30 (owner):** open/merge this PR with AC1–AC2 (PR body says AC3 pending); story stays open (`Blocked`) and its plan file is kept; AC3 on `feat/US-02-demo-seed` after US-03 merges |
| Q3 | One `.env` or one per app? | **Confirmed 2026-10-30 (owner):** one root `.env`; Compose reads it natively, apps load it via `process.loadEnvFile` / `--env-file-if-exists` (Node 24 built-in, no `dotenv`) |
| Q4 | Where does the env schema live? | **Confirmed 2026-10-30 (owner):** `packages/shared/src/env/` (CLAUDE.md "Zod env schema"; pure, unit-testable); only server code imports it |
| Q5 | Plans of merged stories | **Confirmed 2026-10-30 (owner):** delete them. US-01 plan removed in its own commit (T0), and `docs/plans/README.md` rule "kept after merge" updated to match |

## Tasks

- [x] T0 [BE] Remove `docs/plans/US-01-monorepo-and-tooling.md`; update the keep-after-merge rule in `docs/plans/README.md` (own commit)
- [x] T1 [BE] Contracts: env schemas + `parseEnv` signature as stubs in `packages/shared/src/env/`; `.env.example`
- [x] T2 [QA] Acceptance unit tests for AC2 (red for the right reason)
- [x] T3 [BE] `compose.dev.yml` (AC1)
- [x] T4 [BE] Implement `parseEnv`; wire fail-fast into `web` (instrumentation) and `realtime`; load root `.env`
- [x] T5 [BE] README: services, env setup, troubleshooting
- [ ] T6 [QA] Verify from a clean clone: AC1 checks, fail-fast break-it checks, gap tests, bug report
- [ ] Verify: lint · typecheck · unit · manual (`docker compose up`, `pnpm dev` with/without a variable)
- [ ] `/review-story` findings fixed
- [ ] PR opened (AC1–AC2), status `Blocked` on AC3
- [ ] AC3 on follow-up branch after US-03 merges

## Plan Changes

| Date | Change | Why | Approved by |
|---|---|---|---|
| 2026-10-30 | MinIO image `minio/minio` → `cgr.dev/chainguard/minio` pinned by digest (still MinIO, D-09 unchanged) | Official `minio/minio` and `quay.io/minio/minio` can no longer be pulled | phanhien |
| 2026-10-30 | Extra env check in `next.config.ts` for `next dev` only | Next 15 `next dev` exits 0 when the server child exits, even after `process.exit(1)` in `instrumentation.ts` | phanhien |
| 2026-10-30 | `passThroughEnv` for the Turbo `dev` task | Turbo strict env mode stripped shell variables, so `pnpm dev` reported them missing; new variables must be added there too | phanhien |

## Progress Log

| Date | Entry |
|---|---|
| 2026-10-30 | Ready check: US-01 merged (PR #1). AC3/US-03 circular dependency raised; owner chose US-03 first (Q1). Plan drafted. |
| 2026-10-30 | Plan approved by phanhien (Q2–Q4 confirmed as proposed). Next: T0. |
| 2026-10-30 | T0 done: US-01 plan removed, plans README rule updated. Next: T1. |
| 2026-10-30 | T1 contracts ready: `@rms/shared/env` (zod 4.6.7) with `webEnvSchema`, `realtimeEnvSchema`, `EnvValidationError`, `parseEnv` stub; root `.env.example`. Next: T2. |
| 2026-10-30 | T2 (QA): `packages/shared/src/env/env.test.ts`, 94 AC2 tests. Run: 84 fail with `Error: not implemented` (parseEnv stub), 10 pass already (2a: schema keys vs `.env.example`, no stub involved). lint + typecheck green. Open question: `NODE_ENV=` (empty) → tested as missing → default `development` per parseEnv JSDoc, but the schema alone rejects `""`, so parseEnv must normalise empty to undefined. Not committed (awaiting review). Next: T3. |
| 2026-10-30 | T3: `compose.dev.yml` with `postgres:17.11-alpine3.24`, `redis:7.4.12-alpine3.21` and MinIO from `cgr.dev/chainguard/minio` pinned by digest (official minio/minio and quay.io images no longer pullable; owner chose Chainguard). Credentials have no defaults (`:?`), so Compose needs `.env` or `--env-file .env.example`. `up -d --wait` all healthy, Postgres 17.11, Redis 7.4.12, MinIO live 200, ports on 127.0.0.1 only; data survives `down`/`up`, wiped by `down -v`. Next: T4. |
| 2026-10-30 | T4: `parseEnv` implemented (blank values normalised to missing, first issue per variable in schema order, no values or `cause`); shared 95/95 green. web: `instrumentation.ts` imports `src/server/env.ts` in the Node runtime and on `EnvValidationError` prints the message and `process.exit(1)`, because a throw does not stop Next 15 (`next start` kept listening and answered 500, `next dev` exited 0); `next dev` also checks in `next.config.ts` (dev phase only) since its CLI parent exits 0 whenever the server child exits. Root `.env` loaded via `process.loadEnvFile` in `next.config.ts` and `--env-file-if-exists` in realtime scripts (shell wins); `turbo.json` dev task gets `passThroughEnv` (Turbo strict mode stripped shell vars). Verified: fail-fast exit 1 naming variables, no secret in output, 200 with valid env; lint, typecheck, test, build green. Not committed. Next: T5. |
| 2026-10-30 | T5: README setup steps (Docker, `cp .env.example .env`, compose up), local services table, env variables section (how to add one), troubleshooting (invalid env, port clash, stale credentials, Docker not running). Next: T6. |
| 2026-10-30 | Session end. Done: T0–T5 (plan, env contract, AC2 tests 95/95 green, compose.dev.yml, env validation in web/realtime, README). Next: T6 tester verify from a clean clone, then owner's manual check of the real `.env` path (`cp .env.example .env` → compose up → `pnpm dev`). Blockers: none for AC1–AC2; AC3 waits for US-03 (Q1). |

## Test Report (tester)

| Item | Content |
|---|---|
| AC coverage | |
| Break-it checks | |
| Edge cases added | |
| Bugs found | |
| Not tested | |

## Verification

| Check | Result |
|---|---|
| lint / typecheck | |
| unit | |
| E2E | n/a (no UI; US-07 sets up Playwright) |
| manual | |
