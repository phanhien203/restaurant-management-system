import { existsSync } from 'node:fs';
import path from 'node:path';

import { EnvValidationError, parseEnv, webEnvSchema } from '@rms/shared/env';
import { PHASE_DEVELOPMENT_SERVER } from 'next/constants';
import type { NextConfig } from 'next';

// One root `.env` for Compose, web and realtime (US-02 Q3). Loaded here because Next only reads `.env*` from
// apps/web. `process.loadEnvFile` never overwrites a variable already set in the shell, so real env wins.
// Optional: in containers and CI the variables come from the environment, not from a file.
const rootEnvFile = path.resolve(__dirname, '../../.env');
if (existsSync(rootEnvFile)) process.loadEnvFile(rootEnvFile);

const nextConfig: NextConfig = {
  // Lint runs as its own Turbo task (`pnpm lint`) with the root flat config; don't repeat it in `next build`.
  eslint: { ignoreDuringBuilds: true },
};

export default function config(phase: string): NextConfig {
  // `instrumentation.ts` is the fail-fast check for every server. `next dev` additionally checks here, in the CLI
  // process, because it runs the server in a child and exits 0 whenever that child exits on its own, which would
  // hide the failure from scripts. Not checked for `next build`: the build does not need runtime secrets.
  if (phase === PHASE_DEVELOPMENT_SERVER) {
    try {
      parseEnv(webEnvSchema, process.env);
    } catch (error) {
      if (error instanceof EnvValidationError) {
        console.error(error.message);
        process.exit(1);
      }
      throw error;
    }
  }
  return nextConfig;
}
