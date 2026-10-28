## Story

US-xx <title> — `docs/user-stories/US-xx-<slug>.md`
Plan & progress: `docs/plans/US-xx-<slug>.md` (plan changes after approval: none)

## Approach

<!-- 2–4 sentences: what changed and why this way. -->

## Acceptance Criteria

| AC | Proven by (test) |
|---|---|
| 1. | |
| 2. | |

## Risk

- [ ] Touches a high-risk area (tenant scoping, auth/token, permissions, money, migrations) — threat considered and test: …
- [ ] `/security-review` run (required if the box above is ticked)
- New dependencies (name + why): none

## How to test manually

1.

## Checklist

- [ ] Progress file up to date (tasks ticked, test report and verification filled)
- [ ] Acceptance tests written from the spec before the code; not edited/skipped/weakened by the implementation
- [ ] `/review-story` run, findings fixed
- [ ] lint · typecheck · unit · E2E green (CI or pasted output)
- [ ] vi + en strings added
- [ ] `.env.example` / ADR / story docs updated if needed
- [ ] I have read and understand every line of this PR, including AI-written code
