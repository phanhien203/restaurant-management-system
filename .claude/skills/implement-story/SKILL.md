---
name: implement-story
description: Implement one backlog story (US-xx) end to end - ready check, implementation plan saved as a progress file for approval, test-first build, verification, PR draft. Also resumes a story from its progress file. Use when the user asks to implement, build, start or continue a story.
argument-hint: US-xx
disable-model-invocation: true
---

# Implement story $ARGUMENTS

Follow `docs/engineering/implementation-flow.md` and the rules in `CLAUDE.md`. Work in stages and stop at each gate.
The progress file is `docs/plans/$ARGUMENTS-<slug>.md` (template in `docs/plans/README.md`).

## Commit gate (applies to every commit below)

Never commit on your own, and never let a subagent commit. Every "commit" step in this skill means:

1. Finish the task (or the small group of tasks the developer agreed to review together), with the progress file
   ticked.
2. Run `pnpm lint`, `pnpm typecheck`, `pnpm test` and record the real results, including failures.
3. Stop and report: changed files, check results, and a proposed Conventional Commits message (footer
   `Refs: $ARGUMENTS`). Leave the changes uncommitted.
4. Commit only after the developer reviews the diff and explicitly says to commit. Approval covers that change set
   only, not later tasks.
5. Do not start the next task until the current one is committed, so each task has a rollback point.

## 0. Resume check

If the progress file already exists, read it and `git log main..HEAD`, then summarise: status, done tasks, next task,
open questions. Continue from the next unchecked task in the matching stage below. Do not re-plan unless the
developer asks; plan changes go under *Plan changes*.

## 1. Ready check

1. Read `docs/user-stories/$ARGUMENTS-*.md` and the backlog `docs/user-stories/README.md` (scope, D-xx, DoD).
2. Read every BR-x / spec section the story refers to, and the stories in `Depends on`.
3. Check each dependency is merged: look for its code and for `Refs: US-xx` in `git log main`.
4. Check the working tree is clean and you are up to date with `main`.

If a dependency is missing, an AC is ambiguous, or the story needs a decision not covered by D-xx/ADRs: stop and report
it with a proposed answer. Do not continue.

## 2. Plan → progress file (gate: developer approval, no code changes before it)

1. Create branch `feat/$ARGUMENTS-<slug>` from `main`.
2. Explore the relevant existing code and reuse its patterns.
3. Write `docs/plans/$ARGUMENTS-<slug>.md` from the template, status `Planned`: approach, changes, AC → test map (every
   AC covered, at the lowest level that proves it honestly – testing-guide §4), risks (implementation-flow §6),
   out of scope, questions with proposed answers, and a task list of small steps tagged by role
   (`[BE]`, `[FE]`, `[QA]`), each finishable and testable in one sitting.
4. Show the developer a short summary and wait for approval. Apply their edits to the file.
5. On approval: fill *Plan approved*, set status `In progress`, add the first log entry, and propose committing the
   file alone (commit gate): `docs(plan): add $ARGUMENTS implementation plan` with footer `Refs: $ARGUMENTS`.

Only the progress file may change in this stage.

## 3. Build (you orchestrate; the roles do the work)

You act as tech lead. Delegate with the Agent tool to `backend-developer`, `frontend-developer` and `test-engineer`
(`.claude/agents/`). Give each one the story ID, the progress-file path and the exact tasks, and tell them not to
commit; they read the rest themselves. Rules: `docs/engineering/testing-guide.md`.

1. **Contracts** – `backend-developer`: Zod schemas, types, action/handler signatures as stubs. Commit gate.
2. **Acceptance tests** – `test-engineer`, mode "write": tests for every AC from the spec, without the
   implementation. Check they fail for the right reason. Commit gate, as `test(...)`; the failing tests are expected
   here, so say so in the report and the commit body. Do not show the tester's tests to yourself as something to
   "fix"; they are the target.
3. **Implementation** – `backend-developer` for server tasks, then `frontend-developer` for UI tasks (in parallel
   only when they touch separate files). They must not change tester-owned tests. If one reports a test as wrong,
   send the dispute to `test-engineer` with the spec text; the tester decides; log it under *Plan changes*.
4. **Independent verification** – `test-engineer`, mode "verify": full suite, tamper check on its tests, gap tests,
   break-it checks, bug report, *Test report* in the progress file.
5. **Fix loop** – send bugs to the right developer, then back to the tester to re-verify, until no open
   high/medium bugs remain or the developer accepts a gap explicitly.

Throughout: one commit per task with the progress file ticked, each through the commit gate. Keep migrations, new
dependencies and pure refactors in their own commits. If the plan turns out wrong, stop, propose the change, and
after approval record it under *Plan changes*. Before the session ends, add a progress-log entry (done, next,
blockers); set status `Blocked` with the reason if stuck.

Small stories with no business rules (tooling, config) may skip steps 1–2: the tester then only runs mode "verify",
checking the commands and setup actually work from a clean checkout.

## 4. Verify

Run `pnpm lint`, `pnpm typecheck`, `pnpm test`, and the story's E2E yourself and read the real output; do not rely on
the agents' summaries alone. Then tell the developer exactly how to check the feature by hand (URL, demo user,
steps; vi + en; mobile width for guest screens). Record results in the *Verification* table as they are, including
checks that failed or could not run.

## 5. Hand-off

1. Run the `review-story` skill for $ARGUMENTS and fix what it finds.
2. Draft the PR body from `.github/pull_request_template.md`, linking the progress file.
3. Push and open the PR as a draft only when the developer asks. Then set status `In review`, fill *PR*, log it.
   The owner sets `Done` after merge.
