# US-47 Audit log

| Field | Value |
|---|---|
| Epic | EP-08 Reports & Audit |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-15](US-15-role-based-permissions.md) |

## Story

**As a** manager, **I want** a log of sensitive actions, **so that** I can investigate losses and disputes.

## Acceptance Criteria

1. Logged: order rejection/edit, item cancel, discount, bill reopen, price change, sold-out toggle, login failures.
2. Each entry: who, when, branch, action, target, before/after, reason; entries are immutable.
3. Managers can filter by date, user and action type.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
