# US-49 Performance and load test

| Field | Value |
|---|---|
| Epic | EP-09 Pilot Readiness |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-43](US-43-take-payment-and-close-the-table.md) |

## Story

**As a** team, **I want** to load-test a peak service, **so that** we know the pilot will hold up.

## Acceptance Criteria

1. k6 scenario: 3 branches × 40 tables × 3 phones ordering, plus waiter/KDS sockets.
2. Targets: API p95 < 500 ms, realtime p95 ≤ 2 s, zero errors on the VPS size chosen.
3. Results and VPS sizing are documented.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
