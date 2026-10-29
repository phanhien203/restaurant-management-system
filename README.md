# restaurant-management-system

A restaurant management system that streamlines menu management, order tracking, kitchen operations, and payments.

## Setup

1. Install **Node.js 24 LTS** (the version in `.nvmrc`; with nvm or nvm-windows: `nvm install 24 && nvm use 24`) and Git.
2. Enable pnpm through Corepack (it picks the version pinned in `package.json`): `corepack enable`
3. Clone the repository and enter it: `git clone <repo-url> && cd restaurant-management-system`
4. Install dependencies (also installs the Git hooks): `pnpm install`
5. Start everything in dev mode: `pnpm dev` — the web app runs on <http://localhost:3000>, the realtime service logs its start-up line.

## Scripts

Run from the repository root. Turborepo runs each task in every workspace (`apps/web`, `apps/realtime`,
`packages/db`, `packages/shared`, `packages/ui`) and caches the results.

| Script              | What it does                                                         |
| ------------------- | -------------------------------------------------------------------- |
| `pnpm dev`          | Start all workspaces in watch mode (Next.js dev server on port 3000) |
| `pnpm build`        | Production build of every workspace (`.next/`, `dist/`)              |
| `pnpm lint`         | ESLint (root `eslint.config.mjs`) in every workspace + root configs  |
| `pnpm typecheck`    | `tsc --noEmit` in every workspace (strict mode)                      |
| `pnpm test`         | Vitest unit tests in every workspace                                 |
| `pnpm format`       | Format the repository with Prettier                                  |
| `pnpm format:check` | Check formatting without writing files                               |

Scope a script to one workspace with `pnpm --filter <name> <script>`, e.g. `pnpm --filter @rms/web dev`.

Commits follow [Conventional Commits](https://www.conventionalcommits.org/) (`type(scope): subject`), checked by
commitlint; staged files are linted and formatted by a pre-commit hook. Project rules and docs: see `CLAUDE.md`.

## Troubleshooting

- **Windows: `pnpm test` fails with `ERR_PACKAGE_IMPORT_NOT_DEFINED "#module-sync-enabled"`.** Paths inside
  `node_modules/.pnpm` exceed the 260-character limit when the repository root is longer than about 148 characters.
  Clone into a short path (e.g. `C:\dev\rms`) or enable long paths (`LongPathsEnabled=1`, admin, then reboot) and
  run `pnpm install` again.
