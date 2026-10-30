import { type z } from 'zod';

/** One invalid or missing environment variable. Never carries the variable's value. */
export interface EnvIssue {
  /** Variable name, e.g. `DATABASE_URL`. */
  readonly variable: string;
  /** Why it is invalid, e.g. `is required`, `must be a redis:// or rediss:// URL`. */
  readonly message: string;
}

/**
 * Thrown by {@link parseEnv} when the environment does not satisfy the schema.
 *
 * `message` is a human-readable list with one line per issue, in the form
 * `Invalid environment variables:\n  - DATABASE_URL: is required\n  - REDIS_URL: must be a ...`.
 * Neither `message` nor `issues` ever contain a variable's value.
 */
export class EnvValidationError extends Error {
  override readonly name = 'EnvValidationError';
  readonly issues: readonly EnvIssue[];

  constructor(issues: readonly EnvIssue[]) {
    super(
      [
        'Invalid environment variables:',
        ...issues.map((i) => `  - ${i.variable}: ${i.message}`),
      ].join('\n'),
    );
    this.issues = issues;
  }
}

/** Raw environment, e.g. `process.env`. */
export type EnvSource = Readonly<Record<string, string | undefined>>;

/**
 * Validates `source` (usually `process.env`) against an env schema such as `webEnvSchema` or
 * `realtimeEnvSchema`. Called once at process start so a bad configuration fails fast, before serving.
 *
 * - **Success:** returns the parsed env, typed as the schema output (ports as numbers, defaults applied, strings
 *   trimmed). Variables in `source` that the schema does not declare are ignored and not returned.
 * - **Failure:** throws a single {@link EnvValidationError} whose `issues` list **every** missing or invalid
 *   variable declared by the schema (not only the first), one entry per variable, in schema declaration order,
 *   each with the variable name and the reason. An empty or whitespace-only value counts as missing.
 *   The error never includes any variable's value, so secrets do not leak into logs.
 * - Does not read `process.env` itself and has no side effects (no logging, no `process.exit`); the caller
 *   decides how to report and exit.
 */
export function parseEnv<Schema extends z.ZodObject>(
  _schema: Schema,
  _source: EnvSource,
): z.output<Schema> {
  throw new Error('not implemented');
}
