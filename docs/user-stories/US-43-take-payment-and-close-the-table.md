# US-43 Take payment and close the table

| Field | Value |
|---|---|
| Epic | EP-07 Billing & Payment |
| Priority | Must |
| Estimate | 5 SP |
| Depends on | [US-41](US-41-view-bill-and-print-pre-bill.md) |

## Story

**As a** cashier, **I want** to record payment, **so that** the bill is settled and the table is freed.

## Acceptance Criteria

1. Methods: cash (amount tendered → change), card (recorded manually), VietQR transfer (cashier confirms receipt).
2. Multiple payments per bill (e.g. part cash, part transfer); optional tip amount.
3. When fully paid: bill closed, receipt printable, session closed, guest token expired, table → *Cleaning*.
4. A paid bill can only be reopened by a manager, with a reason (audited).

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
