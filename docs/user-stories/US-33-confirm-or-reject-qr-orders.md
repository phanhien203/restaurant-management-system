# US-33 Confirm or reject QR orders

| Field | Value |
|---|---|
| Epic | EP-05 Waiter App |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-26](US-26-review-cart-and-submit-a-round.md), [US-32](US-32-real-time-alerts.md) |

## Story

**As a** waiter, **I want** to review each QR order before it reaches the kitchen, **so that** mistaken or prank orders are stopped.

## Acceptance Criteria

1. Waiter can confirm, edit (quantity, options, remove items) with the guest, or reject with a reason.
2. Confirmed items are sent to KDS stations; guests see status change live.
3. Rejections and edits are written to the audit log (BR-7).

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
