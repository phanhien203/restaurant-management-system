# US-13 Staff login

| Field | Value |
|---|---|
| Epic | EP-01 Access & Administration |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-05](US-05-web-app-skeleton.md) |

## Story

**As a** staff member, **I want** to log in on a shared or personal device, **so that** I can access my work screens.

## Acceptance Criteria

1. Login with username + password; Argon2id hashing; session cookie httpOnly, Secure, SameSite=Lax.
2. Session lasts 12 h; logout ends it immediately; first login forces a password change.
3. 5 failed attempts lock the account for 15 min.
4. After login, the user lands on the screen for their role.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
