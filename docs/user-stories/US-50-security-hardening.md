# US-50 Security hardening

| Field | Value |
|---|---|
| Epic | EP-09 Pilot Readiness |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-23](US-23-scan-qr-and-join-the-table-session.md), [US-13](US-13-staff-login.md) |

## Story

**As a** platform owner, **I want** basic security controls verified, **so that** pilot data is protected.

## Acceptance Criteria

1. Security headers (CSP, HSTS), CSRF protection on mutations, rate limiting on login and guest endpoints.
2. Dependency and secret scanning in CI; no card data stored.
3. Checklist against OWASP ASVS L1 completed; personal data handling noted for Decree 13/2023.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
