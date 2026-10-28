# US-07 Testing framework

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-02](US-02-local-development-environment.md), [US-05](US-05-web-app-skeleton.md) |

## Story

**As a** developer, **I want** unit and E2E test setups, **so that** regressions are caught before release.

## Acceptance Criteria

1. Vitest for packages and server logic, with an isolated test database.
2. Playwright E2E against the Compose stack; one smoke test (staff login) runs in CI.
3. Test data factories live in `packages/db`.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
