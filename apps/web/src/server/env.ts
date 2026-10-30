import { parseEnv, webEnvSchema, type WebEnv } from '@rms/shared/env';

/**
 * Validated, typed environment for server code (Route Handlers, Server Actions, `src/server/**`).
 * Server-only: never import it from a Client Component. `instrumentation.ts` has already validated the same
 * `process.env` at boot and stopped the process if it was invalid, so this parse does not fail in a running server.
 */
export const env: WebEnv = parseEnv(webEnvSchema, process.env);
