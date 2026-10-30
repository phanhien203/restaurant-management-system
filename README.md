# restaurant-management-system

A restaurant management system that streamlines menu management, order tracking, kitchen operations, and payments.

## Setup

1. Install **Node.js 24 LTS** (the version in `.nvmrc`; with nvm or nvm-windows: `nvm install 24 && nvm use 24`),
   Git and **Docker** (Docker Desktop on Windows/macOS) with Compose v2.
2. Enable pnpm through Corepack (it picks the version pinned in `package.json`): `corepack enable`
3. Clone the repository and enter it: `git clone <repo-url> && cd restaurant-management-system`
4. Install dependencies (also installs the Git hooks): `pnpm install`
5. Create your local env file from the example (local throwaway values; never commit `.env`): `cp .env.example .env`
6. Start PostgreSQL, Redis and MinIO and wait until they are healthy:
   `docker compose -f compose.dev.yml up -d --wait`
7. Start everything in dev mode: `pnpm dev` — the web app runs on <http://localhost:3000>, the realtime service logs
   its start-up line.

`pnpm db:reset` (migrate and seed demo data) arrives after US-03.

## Local services

`compose.dev.yml` runs the dependencies only (the apps run on the host with `pnpm dev`). Ports are bound to
`127.0.0.1` and can be changed in `.env` (update the matching URL too).

| Service       | Image                               | Port (default)     | Env variables                                                                              |
| ------------- | ----------------------------------- | ------------------ | ------------------------------------------------------------------------------------------ |
| PostgreSQL 17 | `postgres:17.11-alpine3.24`         | 5432               | `POSTGRES_*`, `DATABASE_URL`                                                               |
| Redis 7       | `redis:7.4.12-alpine3.21`           | 6379               | `REDIS_PORT`, `REDIS_URL`                                                                  |
| MinIO (S3)    | `cgr.dev/chainguard/minio` (digest) | 9000, console 9001 | `MINIO_*_PORT`, `S3_*` (`S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` log in to the console) |

| Command                                          | What it does                              |
| ------------------------------------------------ | ----------------------------------------- |
| `docker compose -f compose.dev.yml up -d --wait` | Start the services and wait until healthy |
| `docker compose -f compose.dev.yml ps`           | Show status and health                    |
| `docker compose -f compose.dev.yml down`         | Stop the services, keep the data          |
| `docker compose -f compose.dev.yml down -v`      | Stop and delete all local data (volumes)  |

Compose reads `.env` from the repository root. Without it, compose stops with `copy .env.example to .env`; you can
also pass the example directly: `docker compose -f compose.dev.yml --env-file .env.example …`.

## Environment variables

One root `.env` (copied from `.env.example`) is used by Compose, `apps/web` and `apps/realtime`. Variables already set
in the shell win over the file. Each app validates its variables with Zod at startup (`packages/shared/src/env`) and
exits with code 1 listing every missing or invalid variable by name (values are never printed).

To add a variable: add it to `.env.example` with a comment, to the schema in `packages/shared/src/env/schemas.ts`,
and to `passThroughEnv` of the `dev` task in `turbo.json` (Turbo strips shell variables that are not listed).

## Scripts

Run from the repository root. Turborepo runs each task in every workspace (`apps/web`, `apps/realtime`,
`packages/db`, `packages/shared`, `packages/ui`) and caches the results.

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `pnpm dev`          | Start all workspaces in watch mode (Next.js dev server on port 3000) |
| `pnpm build`        | Production build of every workspace (`.next/`, `dist/`)              |
| `pnpm lint`         | ESLint (root `eslint.config.mjs`) in every workspace + root configs  |
| `pnpm typecheck`    | `tsc --noEmit` in every workspace + root configs (strict mode)       |
| `pnpm test`         | Vitest unit tests in every workspace                                 |
| `pnpm format`       | Format the repository with Prettier                                  |
| `pnpm format:check` | Check formatting without writing files                               |

Scope a script to one workspace with `pnpm --filter <name> <script>`, e.g. `pnpm --filter @rms/web dev`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): subject`), checked by
commitlint; staged files are linted and formatted by a pre-commit hook. Project rules and docs: see `CLAUDE.md`.

## Troubleshooting

- **`Invalid environment variables:` at startup.** `.env` is missing or a variable is empty or malformed; the lines
  below the header name each one. Compare with `.env.example`. After fixing `.env`, restart `pnpm dev` (`.env` is not
  watched).
- **`docker compose … up` fails with `port is already allocated` / `address already in use`.** A local PostgreSQL,
  Redis or another container already uses the port. Stop it, or change `POSTGRES_PORT` / `REDIS_PORT` /
  `MINIO_API_PORT` / `MINIO_CONSOLE_PORT` in `.env` and the matching `DATABASE_URL` / `REDIS_URL` / `S3_ENDPOINT`.
- **PostgreSQL rejects the password after you changed `POSTGRES_*` (or MinIO rejects new `S3_*` keys).** The
  credentials are applied only when the volume is first created. Reset the local data:
  `docker compose -f compose.dev.yml down -v`, then `up -d --wait`.
- **`Cannot connect to the Docker daemon`.** Start Docker Desktop (Windows/macOS) and retry.

- **Windows: `pnpm test` fails with `ERR_PACKAGE_IMPORT_NOT_DEFINED "#module-sync-enabled"`.** Paths inside
  `node_modules/.pnpm` exceed the 260-character limit when the repository root is longer than about 148 characters.
  Clone into a short path (e.g. `C:\dev\rms`) or enable long paths (`LongPathsEnabled=1`, admin, then reboot) and
  run `pnpm install` again.
