# US-11 File storage for images

| Field | Value |
|---|---|
| Epic | EP-00 Project Setup & Platform |
| Priority | Must |
| Estimate | 2 SP |
| Depends on | [US-02](US-02-local-development-environment.md) |

## Story

**As a** manager, **I want** uploaded photos stored and served efficiently, **so that** the menu loads fast on 4G.

## Acceptance Criteria

1. Presigned upload to S3-compatible storage (R2; MinIO locally); JPEG/PNG/WebP ≤ 5 MB.
2. Images are served resized (WebP) via `next/image` with long cache headers.
3. Object keys are prefixed by tenant ID.

---
Backlog: [MVP user stories](README.md) · Definition of Done: [README §3](README.md#3-story-conventions)
