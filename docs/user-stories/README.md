# MVP User Stories – Restaurant Management SaaS

| Item | Value |
|---|---|
| Document | Product Backlog – MVP (Phase 1 pilot) |
| Version | 1.0 – Draft |
| Date | 2026-10-28 |
| Sources | [Business Requirements](../restaurant-management-system-requirements.md), [QR Table Ordering](../qr-table-ordering-requirements.md) |

## 1. MVP Scope

**Goal:** pilot restaurants run one branch end to end on the table-ordering loop:
`QR scan → order (rounds) → waiter confirms → KDS → serve → bill → pay → table closed`.

| In scope | Out of scope (later) |
|---|---|
| Tenants/branches provisioned by the platform team | Self-service sign-up, trial, subscriptions (M14) |
| Menu with modifiers, tables & QR, staff & roles | Set menus, time-of-day menus, shared chain menu |
| Guest QR ordering, Waiter App, KDS | Hold & fire, merge/split tables |
| Bill, discount, cash / card / VietQR (cashier-confirmed) | Bill splitting, auto payment confirmation, e-wallets |
| Printed receipt | E-invoices: buyer details, export, provider integration (D-13) |
| Basic sales report, audit log | Cash & shift (M6), inventory, HR, CRM, offline mode |
| Browser printing (pre-bill, kitchen ticket) | ESC/POS printer drivers |

## 2. Decisions (overridable)

| # | Topic | Decision | Rationale |
|---|---|---|---|
| D-01 | Architecture | Modular monolith: **Next.js 15 (App Router, TypeScript)** for UI + API (Route Handlers / Server Actions); separate **Socket.IO** service for realtime | One codebase, small team; realtime needs long-lived connections |
| D-02 | Repo | **pnpm + Turborepo** monorepo: `apps/web`, `apps/realtime`, `packages/db`, `packages/shared`, `packages/ui` | Shared types and validation |
| D-03 | Data | **PostgreSQL 17 + Prisma**; shared schema with `tenantId` on every tenant-owned table; money as integer VND | Simple ops; isolation enforced in code + tests |
| D-04 | Realtime | Socket.IO + **Redis 7** pub/sub (web publishes, realtime fans out to rooms) | Meets ≤ 2 s sync; scales horizontally later |
| D-05 | UI | Tailwind CSS + shadcn/ui; **next-intl** (vi, en); guest app as PWA | Fast to build, mobile-first |
| D-06 | Auth | Staff: username + password (Argon2id), DB-backed session in httpOnly cookie. Guest: HMAC-signed table-session token | No third-party IdP needed for pilot |
| D-07 | Validation & quality | Zod schemas shared by client/server; Vitest (unit), Playwright (E2E) | One source of truth for contracts |
| D-08 | Hosting | **VPS in Singapore + Docker Compose** (web, realtime, postgres, redis, caddy); Caddy for HTTPS; images in GHCR; **GitHub Actions** CI/CD | Low cost; hosting in VN not required (D6) |
| D-09 | Files & backup | S3-compatible object storage (Cloudflare R2; MinIO locally) for photos and DB backups | Cheap, no egress fees |
| D-10 | Observability | Sentry (errors), pino JSON logs, `/healthz`, Uptime Kuma | Enough for pilot |
| D-11 | Session opening | First QR scan opens a session automatically; every QR order still needs waiter confirmation | Matches spec §4.1; prank risk covered by D4 |
| D-12 | VietQR | Dynamic VietQR (EMVCo payload with amount + bill code) generated in-app to the restaurant's account | Free, no merchant contract |
| D-13 | E-invoice | **No e-invoices in MVP**: no buyer-detail capture, export or provider integration; US-45, US-46 deferred | Confirmed by PO (Q-01) |
| D-14 | Team & cadence | **2 developers**, 2-week sprints, planning velocity **20 SP/sprint**; Must stories first, Should only when capacity remains | Team size < 3 (Q-02) |

## 3. Story Conventions

- **ID:** `US-xx`, permanent, never reused. Next free ID: **US-52**.
- **Priority:** Must / Should / Won't (MVP) (MoSCoW). **SP:** story points (Fibonacci).
- **Definition of Done:** AC met · code reviewed · unit tests for business rules · E2E for the main flow passes · lint/typecheck green in CI · deployed to staging · vi/en strings added.

| Epic | Name | Stories |
|---|---|---|
| EP-00 | Project setup & platform | US-01 – US-11 |
| EP-01 | Access & administration | US-12 – US-16 |
| EP-02 | Menu | US-17 – US-20 |
| EP-03 | Tables & QR | US-21 – US-22 |
| EP-04 | Guest QR ordering | US-23 – US-29 |
| EP-05 | Waiter App | US-30 – US-36 |
| EP-06 | Kitchen Display (KDS) | US-37 – US-40 |
| EP-07 | Billing & payment | US-41 – US-46 |
| EP-08 | Reports & audit | US-47 – US-48 |
| EP-09 | Pilot readiness | US-49 – US-51 |

## 4. Story Index

| ID | Story | Epic | Priority | SP | Depends on |
|---|---|---|---|---|---|
| [US-01](US-01-monorepo-and-tooling.md) | Monorepo & tooling | EP-00 | Must | 3 | — |
| [US-02](US-02-local-development-environment.md) | Local development environment | EP-00 | Must | 2 | US-01 |
| [US-03](US-03-database-schema-and-migrations.md) | Database schema & migrations | EP-00 | Must | 5 | US-02 |
| [US-04](US-04-tenant-data-isolation.md) | Tenant data isolation | EP-00 | Must | 5 | US-03 |
| [US-05](US-05-web-app-skeleton.md) | Web app skeleton | EP-00 | Must | 3 | US-01 |
| [US-06](US-06-realtime-service.md) | Realtime service | EP-00 | Must | 5 | US-04, US-05 |
| [US-07](US-07-testing-framework.md) | Testing framework | EP-00 | Must | 3 | US-02, US-05 |
| [US-08](US-08-ci-pipeline.md) | CI pipeline | EP-00 | Must | 2 | US-07 |
| [US-09](US-09-infrastructure-and-deployment.md) | Infrastructure & deployment | EP-00 | Must | 5 | US-08 |
| [US-10](US-10-monitoring-logging-and-backup.md) | Monitoring, logging & backup | EP-00 | Must | 3 | US-09 |
| [US-11](US-11-file-storage-for-images.md) | File storage for images | EP-00 | Must | 2 | US-02 |
| [US-12](US-12-provision-tenant-and-branch.md) | Provision tenant and branch | EP-01 | Must | 3 | US-04 |
| [US-13](US-13-staff-login.md) | Staff login | EP-01 | Must | 3 | US-05 |
| [US-14](US-14-manage-staff-accounts.md) | Manage staff accounts | EP-01 | Must | 3 | US-13 |
| [US-15](US-15-role-based-permissions.md) | Role-based permissions | EP-01 | Must | 3 | US-14 |
| [US-16](US-16-branch-settings.md) | Branch settings | EP-01 | Must | 3 | US-12 |
| [US-17](US-17-manage-categories.md) | Manage categories | EP-02 | Must | 2 | US-15 |
| [US-18](US-18-manage-menu-items.md) | Manage menu items | EP-02 | Must | 5 | US-11, US-17 |
| [US-19](US-19-manage-modifiers.md) | Manage modifiers | EP-02 | Must | 5 | US-18 |
| [US-20](US-20-item-availability-sold-out.md) | Item availability (sold out) | EP-02 | Must | 2 | US-06, US-18 |
| [US-21](US-21-manage-zones-and-tables.md) | Manage zones and tables | EP-03 | Must | 3 | US-15 |
| [US-22](US-22-generate-and-print-table-qr-codes.md) | Generate and print table QR codes | EP-03 | Must | 3 | US-21 |
| [US-23](US-23-scan-qr-and-join-the-table-session.md) | Scan QR and join the table session | EP-04 | Must | 5 | US-06, US-22 |
| [US-24](US-24-browse-the-menu.md) | Browse the menu | EP-04 | Must | 5 | US-23 |
| [US-25](US-25-choose-modifiers-and-add-to-cart.md) | Choose modifiers and add to cart | EP-04 | Must | 3 | US-19, US-24 |
| [US-26](US-26-review-cart-and-submit-a-round.md) | Review cart and submit a round | EP-04 | Must | 5 | US-25 |
| [US-27](US-27-track-orders-and-running-bill.md) | Track orders and running bill | EP-04 | Should | 3 | US-26 |
| [US-28](US-28-re-order-from-earlier-rounds.md) | Re-order from earlier rounds | EP-04 | Should | 2 | US-27 |
| [US-29](US-29-call-waiter-and-request-the-bill.md) | Call waiter and request the bill | EP-04 | Must | 2 | US-23 |
| [US-30](US-30-live-floor-plan.md) | Live floor plan | EP-05 | Must | 3 | US-06, US-21 |
| [US-31](US-31-open-move-and-clean-tables.md) | Open, move and clean tables | EP-05 | Must | 3 | US-30 |
| [US-32](US-32-real-time-alerts.md) | Real-time alerts | EP-05 | Must | 3 | US-30 |
| [US-33](US-33-confirm-or-reject-qr-orders.md) | Confirm or reject QR orders | EP-05 | Must | 5 | US-26, US-32 |
| [US-34](US-34-enter-orders-for-guests.md) | Enter orders for guests | EP-05 | Must | 3 | US-30, US-19 |
| [US-35](US-35-mark-items-served.md) | Mark items served | EP-05 | Must | 2 | US-38 |
| [US-36](US-36-cancel-items.md) | Cancel items | EP-05 | Must | 3 | US-33 |
| [US-37](US-37-station-ticket-board.md) | Station ticket board | EP-06 | Must | 5 | US-06, US-33 |
| [US-38](US-38-update-item-status-and-timers.md) | Update item status and timers | EP-06 | Must | 3 | US-37 |
| [US-39](US-39-mark-sold-out-from-kds.md) | Mark sold out from KDS | EP-06 | Must | 1 | US-20, US-37 |
| [US-40](US-40-print-kitchen-ticket.md) | Print kitchen ticket | EP-06 | Should | 2 | US-37 |
| [US-41](US-41-view-bill-and-print-pre-bill.md) | View bill and print pre-bill | EP-07 | Must | 5 | US-33 |
| [US-42](US-42-apply-discounts.md) | Apply discounts | EP-07 | Must | 3 | US-41, US-15 |
| [US-43](US-43-take-payment-and-close-the-table.md) | Take payment and close the table | EP-07 | Must | 5 | US-41 |
| [US-44](US-44-pay-by-vietqr-on-the-guests-phone.md) | Pay by VietQR on the guest's phone | EP-07 | Should | 2 | US-41, US-27 |
| [US-45](US-45-capture-e-invoice-details.md) | Capture e-invoice details | EP-07 | Won't (MVP) | 2 | US-41 |
| [US-46](US-46-export-invoice-requests.md) | Export invoice requests | EP-07 | Won't (MVP) | 2 | US-45 |
| [US-47](US-47-audit-log.md) | Audit log | EP-08 | Must | 3 | US-15 |
| [US-48](US-48-daily-sales-report.md) | Daily sales report | EP-08 | Should | 5 | US-43 |
| [US-49](US-49-performance-and-load-test.md) | Performance and load test | EP-09 | Must | 3 | US-43 |
| [US-50](US-50-security-hardening.md) | Security hardening | EP-09 | Must | 3 | US-23, US-13 |
| [US-51](US-51-pilot-onboarding-kit.md) | Pilot onboarding kit | EP-09 | Should | 3 | US-19, US-22 |

## 5. Release Plan (proposed)

Total: 51 stories, 167 SP: **Must 43 (146 SP)** · Should 6 (17 SP) · Won't (MVP) 2 (4 SP).
Plan per D-14: 8 sprints of 2 weeks, starting 2026-11-02, with a one-week Tết break.

| Sprint | Dates | Stories | SP | Milestone / outcome |
|---|---|---|---|---|
| S1 | 11-02 → 11-13 | US-01, 02, 03, 04, 05 | 18 | M0 – Foundation |
| S2 | 11-16 → 11-27 | US-06, 07, 08, 09, 10, 11 | 20 | M0 – Deployed to staging, CI/CD, monitoring |
| S3 | 11-30 → 12-11 | US-12, 13, 14, 15, 16, 17, 21 | 20 | M1 – Setup & menu |
| S4 | 12-14 → 12-25 | US-18, 19, 20, 22, 23 | 20 | M1 – Restaurant configurable; guest joins a table |
| S5 | 12-28 → 01-08 | US-24, 25, 26, 29, 30 | 18 | M2 – Ordering loop |
| S6 | 01-11 → 01-22 | US-47, 31, 32, 33, 34, 36 | 20 | M2 – Waiter confirms and enters orders |
| S7 | 01-25 → 02-05 | US-37, 38, 35, 39, 41, 42 | 19 | M2 – KDS, serving, pre-bill |
| — | 02-08 → 02-12 | Tết break | — | — |
| S8 | 02-15 → 02-26 | US-43, 49, 50 + Should US-51, 48 | 19 | M3 – Payment, hardening, pilot readiness |
| **Pilot** | **2027-03-01** | Go-live at first pilot restaurant | | |

- Remaining Should stories (US-27, 28, 40, 44 – 9 SP) are pulled in only if a sprint finishes early, otherwise scheduled right after go-live.
- Risk: with 2 developers, one absence costs ~50 % of capacity. Mitigation: Should stories are the buffer; the go-live date moves before any Must story is cut.

## 6. Resolved Questions

| # | Question | Answer | Result |
|---|---|---|---|
| Q-01 | Do pilot restaurants have to issue POS-generated e-invoices under Decree 70/2025? | No e-invoices in MVP | D-13; US-45, US-46 → Won't (MVP) |
| Q-02 | Team size and target pilot date? | Team < 3 people; no date given | D-14; pilot date proposed 2027-03-01 (overridable) |
