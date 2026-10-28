# US-06 Realtime service

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-04](US-04-tenant-data-isolation.md), [US-05](US-05-web-app-skeleton.md) |

## Story

**As a** staff member or guest, **I want** screens to update instantly, **so that** orders and statuses are never stale.

## Acceptance Criteria

1. `apps/realtime` (Socket.IO + Redis adapter) with rooms: `branch:{id}`, `station:{id}`, `session:{id}`.
2. Web publishes domain events to Redis after DB commit; realtime fans them out.
3. Socket handshake authenticates staff session or guest token; joining another tenant's room is rejected.
4. Clients resync state on reconnect; event delivery p95 ≤ 2 s.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
