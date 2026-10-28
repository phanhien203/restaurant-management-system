# US-10 Monitoring, logging & backup

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-09](US-09-infrastructure-and-deployment.md) |

## Story

**As an** operator, **I want** errors, uptime and backups monitored, **so that** pilot incidents are found and recoverable.

## Acceptance Criteria

1. Sentry for web and realtime; pino JSON logs with request and tenant IDs.
2. `/healthz` on each service; Uptime Kuma alerts the team (email/Telegram) within 2 min.
3. Daily encrypted `pg_dump` to object storage, 30-day retention; a restore is tested and documented.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
