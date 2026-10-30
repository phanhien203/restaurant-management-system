# Implementation Plans

One file per story: `docs/plans/US-xx-<slug>.md` (same slug as the story file). It holds the approved plan and the
running progress of the story, so any developer or a fresh Claude session can resume the work from it.

Rules:

- Written and approved **before any code change**; it is the first commit on the story branch.
- Updated as work proceeds: tick tasks, add a progress-log entry at the end of every working session or stage.
- Plan changes after approval are recorded under *Plan changes* (what, why, who approved), never rewritten silently.
- Deleted once the story is merged and done, in its own `docs(plan)` commit on the next story branch; git history keeps
  the record. A story that is still open (e.g. `Blocked` on part of its AC) keeps its plan. The story file stays the
  spec; the plan never redefines AC.

Status values: `Planned` → `In progress` → `In review` → `Done` (or `Blocked`, with the reason in the log).

## Template

```markdown
# US-xx <story title> – Implementation Plan

| Field | Value |
|---|---|
| Story | [US-xx](../user-stories/US-xx-<slug>.md) |
| Status | Planned |
| Owner | <developer> |
| Branch | feat/US-xx-<slug> |
| Plan approved | YYYY-MM-DD by <developer> |
| PR | — |

## Approach

2–4 sentences.

## Changes

| Area | Change |
|---|---|
| Schema / migration | |
| Contracts (`packages/shared`) | |
| Server (modules, handlers, actions) | |
| UI (routes, components) | |
| Realtime events | |
| i18n keys | |
| Env / config | |

## AC → Test Map

| AC | Test (type · location) |
|---|---|
| 1. | |

## Risks

High-risk areas touched (implementation-flow §6), threat, and covering test.

## Out of Scope

## Decisions & Questions

| # | Question | Answer (proposed / confirmed) |
|---|---|---|

## Tasks

- [ ] T1 [BE] Contracts + stubs
- [ ] T2 [QA] Acceptance tests (red for the right reason)
- [ ] T3 [BE] …
- [ ] T4 [FE] …
- [ ] T5 [QA] Verify: gap tests, break-it checks, bug report
- [ ] Verify: lint · typecheck · unit · E2E · manual (vi/en, mobile)
- [ ] `/review-story` findings fixed
- [ ] PR opened

## Plan Changes

| Date | Change | Why | Approved by |
|---|---|---|---|

## Progress Log

| Date | Entry |
|---|---|
| YYYY-MM-DD | Plan approved. |

## Test Report (tester)

| Item | Content |
|---|---|
| AC coverage | AC → tests → pass/fail |
| Break-it checks | Rule broken → test that caught it |
| Edge cases added | |
| Bugs found | Description · severity · status |
| Not tested | What and why |

## Verification

| Check | Result |
|---|---|
| lint / typecheck | |
| unit | |
| E2E | |
| manual | |
```
