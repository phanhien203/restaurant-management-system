# US-38 Update item status and timers

| Field | Value |
|---|---|
| Epic | EP-06 Kitchen Display (KDS) |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-37](US-37-station-ticket-board.md) |

## Story

**As a** kitchen staff member, **I want** to update item status, **so that** waiters know when to pick up.

## Acceptance Criteria

1. Tap item: Confirmed → Preparing → Ready; bump the whole ticket when all items are Ready.
2. Ticket timer turns amber after 10 min and red after 20 min (defaults, configurable later).
3. Waiters can flag a ticket as Rush; it moves to the top with a marker.
4. Accidentally bumped tickets can be recalled within 5 min.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
