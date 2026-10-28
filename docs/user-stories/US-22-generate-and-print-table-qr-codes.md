# US-22 Generate and print table QR codes

| Field | Value |
|---|---|
| Epic | EP-03 Tables & QR |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-21](US-21-manage-zones-and-tables.md) |

## Story

**As a** manager, **I want** a printable QR code per table, **so that** guests can scan to order.

## Acceptance Criteria

1. Each table gets a random, unguessable QR code (URL `/t/{code}`).
2. Print view: one card per table (table name, logo, short instructions in vi/en), A4/A6 via browser print.
3. "Replace QR" issues a new code; the old code stops working immediately.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
