# US-15 Role-based permissions

| Field | Value |
|---|---|
| Epic | EP-01 Access & Administration |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-14](US-14-manage-staff-accounts.md) |

## Story

**As a** Tenant Admin, **I want** actions restricted by role, **so that** sensitive actions are controlled.

## Acceptance Criteria

1. A fixed permission matrix (documented) maps roles to actions (e.g. discount, void, refund: Manager only).
2. Every API/Server Action checks permissions on the server; UI hides unavailable actions.
3. Denied attempts return 403 and are logged.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
