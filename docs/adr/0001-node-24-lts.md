# 0001 Node 24 LTS as the runtime

| Status | Date | Story |
|---|---|---|
| Accepted | 2026-10-28 | US-01 |

## Context
US-01 AC1 originally pinned Node 22 LTS. In October 2026 Node 22 is in maintenance and reaches end of life around
April 2027, during the pilot. Node 24 is LTS with support until about April 2028, and the developers already run it.
Node 25+ no longer bundles Corepack, which we use to provide pnpm.

## Decision
The runtime is **Node 24 LTS** everywhere: `.nvmrc` = `24`, root `engines.node` = `>=24 <25` with `engine-strict=true`,
and Node 24 images for CI and Docker (US-08, US-09). pnpm comes from Corepack via the root `packageManager` field.
Confirmed by the owner (acting as PO) on 2026-10-28; US-01 AC1 updated accordingly.

## Consequences
No runtime upgrade is needed before the pilot ends. Installing on Node 22 or 25+ fails fast with an engine error. We
must check that native dependencies (e.g. argon2, US-13) ship Node 24 builds when they are added. The next runtime
upgrade (Node 26 LTS) is a separate ADR.
