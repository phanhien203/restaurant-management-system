# Testing Guide

| Item | Value |
|---|---|
| Document | Testing rules – MVP build |
| Version | 1.0 – Draft |
| Date | 2026-10-28 |
| Related | [Implementation Flow](implementation-flow.md), D-07 |

## 1. Purpose

Tests prove that the system does what the **story, business rules and real restaurant operations** require.
A test written to match the code someone just wrote proves nothing. Therefore tests are written by an **independent
tester** (the `test-engineer` agent), from the spec, before the implementation exists.

## 2. Separation of Roles

| Role | Writes | Must not |
|---|---|---|
| `test-engineer` | Acceptance tests (unit, integration, E2E) derived from AC, BR-x and specs; edge cases; bug reports | Read the implementation before writing the acceptance tests; edit production code |
| `backend-developer` | Server code, contracts, migrations; extra unit tests for internal helpers in separate files | Edit, skip, delete or weaken tester-owned tests |
| `frontend-developer` | UI, i18n; extra component tests in separate files | Same as above |

**Tester-owned tests** are the files listed in the *AC → Test Map* of the progress file. They change only in
`test(...)` commits made by the tester. If a developer believes such a test is wrong, they stop and report it with
the spec text; the tester decides, and the decision is logged under *Plan changes*.

## 3. Rules for a Good Test

1. **Source of truth is the spec, not the code.** Every acceptance test names its source: `AC2`, `BR-6`, spec §.
2. **Expected values are computed by hand from the spec**, written as literals in the test
   (e.g. `2 × 45 000 + 10 000 = 100 000`). Never compute the expected value by calling the code under test or
   copying its formula.
3. **Test behaviour through the public boundary:** Zod contract, Server Action / Route Handler, domain function,
   rendered UI. Do not assert on private functions, internal calls or call counts.
4. **Use the real thing where it matters.** Integration tests run against the real PostgreSQL test database and
   real Prisma (tenant scoping, constraints, transactions). Mock only true external boundaries: clock, network,
   payment/bank, object storage. Never mock the module under test or Prisma.
5. **Every test must be able to fail.** Acceptance tests are run before the implementation and must fail for the
   right reason. For key rules, the tester does a *break-it check*: temporarily breaks the rule in the code
   (e.g. remove the `tenantId` filter, add 1 VND), confirms a test goes red, then reverts.
6. **Cover the unhappy paths:** invalid input, missing permission, other tenant's data, sold-out item, closed
   session, double submit, concurrent actions, network retry, boundary values (0, max, empty).
7. **Realistic data:** Vietnamese names and text with diacritics (`Phở bò tái`, `Ít cay`), VND amounts
   (`45 000`, `1 250 000`), several rounds per table, modifiers with price deltas, two branches and two tenants,
   time in `Asia/Ho_Chi_Minh` around midnight. Use the factories in `packages/db`.
8. **No snapshot tests for logic.** Snapshots only for stable generated output (e.g. VietQR payload checked
   against a known-good sample from the spec).
9. **Readable names in business language** with the source:
   `it('AC2 · waiter rejection with a reason notifies the guest and writes an audit entry')`.
10. **Deterministic:** fixed clock, seeded data, no dependency on test order; each test sets up its own data.

## 4. Test Levels

| Level | Tool | Used for | Location |
|---|---|---|---|
| Unit | Vitest | Pure domain rules: pricing, totals, discounts, status transitions, permission matrix, VietQR payload | `*.test.ts` next to the module |
| Integration | Vitest + test PostgreSQL | Server Actions / Route Handlers end to end through the DB: tenant isolation, transactions, audit entries, realtime publish | `apps/web/src/server/**/*.int.test.ts` |
| Component | Vitest + Testing Library (jsdom) | UI logic that is hard to reach via E2E (cart, modifier rules) | `*.test.tsx` next to the component |
| E2E | Playwright against the Compose stack | The user flows in the AC, across devices (guest phone, waiter, KDS) | `apps/web/e2e/US-xx-*.spec.ts` |

Rule of thumb: every AC has at least one test at the **lowest level that can prove it honestly**; every story with
UI has at least one E2E for its main flow. UI selectors use roles and labels (`getByRole`, `getByLabel`), so the
frontend must be accessible.

## 5. Test Report (filled by the tester in the progress file)

| Item | Content |
|---|---|
| AC coverage | Each AC → tests → pass/fail |
| Break-it checks | Rule broken, test that caught it |
| Edge cases added | List |
| Bugs found | Description, severity, status |
| Not tested | What and why (honest gaps) |
