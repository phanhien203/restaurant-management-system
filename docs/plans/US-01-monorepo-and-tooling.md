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
| Root | `package.json` (`packageManager: pnpm@10.x`, `engines.node: >=24 <25`, scripts `dev lint typecheck test build format`), `pnpm-workspace.yaml` (`apps/*`, `packages/*`), `turbo.json` (tasks + caching/outputs), `.nvmrc` (`24`), `.npmrc` (`engine-strict=true`), `.gitignore`, `.editorconfig`, `.gitattributes` (LF) |
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
| 1. Structure per D-02; Node 24 pinned | Check · `ls apps packages` = exactly `web realtime` / `db shared ui`; `.nvmrc` = 24; `packageManager` set; `pnpm install` under Node ≠ 24 fails with engine error |
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
| Q1 | Which Node version to pin? (AC1 said 22; this machine runs Node 24, no pnpm) | Confirmed (2026-10-28): Node **24** LTS, strict (`engine-strict`), AC1 changed by the owner as PO – [ADR 0001](../adr/0001-node-24-lts.md). Developer runs `corepack enable` for pnpm |
| Q2 | Versions | Confirmed (2026-10-28, Node changed same day – see Plan Changes): Node 24 LTS, pnpm 10, Turbo 2, TypeScript 5.x, Next.js 15 (D-01, not 16), ESLint 9 flat config, Prettier 3, Husky 9, Vitest 3. Exact versions recorded in the log |
| Q3 | Shared tooling config as workspace packages (`packages/config-*`) or at the root? | Confirmed (2026-10-28): root files. D-02 lists exactly five workspaces; root configs need no extra package |
| Q4 | `pnpm test` before US-07 | Confirmed (2026-10-28): Vitest with `--passWithNoTests` per workspace + one real test in `packages/shared`; US-07 adds config, test DB and Playwright |
| Q5 | Commitlint scopes | Confirmed (2026-10-28): `config-conventional`; scope list (workspaces + modules from CLAUDE.md) as a **warning**, footer `Refs: US-xx` not enforced by tooling (also used by `chore`/`fix` without a story) |

## Tasks

- [x] T1 [BE] Root workspace: `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.nvmrc`, `.npmrc`, `.gitignore`, `.editorconfig`, `.gitattributes`
- [x] T2 [BE] Workspace skeletons (`apps/web`, `apps/realtime`, `packages/db|shared|ui`) with `dev lint typecheck test build` scripts; `pnpm install` + lockfile
- [x] T3 [BE] TypeScript strict base config + ESLint flat config + Prettier; whole repo lint/typecheck/format clean
- [x] T4 [BE] Husky + lint-staged + commitlint
- [x] T5 [BE] README (≤ 5 steps) + CLAUDE.md commands note
- [ ] T6 [QA] Verify: clean-checkout run of every command, break-it checks (AC2), README walkthrough, test report
- [ ] Verify: lint · typecheck · test · build · dev (manual)
- [ ] `/review-story` findings fixed
- [ ] PR opened

## Plan Changes

| Date | Change | Why | Approved by |
|---|---|---|---|
| 2026-10-28 | Node 22 → **Node 24 LTS** (`.nvmrc`, `engines`, AC1); [ADR 0001](../adr/0001-node-24-lts.md). Switching pnpm → yarn was considered and dropped: pnpm stays (D-02 unchanged) | Node 22 reaches EOL ~04/2027, during the pilot; dev machines run Node 24. The yarn idea came from the Node 22 blocker, which this removes | phanhien (owner, as PO) |

## Progress Log

| Date | Entry |
|---|---|
| 2026-10-28 | Plan approved by phanhien with all proposed answers (Q1: strict Node 22 pin). Next: T1. Blocker: dev machine has Node 24 and no pnpm; Node 22 + `corepack enable` needed before T2. |
| 2026-10-28 | Plan change: Node 24 LTS instead of 22, pnpm kept (see Plan Changes, ADR 0001); story AC1 updated in its own commit. Node blocker removed. Next: `corepack enable`, then T1. |
| 2026-10-28 | T1–T5 done (backend-developer), one commit each. Versions (exact): pnpm 10.34.9, turbo 2.11.10, typescript 5.9.3, next 15.5.28, react/react-dom 19.3.1, @types/react(-dom) 19.3.0, @types/node 24.19.2, eslint 9.39.5, @eslint/js 9.39.5, @eslint/eslintrc 3.3.7, typescript-eslint 8.72.1, eslint-config-next 15.5.28, eslint-config-prettier 10.1.8, prettier 3.9.10, husky 9.1.7, lint-staged 17.6.0, @commitlint/cli + config-conventional 21.2.4, vitest 3.2.7, tsx 4.23.15. Clean clone: install --frozen-lockfile, lint, typecheck, test, build (2nd run FULL TURBO), format:check all exit 0; dev serves / on :3000, realtime logs its start-up line; hooks reject `fixed stuff`, accept `chore(shared): x`. Notes: `@eslint/js` + `@eslint/eslintrc` added (ESLint core rules; FlatCompat for eslint-config-next 15); libraries + realtime use NodeNext (`tsconfig.node.json`) so `node dist/index.js` runs, web uses Bundler; packages are compiled to `dist`, so typecheck/lint/test/dev depend on `^build`; strict flags landed in T2 (Next rewrites tsconfig otherwise); `format`/`format:check` call Prettier directly at the root (not via Turbo); existing `docs/`, `.claude/`, `.github/`, `CLAUDE.md` are in `.prettierignore`. Not checked: install under Node ≠ 24 (no other Node here). Next: T6 (tester, verify). |
| 2026-10-28 | Session end. Tech lead re-ran on the branch: install --frozen-lockfile, lint, typecheck, test (shared: 2 passed), build, format:check — all exit 0. T6 tester run was started and stopped by the owner before any check; no results. Open for the owner: accept the T1–T5 implementation choices listed in the entry above (extra `@eslint/js` / `@eslint/eslintrc`, compiled packages, two tsconfigs, docs in `.prettierignore`). Next: re-run T6 (test-engineer, verify) from a clean clone. Blockers: none. |
| 2026-10-29 | Owner (phanhien) accepted the T1–T5 implementation choices (extra `@eslint/js` / `@eslint/eslintrc`, compiled packages, two tsconfigs, docs in `.prettierignore`). T6 verify run from a clean clone: AC1–AC4 pass; bugs B1 (medium, Turbo cache ignores root configs), B2–B4 (low) – see Test Report. Next: fix loop (backend-developer), tester re-verify. |

## Test Report (tester)

| Item | Content |
|---|---|
| AC coverage | 2026-10-29, test-engineer, fresh `git clone -b feat/US-01-monorepo-and-tooling` (4e45a67) into a scratch dir, Windows 11, Node 24.15.0, pnpm 10.34.9, Git Bash. **AC1 pass:** `apps` = `realtime web`, `packages` = `db shared ui`; `.nvmrc` = `24`; `packageManager: pnpm@10.34.9`; `engines.node >=24 <25` + `engine-strict=true`; `corepack pnpm -v` → 10.34.9. **AC2 pass:** see break-it checks. **AC3 pass:** `install --frozen-lockfile` exit 0 (8 s, `prepare$ husky` ran, lockfile unchanged); `lint` 6/6 tasks exit 0; `typecheck` 6/6 exit 0; `test` 6/6 exit 0 (shared: 1 file, 2 tests passed; db/realtime/ui/web: "No test files found, exiting with code 0"); `build` 5/5 exit 0 (web: `○ /`, `○ /_not-found`); 2nd `build` "Cached: 5 cached, 5 total … FULL TURBO"; `format:check` "All matched files use Prettier code style!"; `dev`: all 5 workspaces start, `curl :3000/` → HTTP 200 `<h1>RMS web</h1>`, log "RMS realtime started (pid …)"; editing `packages/shared` while dev runs hot-reloads both web (`<h1>RMSX web</h1>`) and realtime; processes killed, nothing left listening on :3000; `node apps/realtime/dist/index.js` runs. **AC4 pass:** README setup = 5 steps (Node 24 → `corepack enable` → clone → `pnpm install` → `pnpm dev`), followed literally except step 2 (see Not tested) → dev running. |
| Break-it checks | All in the clone, each reverted, `git status` clean after. (1) Implicit `any` param in `packages/shared` → `pnpm typecheck` exit 2, TS7006 (also fails `shared#build`). (2) `prices[0]` / `Record<string,number>['Phở bò']` assigned to `number` → TS2322 `number \| undefined` (noUncheckedIndexedAccess). Same two in `apps/web` and implicit any in `apps/realtime` → each app's typecheck exit 2. (3) `: any` → `no-explicit-any` error, bare `// @ts-ignore` and bare `// @ts-expect-error` → `ban-ts-comment` error, `pnpm lint` exit 1 in shared, web and realtime; `@ts-ignore: legacy` (< 10 chars) rejected, a ≥ 10-char reason accepted. (4) Next rules active only in web: conditional `useState` → `react-hooks/rules-of-hooks` error. (5) Change `serviceLabel` signature in `packages/shared` only (shared itself green) → Turbo rebuilds shared, `@rms/web#typecheck` and `@rms/realtime#typecheck` fail with TS2554 (dependent-app check). (6) Pre-commit: misformatted staged `menu.ts` (`Phở bò tái`, `Ít cay`) committed as Prettier-formatted; staged `: any` → lint-staged "Reverting to original state", commit blocked. (7) commit-msg: `fixed stuff` → `subject-empty`, `type-empty`, exit 1; `chore(shared): x` accepted; `Chore(shared): x` and a 115-char header rejected. |
| Edge cases added | CRLF file staged on Windows (`core.autocrlf=true`) → blob stored LF (`git ls-files --eol`: all 110 files `i/lf w/lf`); partially staged file (`git add -p`) → only the staged hunk committed (formatted), unstaged hunk preserved; unknown scope `feat(bep): thêm món Phở bò tái` → scope-enum warning only, accepted, diacritics intact; hooks also run when committing from PowerShell; staged README table reformatted, staged `docs/` file left alone (in `.prettierignore` on purpose); `--no-verify` bypasses hooks (expected, CI gate = US-08); **Node 22.23.4** (official zip, SHA-256 checked) on PATH → `pnpm install` fails "Your Node version is incompatible … Expected version: >=24 <25", no `node_modules`; `pnpm test` under Node 22 on an installed tree also refused; repo path with spaces (`Phan Hien`, `a b c`) → install/lint/typecheck/test/build/hooks all pass; TS file outside `src/` in a package (e.g. future `vitest.config.ts`) → lint parse error "not found by the project service" (fails closed; US-07 must add it to a tsconfig); warning-only lint (`<img>` in web) → exit 0. No automated tests added (tooling story). |
| Bugs found | **B1 (medium) – Turbo cache ignores root config files.** `turbo.json` has no `globalDependencies`, so `tsconfig.base.json`, `tsconfig.node.json`, `eslint.config.mjs` are not in any task hash. Repro: `pnpm lint` (cached) → add `'no-console': 'error'` to `eslint.config.mjs` → `pnpm lint` = "6 cached, 6 total … FULL TURBO", exit 0; `pnpm lint --force` → `@rms/realtime#lint` "Unexpected console statement", exit 1. Same with `"types": ["does-not-exist"]` in `tsconfig.base.json`: `pnpm typecheck` and `pnpm build` FULL TURBO exit 0, `--force` → TS2688 in web. Expected (AC2/AC3): a change to the shared strict/lint config is checked across all workspaces; actual: false green from cache (would also hit CI once a Turbo cache is used in US-08). Status: open. **B2 (low) – root config files are never linted by `pnpm lint`.** Each workspace runs `eslint .` in its own dir, so `eslint.config.mjs`, `commitlint.config.mjs`, `lint-staged.config.mjs` are only linted via lint-staged on commit. Repro: append `const unused = 1;` to `commitlint.config.mjs` → `pnpm lint` exit 0; `pnpm exec eslint commitlint.config.mjs` → `no-unused-vars` error. Status: open. **B3 (low, environment) – Vitest fails in a deep checkout on Windows.** With `LongPathsEnabled=0` (this machine), a repo root longer than ~148 chars pushes `node_modules/.pnpm/vite@7.3.7_…/node_modules/vite/misc/true.js` past 260 chars → `pnpm test` fails `ERR_PACKAGE_IMPORT_NOT_DEFINED "#module-sync-enabled"` (root 148 chars OK, 149 fails); lint/typecheck/build still pass. Main repo path (45 chars) is unaffected. Proposed: README note or pnpm `virtual-store-dir-max-length`. Status: open. **B4 (low, docs) – README step 1 says `nvm use`;** nvm-windows does not read `.nvmrc` (needs `nvm use 24`). Status: open. |
| Not tested | README step 2 `corepack enable` not run (would change global shims on this shared machine; pnpm 10.34.9 is already installed via npm); verified instead that `corepack pnpm -v` resolves 10.34.9 from `packageManager`. Ctrl+C shutdown of `pnpm dev` (processes were killed with `taskkill /T`; a real Ctrl+C in a terminal was not simulated). macOS/Linux and WSL. Node 25+ / Node 23 (only Node 22 tried; the `<25` bound is not exercised). Hooks from a GUI Git client (only Git Bash and PowerShell). Turbo cache invalidation on root dependency upgrades (lockfile change) not tested. |

## Verification

| Check | Result |
|---|---|
| lint / typecheck | |
| unit | |
| E2E | n/a (no UI flow; Playwright arrives with US-07) |
| manual | |
