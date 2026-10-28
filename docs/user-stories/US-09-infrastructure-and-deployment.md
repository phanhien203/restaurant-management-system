# US-09 Infrastructure & deployment

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-08](US-08-ci-pipeline.md) |

## Story

**As a** team, **I want** staging and production on a VPS deployed from CI, **so that** releases are repeatable.

## Acceptance Criteria

1. VPS (Singapore), hardened: SSH key only, firewall (22/80/443), unattended security updates.
2. `compose.prod.yml`: web, realtime, postgres, redis, caddy; automatic HTTPS; WebSocket proxied.
3. Merge to `main` deploys to staging; a manual approval promotes the same image to production.
4. Migrations run before the new version starts; failed health check keeps the old version.
5. Secrets stored in GitHub Environments, never in the repo.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
