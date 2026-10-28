# US-04 Tenant data isolation

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-03](US-03-database-schema-and-migrations.md) |

## Story

**As a** platform owner, **I want** every query scoped to the current tenant, **so that** no tenant can ever see another tenant's data.

## Acceptance Criteria

1. Tenant context is resolved per request (staff session or guest token), never from client input.
2. A Prisma client extension injects `tenantId` into all reads/writes of tenant-owned models.
3. Automated tests prove cross-tenant read, update and delete are rejected.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
