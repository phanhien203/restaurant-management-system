# US-01 Monorepo & tooling

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 3 SP |
| Depends on | — |

## Story

**As a** developer, **I want** a pnpm + Turborepo monorepo with shared tooling, **so that** all apps build and are checked the same way.

## Acceptance Criteria

1. Structure per D-02; Node 22 LTS pinned (`.nvmrc`, `packageManager`).
2. TypeScript strict, ESLint, Prettier, Husky + lint-staged, Conventional Commits (commitlint).
3. `pnpm dev | lint | typecheck | test | build` run across all workspaces via Turbo.
4. README documents setup in ≤ 5 steps.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
