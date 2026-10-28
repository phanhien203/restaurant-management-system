# US-23 Scan QR and join the table session

| Field | Value |
|---|---|
| Epic | EP-04 Guest QR Ordering |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-06](US-06-realtime-service.md), [US-22](US-22-generate-and-print-table-qr-codes.md) |

## Story

**As a** guest, **I want** to scan the table QR and see the menu, **so that** I can order without installing an app.

## Acceptance Criteria

1. Scanning resolves branch and table; if no session is open, one is opened (D-11) and the table becomes Occupied.
2. The guest receives a signed token bound to the session (cookie); several phones join the same session.
3. When the session closes, the token expires and the page shows "This table is closed – please ask staff" (BR-1).
4. Rate limit per IP and per table on session/order endpoints.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
