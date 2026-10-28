# US-08 CI pipeline

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 2 SP |
| Depends on | [US-07](US-07-testing-framework.md) |

## Story

**As a** team, **I want** every pull request checked automatically, **so that** `main` is always releasable.

## Acceptance Criteria

1. GitHub Actions on PR: install (cached) → lint → typecheck → unit → build → E2E.
2. Merge to `main` requires green checks and one review.
3. On `main`, Docker images for `web` and `realtime` are built and pushed to GHCR, tagged with the commit SHA.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
