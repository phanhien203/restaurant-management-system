# Architecture Decision Records

Decisions D-01 … D-14 live in the [backlog README §2](../user-stories/README.md#2-decisions-overridable).
Record a new ADR here when, during the build, a decision:

- changes or overrides a D-xx, or
- introduces a cross-cutting pattern (error handling, event names, caching, folder layout), or
- would make a new developer ask "why is it done like this?".

File name: `NNNN-short-title.md` (next number: `0001`). Commit the ADR in the same PR as the code it explains.

## Template

```markdown
# NNNN Title

| Status | Date | Story |
|---|---|---|
| Accepted | YYYY-MM-DD | US-xx |

## Context
What forces us to decide; constraints.

## Decision
What we do, in one paragraph.

## Consequences
What gets easier, what gets harder, what we must watch.
```
