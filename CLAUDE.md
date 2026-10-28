# CLAUDE.md

Multi-tenant restaurant management SaaS (Vietnam). MVP = one pilot branch running the table-ordering loop:
`QR scan → order (rounds) → waiter confirms → KDS → serve → bill → pay → table closed`.

## Where things are

| What | Where |
|---|---|
| Backlog, scope, decisions D-xx, Definition of Done | `docs/user-stories/README.md` |
| One story per file (Story + Acceptance Criteria) | `docs/user-stories/US-xx-*.md` |
| Business rules (BR-x), glossary | `docs/restaurant-management-system-requirements.md` |
| QR ordering functional spec | `docs/qr-table-ordering-requirements.md` |
| How we work (story lifecycle, PRs, AI rules) | `docs/engineering/implementation-flow.md` |
| Plan + progress of each story | `docs/plans/US-xx-*.md` |
| Testing rules (independent tester, what a valid test is) | `docs/engineering/testing-guide.md` |
| Architecture decisions made during build | `docs/adr/` |

The story file is the spec. If the code and the story disagree, ask; never edit Acceptance Criteria to fit the code.

## Stack (D-01 … D-10)

pnpm + Turborepo monorepo: `apps/web` (Next.js 15 App Router, TS), `apps/realtime` (Socket.IO + Redis pub/sub),
`packages/db` (Prisma, PostgreSQL 17, factories), `packages/shared` (Zod schemas, types, domain logic), `packages/ui` (shadcn/ui).
Tailwind, next-intl (vi, en), Vitest, Playwright. Deployed with Docker Compose on a VPS.

## Commands

> Available once US-01/US-02/US-07 are merged. Until then, say which checks you could not run.

```
pnpm install
docker compose -f compose.dev.yml up -d   # postgres, redis, minio
pnpm db:reset                             # migrate + seed demo tenant
pnpm dev
pnpm lint && pnpm typecheck && pnpm test  # run before every commit you propose
pnpm test:e2e                             # Playwright, needs the dev stack
pnpm --filter <workspace> <script>        # scope to one workspace
```

## Non-negotiable rules

1. **Tenant isolation (D-03, US-04).** Every tenant-owned model has `tenantId`. Tenant context comes from the staff
   session or the guest table token, never from request body, query or headers set by the client. Never use the raw
   (unscoped) Prisma client in request code. Every new tenant-owned model gets a cross-tenant test.
2. **Money** is integer VND (`Int`), never float. **Time** is stored in UTC, shown in `Asia/Ho_Chi_Minh`.
3. **Order snapshots (BR-6).** `OrderItem` stores price and modifiers at order time; never recompute from the menu.
4. **Authorization on the server.** Every Route Handler / Server Action checks session + permission (US-15).
   Hiding a button is not authorization.
5. **Contracts in `packages/shared`.** Zod schema first; client and server both import it. Validate all input at the boundary.
6. **Realtime:** `web` writes to the DB, then publishes to Redis; `apps/realtime` only fans out to rooms. No business logic
   or DB writes in `apps/realtime`.
7. **Audit (BR-7, US-47):** rejections, edits, cancellations, discounts, payments write an audit entry in the same transaction.
8. **i18n:** no hard-coded user-facing strings; add keys to both `vi` and `en`.
9. **Migrations:** never edit a migration that is already on `main`; add a new one.
10. **Secrets:** never read, print or commit `.env*` (except `.env.example`). Add new variables to `.env.example` and the Zod env schema.

## Code conventions

- TypeScript strict; no `any`, no `@ts-ignore` without a comment explaining why.
- Domain logic (pricing, status transitions, permissions) lives in plain functions in `packages/shared` or
  `apps/web/src/server/<module>/`, unit-tested without Next.js or the DB.
- Name modules after the epic domain: `access`, `menu`, `tables`, `ordering`, `waiter`, `kds`, `billing`, `reports`, `audit`.
- Prefer the existing pattern in the nearest module over inventing a new one. A new dependency needs a one-line
  justification in the PR.
- Comments explain *why*, not *what*.

## Working on a story

Use `/implement-story US-xx` (see `.claude/skills/implement-story`). In short:
1. One story per branch and per session (`/clear` between stories). Branch `feat/US-xx-<slug>`.
2. **No code change before the plan.** Write `docs/plans/US-xx-<slug>.md` (template in `docs/plans/README.md`),
   get the developer's approval, commit it alone. When resuming a story, read this file first.
3. Roles are separate (`.claude/agents/`): `backend-developer`, `frontend-developer`, and an **independent**
   `test-engineer` who writes the acceptance tests from the AC/spec before the code exists. Tests must reflect real
   restaurant behaviour, not the code: expected values from the spec, real test DB, unhappy paths, break-it checks
   (`docs/engineering/testing-guide.md`). Tester-owned tests are never edited, skipped or weakened by developers.
4. Keep the progress file current: tick tasks in the same commit as the code, log each session, record plan changes.
5. Run lint, typecheck, unit and relevant E2E; record results honestly, including failures and skipped checks.
6. Commits: Conventional Commits, scope = workspace or module, footer `Refs: US-xx`.
7. Before opening the PR, run `/review-story US-xx`.

Stop and ask instead of guessing when: an AC is ambiguous, the change needs a new D-xx/ADR decision, a dependency story
is not merged, or the work touches another story's scope.
