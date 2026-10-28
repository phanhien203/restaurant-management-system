# US-01 Monorepo & tooling – Implementation Plan

| Field | Value |
|---|---|
| Story | [US-01](../user-stories/US-01-monorepo-and-tooling.md) |
| Status | In progress |
| Owner | phanhien |
| Branch | feat/US-01-monorepo-and-tooling |
| Plan approved | 2026-10-28 by phanhien |
| PR | — |

## Approach

Set up a pnpm workspace + Turborepo with the five D-02 workspaces as **minimal, runnable skeletons** (enough for every
Turbo task to do real work in each), and put shared tooling at the root: `tsconfig.base.json` (strict), one ESLint 9
flat config, Prettier, Husky (`pre-commit` → lint-staged, `commit-msg` → commitlint). Features of the workspaces
(Next.js routes/Tailwind/i18n = US-05, Socket.IO = US-06, Prisma = US-03, Vitest setup/test DB = US-07) are left to
their stories. This is a tooling story with no business rules, so the build skips contracts and acceptance-tests-first
(implement-story §3); the tester runs mode "verify" from a clean checkout.

## Changes

| Area | Change |
|---|---|
| Root | `package.json` (`packageManager: pnpm@10.x`, `engines.node: >=22 <23`, scripts `dev lint typecheck test build format`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` (tasks + caching/outputs), `.nvmrc` (`22`), `.npmrc` (`engine-strict=true`), `.gitignore`, `.editorconfig`, `.gitattributes` (LF) |
| TypeScript | `tsconfig.base.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `exactOptionalPropertyTypes` off (friction with Prisma/Zod), `moduleResolution: bundler`; each workspace extends it; `typecheck` = `tsc --noEmit` |
| ESLint / Prettier | Root `eslint.config.mjs` (typescript-eslint `strictTypeChecked` subset: `no-explicit-any`, `ban-ts-comment` requiring description) + `eslint-config-next` for `apps/web`; `eslint-config-prettier`; `.prettierrc`, `.prettierignore` |
| Git hooks | Husky 9 (`prepare` script), lint-staged (eslint --fix + prettier on staged files), commitlint `@commitlint/config-conventional` with `scope-enum` warning only |
| `apps/web` | Minimal Next.js 15 App Router app: one page, `dev`/`build`/`lint`/`typecheck` scripts. No route groups, Tailwind or i18n (US-05) |
| `apps/realtime` | Minimal Node TS entry (`tsx watch` for dev, `tsc` build) logging start-up. No Socket.IO (US-06) |
| `packages/shared` | TS package with one placeholder export + one unit test, consumed by `web` and `realtime` (proves workspace linking and Turbo `^build` ordering) |
| `packages/db`, `packages/ui` | Empty TS packages (`src/index.ts`) with the standard scripts. Prisma = US-03, shadcn = US-05 |
| Tests | Vitest as root dev dependency; each workspace `test` = `vitest run --passWithNoTests`. Config/test DB = US-07 |
| Docs | `README.md`: setup in ≤ 5 steps + script table; `CLAUDE.md` "Commands" note updated (US-01 part available) |
| Schema, contracts, realtime events, i18n, env | None |

## AC → Test Map

Tooling story: proven by commands run from a clean checkout (tester, mode "verify"), plus one real unit test.

| AC | Test (type · location) |
|---|---|
| 1. Structure per D-02; Node 22 pinned | Check · `ls apps packages` = exactly `web realtime` / `db shared ui`; `.nvmrc` = 22; `packageManager` set; `pnpm install` under Node ≠ 22 fails with engine error |
| 2. TS strict, ESLint, Prettier, Husky + lint-staged, commitlint | Break-it · add implicit `any` / unused-index access → `pnpm typecheck` red; add `: any` and `// @ts-ignore` without reason → `pnpm lint` red; misformatted staged file is fixed by pre-commit; commit `"fixed stuff"` rejected, `"chore(shared): x"` accepted |
| 3. `pnpm dev / lint / typecheck / test / build` via Turbo across all workspaces | Check · each command runs a task in all 5 workspaces (Turbo summary), exits 0; second `build` is a full cache hit; `dev` serves the web page on :3000 and starts realtime; a type error in `packages/shared` fails `typecheck` of a dependent app. Unit · `packages/shared/src/*.test.ts` runs under `pnpm test` |
| 4. README setup ≤ 5 steps | Check · follow README literally on a fresh clone (`git clone` to new dir) → dev running; count steps |

## Risks

No high-risk area (implementation-flow §6). Practical risks:

- **Windows + Git Bash dev machines:** Husky hooks and CRLF. Mitigation: `.gitattributes` `* text=auto eol=lf`, tester runs the hooks on this Windows machine.
- **Wrong tool versions pinned** (invented/unreleased versions): install with exact latest releases of the pinned majors and record them; `pnpm install --frozen-lockfile` must pass.
- **Scope creep into US-05/06/07:** skeletons stay minimal; listed in Out of Scope.

## Out of Scope

Route groups, Tailwind, shadcn, next-intl, PWA (US-05) · Docker Compose, `.env.example`, env Zod schema, `db:reset` (US-02) · Prisma (US-03) · Socket.IO/Redis (US-06) · Vitest config, test DB, Playwright, factories (US-07) · GitHub Actions, branch protection (US-08) · Dockerfiles (US-09).

## Decisions & Questions

| # | Question | Answer (proposed / confirmed) |
|---|---|---|
| Q1 | This machine has Node **24** and no pnpm. Pin Node 22 strictly (`engine-strict`) as AC1 says? | Confirmed (2026-10-28): yes, strict. Developer installs Node 22 (e.g. `fnm`/`nvm-windows`) and enables Corepack (`corepack enable`) before T2. Strict pinning keeps local = CI = Docker image |
| Q2 | Versions | Confirmed (2026-10-28): Node 22 LTS, pnpm 10, Turbo 2, TypeScript 5.x, Next.js 15 (D-01, not 16), ESLint 9 flat config, Prettier 3, Husky 9, Vitest 3. Exact versions recorded in the log |
| Q3 | Shared tooling config as workspace packages (`packages/config-*`) or at the root? | Confirmed (2026-10-28): root files. D-02 lists exactly five workspaces; root configs need no extra package |
| Q4 | `pnpm test` before US-07 | Confirmed (2026-10-28): Vitest with `--passWithNoTests` per workspace + one real test in `packages/shared`; US-07 adds config, test DB and Playwright |
| Q5 | Commitlint scopes | Confirmed (2026-10-28): `config-conventional`; scope list (workspaces + modules from CLAUDE.md) as a **warning**, footer `Refs: US-xx` not enforced by tooling (also used by `chore`/`fix` without a story) |

## Tasks

- [ ] T1 [BE] Root workspace: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.npmrc`, `.gitignore`, `.editorconfig`, `.gitattributes`
- [ ] T2 [BE] Workspace skeletons (`apps/web`, `apps/realtime`, `packages/db|shared|ui`) with `dev lint typecheck test build` scripts; `pnpm install` + lockfile
- [ ] T3 [BE] TypeScript strict base config + ESLint flat config + Prettier; whole repo lint/typecheck/format clean
- [ ] T4 [BE] Husky + lint-staged + commitlint
- [ ] T5 [BE] README (≤ 5 steps) + CLAUDE.md commands note
- [ ] T6 [QA] Verify: clean-checkout run of every command, break-it checks (AC2), README walkthrough, test report
- [ ] Verify: lint · typecheck · test · build · dev (manual)
- [ ] `/review-story` findings fixed
- [ ] PR opened

## Plan Changes

| Date | Change | Why | Approved by |
|---|---|---|---|

## Progress Log

| Date | Entry |
|---|---|
| 2026-10-28 | Plan approved by phanhien with all proposed answers (Q1: strict Node 22 pin). Next: T1. Blocker: dev machine has Node 24 and no pnpm; Node 22 + `corepack enable` needed before T2. |

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
| E2E | n/a (no UI flow; Playwright arrives with US-07) |
| manual | |
