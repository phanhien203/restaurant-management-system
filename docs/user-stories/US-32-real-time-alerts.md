# US-32 Real-time alerts

| Field | Value |
|---|---|
| Epic | EP-05 Waiter App |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-30](US-30-live-floor-plan.md) |

## Story

**As a** waiter, **I want** alerts for new QR orders, waiter calls and bill requests, **so that** guests are served quickly.

## Acceptance Criteria

1. In-app notification with sound and vibration (where supported), listing table and type.
2. An unconfirmed QR order older than the configured threshold is escalated (highlighted, repeated alert) (BR-2).
3. Acknowledging an alert clears it for all waiters of the branch.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
