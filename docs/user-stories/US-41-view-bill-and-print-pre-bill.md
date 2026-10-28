# US-41 View bill and print pre-bill

| Field | Value |
|---|---|
| Epic | EP-07 Billing & Payment |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-33](US-33-confirm-or-reject-qr-orders.md) |

## Story

**As a** cashier, **I want** to see a table's bill and print a pre-bill, **so that** guests can check it before paying.

## Acceptance Criteria

1. Bill includes all non-cancelled items of the session with modifiers, subtotal, discount, service charge, VAT, total.
2. Pre-bill (80 mm, browser print) shows bill code and a dynamic VietQR with the exact amount (D-12).
3. Calculation logic lives in `packages/shared` with unit tests for rounding and VAT-inclusive/exclusive cases.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
