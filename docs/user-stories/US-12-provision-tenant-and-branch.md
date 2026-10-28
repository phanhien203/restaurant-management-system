# US-12 Provision tenant and branch

| Field | Value |
|---|---|
| Epic | EP-01 Access & Administration |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-04](US-04-tenant-data-isolation.md) |

## Story

**As a** platform admin, **I want** to create a tenant, its branch and first Tenant Admin, **so that** a pilot restaurant can start.

## Acceptance Criteria

1. `/platform` page (platform-admin role only) to create, list and deactivate tenants and branches.
2. Creating a tenant creates its Tenant Admin account with a one-time password.
3. Deactivated tenants cannot log in and their QR pages show "temporarily unavailable".

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
