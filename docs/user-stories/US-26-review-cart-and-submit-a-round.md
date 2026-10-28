# US-26 Review cart and submit a round

| Field | Value |
|---|---|
| Epic | EP-04 Guest QR Ordering |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-25](US-25-choose-modifiers-and-add-to-cart.md) |

## Story

**As a** guest, **I want** to review and submit my cart, **so that** my order reaches the waiter.

## Acceptance Criteria

1. Edit quantity, options and notes; remove items; cart kept on the device until submitted.
2. Shows subtotal, service charge, VAT and total.
3. Submit creates an order (round) in status *Waiting for confirmation* and shows the round number.
4. Submission is idempotent (client key) and retried automatically on network failure.
5. Server re-validates prices, availability and session state.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
