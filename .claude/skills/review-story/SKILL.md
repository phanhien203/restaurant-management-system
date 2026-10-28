---
name: review-story
description: Self-review the current branch against a story's Acceptance Criteria, the CLAUDE.md rules and the Definition of Done before a PR. Use before opening or updating a story PR, or when asked to review a story branch.
argument-hint: US-xx
---

# Review story $ARGUMENTS

Review `git diff main...HEAD` (plus uncommitted changes) as a strict reviewer who did not write the code.
Read the full changed files where needed, not only the hunks.

## Checks

1. **AC coverage.** For each AC in `docs/user-stories/$ARGUMENTS-*.md`: where it is implemented and which test proves it.
   A test that only mirrors the implementation does not count (`docs/engineering/testing-guide.md` §3): expected
   values computed by the code under test, mocked Prisma or module under test, assertions on internals, missing
   unhappy paths.
2. **Test independence.** Tester-owned tests (AC → Test Map) were committed before the implementation and changed
   only in `test(...)` commits (`git log -p main..HEAD -- <test files>`); no `.skip`, weakened assertion or changed
   expected value without a logged reason. *Test report* filled in, break-it checks done for key rules.
3. **CLAUDE.md non-negotiable rules**, especially:
   - every query on tenant-owned data goes through the tenant-scoped client; tenant never taken from client input;
     new tenant-owned models have a cross-tenant test;
   - server-side session + permission check on every new Route Handler / Server Action;
   - money as integer VND; UTC storage; order snapshots;
   - input validated with a Zod schema from `packages/shared`;
   - audit entry for rejections, edits, cancellations, discounts, payments;
   - no hard-coded user-facing strings; keys present in both vi and en;
   - no edited merged migration; no secrets; new env vars in `.env.example` and the env schema.
4. **AI-typical defects:** invented APIs or fields, swallowed errors, dead code, duplicated helpers, leftover
   debug logs, TODOs without a story ID, scope creep beyond the story.
5. **Progress file** `docs/plans/$ARGUMENTS-*.md`: plan committed before the first code commit; code matches the
   approved plan or the difference is logged under *Plan changes*; all tasks ticked; *Verification* filled in;
   log up to date.
6. **Definition of Done** from the backlog README §3.
7. **High-risk areas** (implementation-flow §6): if touched, say so and recommend running `/security-review`.

## Output

1. AC table: `AC | implemented in | proven by | status (ok / gap)`.
2. Findings, most severe first, each with `file:line`, the problem, and the fix.
3. Verdict: **ready for PR** or **not ready** (with the blocking items).

Do not change code during the review unless the developer asks you to fix the findings.
