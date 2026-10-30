import { z } from 'zod';

// Env values always arrive as strings (or are absent). Messages describe the expected shape only and never echo
// the received input, because inputs here can be passwords and connection strings with credentials.

const requiredString = () =>
  z
    .string({ error: (issue) => (issue.input === undefined ? 'is required' : 'must be a string') })
    .trim()
    // abort: an empty value reports only "is required", not also every format check that follows.
    .min(1, { error: 'is required', abort: true });

/** A URL whose scheme is one of `protocols` (without the trailing colon) and which names a host. */
const urlWithProtocol = (protocols: readonly string[]) => {
  const expected = protocols.map((p) => `${p}://`).join(' or ');
  return requiredString().refine(
    (value) => {
      if (!URL.canParse(value)) return false;
      const url = new URL(value);
      return protocols.includes(url.protocol.slice(0, -1)) && url.hostname !== '';
    },
    { error: `must be a ${expected} URL` },
  );
};

/** TCP port as a decimal string, coerced to an integer in 1..65535. */
const port = () =>
  requiredString()
    .regex(/^\d+$/, 'must be an integer port number')
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(1, 'must be between 1 and 65535')
        .max(65535, 'must be between 1 and 65535'),
    );

// S3 bucket naming rules (3-63 chars, lowercase letters, digits, dots, hyphens; starts/ends alphanumeric).
const s3BucketName = () =>
  requiredString().regex(
    /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
    'must be a valid S3 bucket name (3-63 chars: a-z, 0-9, ".", "-")',
  );

// Shared parts. Kept as plain shapes so each service schema is a flat object and every key is one env variable.

export const nodeEnvShape = {
  /** Runtime mode. Optional: Next.js and most tooling set it; defaults to `development`. */
  NODE_ENV: z
    .enum(['development', 'test', 'production'], {
      error: 'must be one of development, test, production',
    })
    .default('development'),
};

export const databaseEnvShape = {
  /** PostgreSQL connection string used by Prisma (`postgres://` or `postgresql://`). */
  DATABASE_URL: urlWithProtocol(['postgres', 'postgresql']),
};

export const redisEnvShape = {
  /** Redis connection string (`redis://`, or `rediss://` for TLS). */
  REDIS_URL: urlWithProtocol(['redis', 'rediss']),
};

export const s3EnvShape = {
  /** S3-compatible API endpoint (MinIO locally). */
  S3_ENDPOINT: urlWithProtocol(['http', 'https']),
  S3_REGION: requiredString(),
  S3_ACCESS_KEY_ID: requiredString(),
  S3_SECRET_ACCESS_KEY: requiredString(),
  S3_BUCKET: s3BucketName(),
};

/**
 * Env read by `apps/web`: it owns all DB writes, publishes to Redis (CLAUDE.md rule 6) and handles uploads to
 * object storage (US-11).
 */
export const webEnvSchema = z.object({
  ...nodeEnvShape,
  ...databaseEnvShape,
  ...redisEnvShape,
  ...s3EnvShape,
});

/**
 * Env read by `apps/realtime`: it only subscribes to Redis and fans out to Socket.IO rooms, so it gets no database
 * or object-storage credentials (least privilege; CLAUDE.md rule 6).
 */
export const realtimeEnvSchema = z.object({
  ...nodeEnvShape,
  ...redisEnvShape,
  /** Port the Socket.IO server listens on. */
  REALTIME_PORT: port(),
});

export type WebEnv = z.output<typeof webEnvSchema>;
export type RealtimeEnv = z.output<typeof realtimeEnvSchema>;
