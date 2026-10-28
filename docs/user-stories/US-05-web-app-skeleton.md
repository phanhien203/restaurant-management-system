# US-05 Web app skeleton

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | [US-01](US-01-monorepo-and-tooling.md) |

## Story

**As a** developer, **I want** a Next.js app with layouts for each surface, **so that** features plug into a consistent shell.

## Acceptance Criteria

1. Route groups: `/t/[qr]` (guest), `/staff` (waiter, KDS, cashier), `/admin` (back office), `/platform` (platform admin).
2. Tailwind + shadcn/ui, design tokens, mobile-first and tablet layouts.
3. next-intl with vi (default) and en; VND and date formatting helpers.
4. Guest app ships a PWA manifest; error, 404 and loading states exist.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
