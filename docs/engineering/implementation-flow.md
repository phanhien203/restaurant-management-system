# Implementation Flow

| Item | Value |
|---|---|
| Document | Engineering workflow – MVP build |
| Version | 1.0 – Draft |
| Date | 2026-10-28 |
| Applies to | All work on [MVP user stories](../user-stories/README.md) |

## 1. Principles

1. **The story is the unit of work.** One story → one branch → one PR (or a short stack of PRs for 5 SP stories).
2. **The spec lives in the repo.** Story files, decisions (D-xx) and ADRs are the context for both people and AI.
3. **Humans decide, AI drafts.** Claude Code plans, writes code and tests, and self-reviews. A developer approves the
   plan, owns every line that is merged, and is accountable for it.
4. **Tests prove the AC.** Each Acceptance Criterion maps to at least one automated test.
5. **`main` is always releasable** and deploys to staging automatically (US-08, US-09).

## 2. Roles

| Role | Who | Responsibilities |
|---|---|---|
| Story owner | Developer who picks the story | Approves the plan, drives Claude, verifies the result, opens the PR |
| Reviewer | The other developer | Reviews every PR; mandatory line-by-line for high-risk areas (§6) |
| AI tech lead | Claude Code main session | Plans, orchestrates the AI roles below, checks their output, self-reviews (`/review-story`) |
| AI backend dev | `backend-developer` agent | Contracts, schema, server logic, realtime publishing |
| AI frontend dev | `frontend-developer` agent | Screens, components, i18n, realtime UI |
| AI tester | `test-engineer` agent | **Independent**: writes acceptance tests from the spec before the code exists, then verifies adversarially ([Testing Guide](testing-guide.md)) |
| Product owner | PO / tech lead | Answers AC questions, accepts the story on staging |

With 2 developers (D-14), each developer works on **one story at a time**. Use a git worktree for a second story only
when the first is blocked in review.

## 3. Story Lifecycle

```
Ready ──► Plan ──► Build ──► Verify ──► Review ──► Merge ──► Accepted
          (gate:    (TDD,     (all       (AI self-   (squash,   (PO checks
          plan       small     checks     review,     staging    on staging)
          approved)  commits)  green)     human)      deploy)
```

| Stage | Who | What happens | Exit gate |
|---|---|---|---|
| **Ready** | Owner | Story meets the Definition of Ready (§4) | DoR checked |
| **Plan** | Claude → owner | `/implement-story US-xx` creates branch `feat/US-xx-<slug>`, reads the story, BR-x, D-xx and nearby code, and writes the progress file `docs/plans/US-xx-<slug>.md` (§3.1): changes, AC → test map, risks, questions, task list. **No code changes yet** | Owner approves; progress file committed as the first commit on the branch |
| **Build** | AI roles, owner supervises | 1. BE: contracts as stubs → 2. Tester: acceptance tests from the spec, red for the right reason → 3. BE/FE: implement until green, **never editing tester-owned tests** → 4. Tester: verify (gap tests, break-it checks, bug report) → 5. Fix loop. Each commit ticks its task | All tasks ticked, tests green, no open high/medium bugs, *Test report* filled |
| **Verify** | Claude + owner | `pnpm lint`, `typecheck`, `test`, relevant `test:e2e`; owner runs the feature in the browser (vi + en, mobile width for guest screens). Results recorded in the progress file | All green, owner saw it work |
| **Review** | Claude, then reviewer | `/review-story US-xx` (AC coverage, rules in `CLAUDE.md`, DoD). Then PR with the template; the other developer reviews | 1 approval, CI green, conversations resolved |
| **Merge** | Owner | Squash merge; staging deploys | Staging healthy |
| **Accepted** | PO | Demo on staging against the AC | Story marked done |

### 3.1 Plan & progress file

Every story has `docs/plans/US-xx-<slug>.md` ([template and rules](../plans/README.md)). It is:

- **the gate:** written and approved before any code changes, committed alone (`docs(plan): US-xx implementation plan`);
- **the progress tracker:** status (`Planned → In progress → In review → Done`, or `Blocked`), ticked tasks,
  dated log entries, verification results;
- **the hand-over:** a new session (`/implement-story US-xx` again) or the other developer resumes from it without
  re-reading the whole conversation;
- **the audit trail:** plan changes after approval are logged with reason and approver, never rewritten silently.

Reviewers read the progress file first, then the code.

## 4. Definition of Ready

- Acceptance Criteria are testable and unambiguous; open questions answered.
- All `Depends on` stories are merged.
- Any new decision needed is recorded (D-xx in the backlog README or an ADR).
- Fits in one sprint (≤ 5 SP). Larger work is split before it starts.

Definition of Done: see [backlog README §3](../user-stories/README.md#3-story-conventions).

## 5. Conventions

| Topic | Rule |
|---|---|
| Branch | `feat/US-xx-<slug>`, `fix/<slug>`, `chore/<slug>`; short-lived (≤ 3 days) |
| Commit | Conventional Commits, scope = workspace or module, footer `Refs: US-xx`. E.g. `feat(ordering): submit cart as a round` |
| PR | Title `US-xx <story title>`; template in `.github/pull_request_template.md`; ≤ ~400 changed lines excluding generated files, otherwise stack PRs |
| Merge | Squash; delete branch |
| Migrations | One migration per PR where possible; never edit a merged migration |
| Decisions | Anything that changes a D-xx or adds a cross-cutting pattern → ADR in `docs/adr/` in the same PR |
| Story changes | AC changes go through the PO and are a separate commit to the story file |

## 6. AI Guardrails

### High-risk areas — human reviews every line

| Area | Why |
|---|---|
| Tenant scoping, Prisma extension, raw queries (US-04) | A bug leaks one restaurant's data to another |
| Auth, sessions, guest table token (US-13, US-23, US-50) | Account takeover, fake orders |
| Permissions (US-15) | Staff doing actions above their role |
| Money: bill totals, discounts, payments, VietQR payload (US-41 – US-44) | Financial loss, wrong VietQR amount |
| Migrations on existing data | Irreversible in production |

For these, the PR description states the threat considered and the test that covers it.

### How we use Claude Code

- **One story per session.** `/clear` between stories so context does not leak.
- **Plan before code.** No code change before the progress file is approved and committed.
- **Update progress as you go.** Tick tasks in the same commit as the code; log at the end of every session.
- **The story file wins.** Claude must not change AC, scope or D-xx on its own; it stops and asks.
- **Verify, don't trust.** Claude's claim that tests pass is checked in the terminal output or CI.
- **No new dependencies silently.** Every new package is named and justified in the PR.
- **Tests come from the spec, not from the code.** The tester writes them first and owns them; developers who
  think a test is wrong raise it, they never edit it. Rules in the [Testing Guide](testing-guide.md).
- **Watch for AI-typical defects:** invented APIs or Prisma fields, tests that assert the implementation instead of the
  AC, missing `tenantId` filters, swallowed errors, duplicate helpers that already exist, hard-coded strings.
- **Keep `CLAUDE.md` alive.** When a review catches the same mistake twice, add a rule to `CLAUDE.md` in that PR.

### Project tooling

| Tool | Purpose |
|---|---|
| `CLAUDE.md` | Project context and rules loaded in every session |
| `/implement-story US-xx` | Ready check → plan/progress file → build → verify → PR draft; re-run to resume a story |
| `docs/plans/US-xx-*.md` | Approved plan + progress of each story |
| `.claude/agents/` | `backend-developer`, `frontend-developer`, `test-engineer` role definitions |
| `/review-story US-xx` | Self-review of the branch against AC, `CLAUDE.md` rules and DoD |
| `/code-review`, `/security-review` (built-in) | Extra bug / security pass; `/security-review` is required for §6 high-risk PRs |
| `.claude/settings.json` | Shared permissions: safe commands allowed, secrets and destructive commands denied |

## 7. Sprint Cadence (2-week sprints, D-14)

| When | Event | Output |
|---|---|---|
| Day 1 | Planning (1 h) | Sprint stories confirmed against release plan; owners assigned; DoR checked |
| Daily | Async update (Slack/Zalo): done / next / blocked | Blockers raised same day |
| Day 6 | Mid-sprint demo on staging (30 min) | Early PO feedback |
| Day 8 | Refinement (45 min) | Next sprint's stories meet DoR |
| Day 10 | Review + retro (1 h) | Accepted stories; one improvement, often a `CLAUDE.md` rule |

## 8. Bootstrapping (Sprint 1 – 2)

The guardrails are built by the first stories, so temporary rules apply until they exist:

| Until merged | Temporary rule |
|---|---|
| US-01 (tooling) | Reviewer runs `tsc`/lint manually; Conventional Commits by hand |
| US-07 (tests) | US-03/US-04 tests may be written but run locally only |
| US-08 (CI) | PR shows pasted output of lint/typecheck/test; branch protection on `main` turned on as part of US-08 |
| US-09 (deploy) | "Deployed to staging" in DoD is replaced by "runs with `docker compose` locally" |

Recommended order inside Sprint 1: US-01 → (US-02 ∥ US-05) → US-03 → US-04. US-04 is high-risk (§6): both developers review it.
