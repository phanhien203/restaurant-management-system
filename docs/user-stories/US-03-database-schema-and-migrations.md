# US-03 Database schema & migrations

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-02](US-02-local-development-environment.md) |

## Story

**As a** developer, **I want** a Prisma baseline schema for MVP entities, **so that** features share one consistent data model.

## Acceptance Criteria

1. Entities: Tenant, Branch, User, Zone, Table, TableSession, Category, MenuItem, ModifierGroup, Modifier, Order, OrderItem, Bill, Payment, AuditLog.
2. Every tenant-owned table has `tenantId` (+ `branchId` where relevant) and indexes on them.
3. Money is integer VND; timestamps stored in UTC, displayed in Asia/Ho_Chi_Minh.
4. OrderItem stores price and modifier snapshot at order time (BR-6).
5. Migrations are versioned and applied in CI and on deploy.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
