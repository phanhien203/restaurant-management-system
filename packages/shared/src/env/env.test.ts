// Tester-owned acceptance tests for US-02 AC2: "`.env.example` lists every variable; env is validated with Zod at
// startup (fail fast)". Sources: docs/user-stories/US-02-local-development-environment.md (AC2),
// docs/plans/US-02-local-development-environment.md (Variables, AC → Test Map 2a/2b), CLAUDE.md rules 5 and 10,
// and the JSDoc contract of `parseEnv` / `EnvValidationError`.
// Expected values are written by hand from those sources; they are never derived from the code under test.
import { readFileSync } from 'node:fs';
import { inspect } from 'node:util';

import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest';

import { EnvValidationError, parseEnv, realtimeEnvSchema, webEnvSchema } from './index.js';

// --- Hand-written expectations (from the plan, not from the code) -------------------------------------------

/** Variables `apps/web` needs: DB (Prisma), Redis (publish), S3 (uploads), runtime mode. Plan § Variables. */
const WEB_VARIABLES = [
  'NODE_ENV',
  'DATABASE_URL',
  'REDIS_URL',
  'S3_ENDPOINT',
  'S3_REGION',
  'S3_ACCESS_KEY_ID',
  'S3_SECRET_ACCESS_KEY',
  'S3_BUCKET',
] as const;

/** Variables `apps/realtime` needs: Redis (subscribe), its own port, runtime mode. No DB/S3 (least privilege). */
const REALTIME_VARIABLES = ['NODE_ENV', 'REDIS_URL', 'REALTIME_PORT'] as const;

/** Read only by Docker Compose (compose.dev.yml), not by any app. Plan § Changes / Variables. */
const COMPOSE_ONLY_VARIABLES = [
  'POSTGRES_USER',
  'POSTGRES_PASSWORD',
  'POSTGRES_DB',
  'POSTGRES_PORT',
  'REDIS_PORT',
  'MINIO_API_PORT',
  'MINIO_CONSOLE_PORT',
] as const;

// Distinctive fake secrets: if any of these strings shows up in an error, a secret leaked into the logs.
const DB_PASSWORD = 'PhoBoTai-Secret-7731';
const S3_SECRET = 'minio-SECRET-banh-mi-4242';

/** A complete, valid web environment with realistic local values (Postgres 17, Redis 7, MinIO). Fresh each call. */
function validWebSource(): Record<string, string | undefined> {
  return {
    NODE_ENV: 'development',
    DATABASE_URL: `postgresql://rms:${DB_PASSWORD}@127.0.0.1:5432/rms?schema=public`,
    REDIS_URL: 'redis://127.0.0.1:6379',
    S3_ENDPOINT: 'http://127.0.0.1:9000',
    S3_REGION: 'us-east-1',
    S3_ACCESS_KEY_ID: 'rms-minio',
    S3_SECRET_ACCESS_KEY: S3_SECRET,
    S3_BUCKET: 'rms-local',
  };
}

/** A complete, valid realtime environment. Fresh each call. */
function validRealtimeSource(): Record<string, string | undefined> {
  return {
    NODE_ENV: 'development',
    REDIS_URL: 'redis://127.0.0.1:6379',
    REALTIME_PORT: '3001',
  };
}

/** Copy of `source` without the key `variable` (absent, not set to undefined). */
function without(
  source: Record<string, string | undefined>,
  variable: string,
): Record<string, string | undefined> {
  return Object.fromEntries(Object.entries(source).filter(([key]) => key !== variable));
}

/** Runs `fn`, expects an EnvValidationError and returns it. Any other error (e.g. "not implemented") is rethrown. */
function captureEnvError(fn: () => unknown): EnvValidationError {
  try {
    fn();
  } catch (error) {
    if (error instanceof EnvValidationError) return error;
    throw error;
  }
  throw new Error('expected parseEnv to throw EnvValidationError, but it returned');
}

function issueVariables(error: EnvValidationError): string[] {
  return error.issues.map((i) => i.variable);
}

/** Asserts exactly one issue for `variable` and returns its message. */
function onlyIssueFor(error: EnvValidationError, variable: string): string {
  const matching = error.issues.filter((i) => i.variable === variable);
  expect(matching, `issues for ${variable}`).toHaveLength(1);
  return matching[0]?.message ?? '';
}

// --- `.env.example` reader (written here, independent of any app code) --------------------------------------

const ENV_EXAMPLE_PATH = new URL('../../../../.env.example', import.meta.url);

interface EnvExampleEntry {
  readonly key: string;
  readonly value: string;
}

/** Parses `KEY=VALUE` lines; ignores blank lines and `#` comments; strips one pair of surrounding quotes. */
function readEnvExample(): EnvExampleEntry[] {
  const text = readFileSync(ENV_EXAMPLE_PATH, 'utf8');
  const entries: EnvExampleEntry[] = [];
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (line === '' || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq <= 0) throw new Error(`.env.example: line is not KEY=VALUE: ${line}`);
    const key = line
      .slice(0, eq)
      .replace(/^export\s+/, '')
      .trim();
    let value = line.slice(eq + 1).trim();
    const quoted = /^(['"])(.*)\1$/.exec(value);
    if (quoted) value = quoted[2] ?? '';
    entries.push({ key, value });
  }
  return entries;
}

function envExampleAsSource(): Record<string, string> {
  return Object.fromEntries(readEnvExample().map((e) => [e.key, e.value]));
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

// =============================================================================================================
// AC2 (2a) · `.env.example` lists every variable
// =============================================================================================================

describe('AC2 · .env.example lists every variable', () => {
  it('AC2 · web reads exactly the variables it needs (DB, Redis, S3, NODE_ENV), nothing else', () => {
    expect(Object.keys(webEnvSchema.shape).sort()).toEqual([...WEB_VARIABLES].sort());
  });

  it('AC2 · realtime reads only Redis, its port and NODE_ENV: no DB or S3 credentials (least privilege)', () => {
    expect(Object.keys(realtimeEnvSchema.shape).sort()).toEqual([...REALTIME_VARIABLES].sort());
  });

  it('AC2 · every variable web or realtime reads appears in .env.example', () => {
    const exampleKeys = new Set(readEnvExample().map((e) => e.key));
    const read = new Set([
      ...Object.keys(webEnvSchema.shape),
      ...Object.keys(realtimeEnvSchema.shape),
    ]);
    const missing = [...read].filter((k) => !exampleKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('AC2 · every Compose-only variable (POSTGRES_*, REDIS_PORT, MINIO_*) appears in .env.example', () => {
    const exampleKeys = new Set(readEnvExample().map((e) => e.key));
    const missing = COMPOSE_ONLY_VARIABLES.filter((k) => !exampleKeys.has(k));
    expect(missing).toEqual([]);
  });

  it('AC2 · .env.example has no stale entries: each key is read by a schema or by Compose', () => {
    const known = new Set<string>([
      ...Object.keys(webEnvSchema.shape),
      ...Object.keys(realtimeEnvSchema.shape),
      ...COMPOSE_ONLY_VARIABLES,
    ]);
    const stale = readEnvExample()
      .map((e) => e.key)
      .filter((k) => !known.has(k));
    expect(stale).toEqual([]);
  });

  it('AC2 · .env.example declares each variable once (a duplicate silently overrides the first)', () => {
    const keys = readEnvExample().map((e) => e.key);
    const duplicates = keys.filter((k, i) => keys.indexOf(k) !== i);
    expect(duplicates).toEqual([]);
  });

  it('AC2 · .env.example gives every variable a non-empty value (a fresh copy needs no editing)', () => {
    const empty = readEnvExample()
      .filter((e) => e.value === '')
      .map((e) => e.key);
    expect(empty).toEqual([]);
  });

  // Not parseEnv's job, but a fresh `cp .env.example .env` must also *connect*: the URLs the apps use have to
  // point at what Compose creates from the Compose-only variables.
  it('AC2 · DATABASE_URL in .env.example matches POSTGRES_USER/PASSWORD/DB/PORT', () => {
    const env = envExampleAsSource();
    const url = new URL(env.DATABASE_URL ?? '');
    expect(decodeURIComponent(url.username)).toBe(env.POSTGRES_USER);
    expect(decodeURIComponent(url.password)).toBe(env.POSTGRES_PASSWORD);
    expect(url.pathname).toBe(`/${env.POSTGRES_DB ?? ''}`);
    expect(url.port || '5432').toBe(env.POSTGRES_PORT);
  });

  it('AC2 · REDIS_URL port matches REDIS_PORT and S3_ENDPOINT port matches MINIO_API_PORT', () => {
    const env = envExampleAsSource();
    expect(new URL(env.REDIS_URL ?? '').port || '6379').toBe(env.REDIS_PORT);
    expect(new URL(env.S3_ENDPOINT ?? '').port).toBe(env.MINIO_API_PORT);
  });

  it('AC2 · MinIO root credentials in .env.example satisfy MinIO minimums (user >= 3, password >= 8 chars)', () => {
    const env = envExampleAsSource();
    expect((env.S3_ACCESS_KEY_ID ?? '').length).toBeGreaterThanOrEqual(3);
    expect((env.S3_SECRET_ACCESS_KEY ?? '').length).toBeGreaterThanOrEqual(8);
  });
});

// =============================================================================================================
// AC2 (2b) · env validated with Zod at startup, fail fast
// =============================================================================================================

describe('AC2 · a fresh `cp .env.example .env` boots both services', () => {
  it('AC2 · .env.example values parse for web, typed, with only web variables returned', () => {
    const env = parseEnv(webEnvSchema, envExampleAsSource());
    expect(env).toEqual({
      NODE_ENV: 'development',
      DATABASE_URL: 'postgresql://rms:rms_local_password@127.0.0.1:5432/rms?schema=public',
      REDIS_URL: 'redis://127.0.0.1:6379',
      S3_ENDPOINT: 'http://127.0.0.1:9000',
      S3_REGION: 'us-east-1',
      S3_ACCESS_KEY_ID: 'rms-minio',
      S3_SECRET_ACCESS_KEY: 'rms-minio-local-secret',
      S3_BUCKET: 'rms-local',
    });
  });

  it('AC2 · .env.example values parse for realtime, REALTIME_PORT as the number 3001', () => {
    const env = parseEnv(realtimeEnvSchema, envExampleAsSource());
    expect(env).toEqual({
      NODE_ENV: 'development',
      REDIS_URL: 'redis://127.0.0.1:6379',
      REALTIME_PORT: 3001,
    });
  });
});

describe('AC2 · valid configurations parse to typed values', () => {
  it('AC2 · realtime port is a number and NODE_ENV defaults to development when unset', () => {
    const source = validRealtimeSource();
    delete source.NODE_ENV;
    const env = parseEnv(realtimeEnvSchema, source);
    expectTypeOf(env.REALTIME_PORT).toEqualTypeOf<number>();
    expectTypeOf(env.NODE_ENV).toEqualTypeOf<'development' | 'test' | 'production'>();
    expect(env.REALTIME_PORT).toBe(3001);
    expect(env.NODE_ENV).toBe('development');
  });

  it.each(['development', 'test', 'production'] as const)(
    'AC2 · NODE_ENV=%s is accepted as is',
    (mode) => {
      const env = parseEnv(webEnvSchema, { ...validWebSource(), NODE_ENV: mode });
      expect(env.NODE_ENV).toBe(mode);
    },
  );

  it.each([
    ['1', 1],
    ['65535', 65535],
    ['8080', 8080],
  ])('AC2 · REALTIME_PORT=%s is accepted (boundary) as %d', (raw, expected) => {
    const env = parseEnv(realtimeEnvSchema, { ...validRealtimeSource(), REALTIME_PORT: raw });
    expect(env.REALTIME_PORT).toBe(expected);
  });

  it('AC2 · surrounding whitespace (common copy-paste slip) is trimmed', () => {
    const env = parseEnv(realtimeEnvSchema, {
      ...validRealtimeSource(),
      REDIS_URL: '  redis://127.0.0.1:6379 ',
      REALTIME_PORT: ' 3001 ',
    });
    expect(env.REDIS_URL).toBe('redis://127.0.0.1:6379');
    expect(env.REALTIME_PORT).toBe(3001);
  });

  it.each([
    ['postgres://rms:pw@127.0.0.1:5432/rms'],
    ['postgresql://rms:pw@db.internal:5432/rms?schema=public&connection_limit=5'],
  ])('AC2 · DATABASE_URL %s (postgres:// or postgresql://) is accepted', (url) => {
    const env = parseEnv(webEnvSchema, { ...validWebSource(), DATABASE_URL: url });
    expect(env.DATABASE_URL).toBe(url);
  });

  it.each([['redis://127.0.0.1:6379'], ['rediss://:pw@cache.example.vn:6380/0']])(
    'AC2 · REDIS_URL %s (redis:// or TLS rediss://) is accepted',
    (url) => {
      const env = parseEnv(realtimeEnvSchema, { ...validRealtimeSource(), REDIS_URL: url });
      expect(env.REDIS_URL).toBe(url);
    },
  );

  it.each([['http://127.0.0.1:9000'], ['https://s3.ap-southeast-1.amazonaws.com']])(
    'AC2 · S3_ENDPOINT %s is accepted',
    (url) => {
      const env = parseEnv(webEnvSchema, { ...validWebSource(), S3_ENDPOINT: url });
      expect(env.S3_ENDPOINT).toBe(url);
    },
  );

  it.each([['abc'], ['rms-local'], ['rms.menu-images.2026'], ['a'.repeat(63)]])(
    'AC2 · S3_BUCKET %s is a valid bucket name',
    (bucket) => {
      const env = parseEnv(webEnvSchema, { ...validWebSource(), S3_BUCKET: bucket });
      expect(env.S3_BUCKET).toBe(bucket);
    },
  );
});

describe('AC2 · least privilege: each service requires only its own variables', () => {
  it('AC2 · realtime boots without DATABASE_URL or any S3_* variable', () => {
    const env = parseEnv(realtimeEnvSchema, {
      REDIS_URL: 'redis://127.0.0.1:6379',
      REALTIME_PORT: '3001',
    });
    expect(env).toEqual({
      NODE_ENV: 'development',
      REDIS_URL: 'redis://127.0.0.1:6379',
      REALTIME_PORT: 3001,
    });
  });

  it('AC2 · web boots without REALTIME_PORT', () => {
    const source = validWebSource();
    expect(source).not.toHaveProperty('REALTIME_PORT');
    const env = parseEnv(webEnvSchema, source);
    expect(env).not.toHaveProperty('REALTIME_PORT');
    expect(env.DATABASE_URL).toBe(source.DATABASE_URL);
  });

  it('AC2 · realtime given the full root .env does not get DB or S3 credentials back', () => {
    const env = parseEnv(realtimeEnvSchema, {
      ...validWebSource(),
      REALTIME_PORT: '3001',
      POSTGRES_PASSWORD: DB_PASSWORD,
    });
    expect(Object.keys(env).sort()).toEqual(['NODE_ENV', 'REALTIME_PORT', 'REDIS_URL']);
    expect(JSON.stringify(env)).not.toContain(DB_PASSWORD);
    expect(JSON.stringify(env)).not.toContain(S3_SECRET);
  });

  it('AC2 · unknown variables (PATH, HOME, Compose-only ones) are ignored and not returned', () => {
    const env = parseEnv(webEnvSchema, {
      ...validWebSource(),
      PATH: '/usr/local/bin:/usr/bin',
      HOME: '/home/hien',
      POSTGRES_PASSWORD: DB_PASSWORD,
      MINIO_CONSOLE_PORT: '9001',
      REALTIME_PORT: '3001',
      npm_config_user_agent: 'pnpm/10',
    });
    expect(Object.keys(env).sort()).toEqual([...WEB_VARIABLES].sort());
  });
});

describe('AC2 · missing or empty variables fail fast', () => {
  it.each(WEB_VARIABLES.filter((v) => v !== 'NODE_ENV'))(
    'AC2 · web without %s fails, naming it as required',
    (variable) => {
      const source = without(validWebSource(), variable);
      const error = captureEnvError(() => parseEnv(webEnvSchema, source));
      expect(issueVariables(error)).toEqual([variable]);
      expect(onlyIssueFor(error, variable)).toBe('is required');
      expect(error.message).toContain(variable);
    },
  );

  it.each(['REDIS_URL', 'REALTIME_PORT'])(
    'AC2 · realtime without %s fails, naming it as required',
    (variable) => {
      const source = without(validRealtimeSource(), variable);
      const error = captureEnvError(() => parseEnv(realtimeEnvSchema, source));
      expect(issueVariables(error)).toEqual([variable]);
      expect(onlyIssueFor(error, variable)).toBe('is required');
    },
  );

  it('AC2 · a variable explicitly set to undefined counts as missing', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), DATABASE_URL: undefined }),
    );
    expect(issueVariables(error)).toEqual(['DATABASE_URL']);
    expect(onlyIssueFor(error, 'DATABASE_URL')).toBe('is required');
  });

  it.each([
    ['empty', ''],
    ['spaces only', '   '],
    ['tab and spaces', ' \t '],
  ])(
    'AC2 · DATABASE_URL %s counts as missing and is reported once as required',
    (_label, value) => {
      const error = captureEnvError(() =>
        parseEnv(webEnvSchema, { ...validWebSource(), DATABASE_URL: value }),
      );
      expect(issueVariables(error)).toEqual(['DATABASE_URL']);
      expect(onlyIssueFor(error, 'DATABASE_URL')).toBe('is required');
    },
  );

  it.each([
    ['empty', ''],
    ['spaces only', '   '],
  ])(
    'AC2 · REALTIME_PORT %s counts as missing (one "is required", no port-format noise)',
    (_l, v) => {
      const error = captureEnvError(() =>
        parseEnv(realtimeEnvSchema, { ...validRealtimeSource(), REALTIME_PORT: v }),
      );
      expect(issueVariables(error)).toEqual(['REALTIME_PORT']);
      expect(onlyIssueFor(error, 'REALTIME_PORT')).toBe('is required');
    },
  );

  it('AC2 · S3_SECRET_ACCESS_KEY empty counts as missing', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), S3_SECRET_ACCESS_KEY: '  ' }),
    );
    expect(issueVariables(error)).toEqual(['S3_SECRET_ACCESS_KEY']);
    expect(onlyIssueFor(error, 'S3_SECRET_ACCESS_KEY')).toBe('is required');
  });

  // JSDoc: "An empty or whitespace-only value counts as missing", and a missing NODE_ENV defaults to development.
  // `NODE_ENV=` is what a developer gets by blanking the line in `.env`.
  it('AC2 · NODE_ENV empty counts as missing, so the development default applies', () => {
    const env = parseEnv(webEnvSchema, { ...validWebSource(), NODE_ENV: '' });
    expect(env.NODE_ENV).toBe('development');
  });

  it('AC2 · an empty source fails for web listing every required variable, in schema order', () => {
    const error = captureEnvError(() => parseEnv(webEnvSchema, {}));
    expect(issueVariables(error)).toEqual([
      'DATABASE_URL',
      'REDIS_URL',
      'S3_ENDPOINT',
      'S3_REGION',
      'S3_ACCESS_KEY_ID',
      'S3_SECRET_ACCESS_KEY',
      'S3_BUCKET',
    ]);
    for (const issue of error.issues) expect(issue.message).toBe('is required');
  });

  it('AC2 · an empty source fails for realtime listing REDIS_URL and REALTIME_PORT only', () => {
    const error = captureEnvError(() => parseEnv(realtimeEnvSchema, {}));
    expect(issueVariables(error)).toEqual(['REDIS_URL', 'REALTIME_PORT']);
  });
});

describe('AC2 · malformed values fail fast with the variable named', () => {
  /** Expects exactly one issue, for `variable`, with a format reason (a value was given, so not "is required"). */
  function expectFormatIssue(error: EnvValidationError, variable: string): void {
    expect(issueVariables(error)).toEqual([variable]);
    const message = onlyIssueFor(error, variable);
    expect(message.trim()).not.toBe('');
    expect(message).not.toBe('is required');
    expect(error.message).toContain(`${variable}: ${message}`);
  }

  it.each([
    ['MySQL scheme', 'mysql://rms:pw@127.0.0.1:3306/rms'],
    ['http scheme', 'http://127.0.0.1:5432/rms'],
    ['no scheme', '127.0.0.1:5432/rms'],
    ['no host', 'postgresql:///rms'],
    ['not a URL', 'rms_local_password'],
  ])('AC2 · DATABASE_URL with %s is rejected', (_label, value) => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), DATABASE_URL: value }),
    );
    expectFormatIssue(error, 'DATABASE_URL');
  });

  it.each([
    ['host:port only', '127.0.0.1:6379'],
    ['bare hostname:port', 'localhost:6379'],
    ['http scheme', 'http://127.0.0.1:6379'],
    ['plain word', 'redis'],
  ])('AC2 · REDIS_URL %s is rejected', (_label, value) => {
    const error = captureEnvError(() =>
      parseEnv(realtimeEnvSchema, { ...validRealtimeSource(), REDIS_URL: value }),
    );
    expectFormatIssue(error, 'REDIS_URL');
  });

  it.each([
    ['no scheme', '127.0.0.1:9000'],
    ['ftp scheme', 'ftp://127.0.0.1:9000'],
  ])('AC2 · S3_ENDPOINT with %s is rejected', (_label, value) => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), S3_ENDPOINT: value }),
    );
    expectFormatIssue(error, 'S3_ENDPOINT');
  });

  it.each([
    ['0 (below range)', '0'],
    ['65536 (above range)', '65536'],
    ['non-numeric', 'abc'],
    ['decimal', '3001.5'],
    ['negative', '-1'],
    ['exponent notation', '3e3'],
    ['with a host', '127.0.0.1:3001'],
  ])('AC2 · REALTIME_PORT %s is rejected, reported exactly once', (_label, value) => {
    const error = captureEnvError(() =>
      parseEnv(realtimeEnvSchema, { ...validRealtimeSource(), REALTIME_PORT: value }),
    );
    expectFormatIssue(error, 'REALTIME_PORT');
  });

  it.each([
    ['uppercase', 'RMS-Local'],
    ['underscore', 'rms_local'],
    ['too short', 'ab'],
    ['too long (64 chars)', 'a'.repeat(64)],
    ['starts with a hyphen', '-rms-local'],
    ['ends with a dot', 'rms-local.'],
    ['contains a space', 'rms local'],
  ])('AC2 · S3_BUCKET %s is rejected', (_label, value) => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), S3_BUCKET: value }),
    );
    expectFormatIssue(error, 'S3_BUCKET');
  });

  it.each([['staging'], ['Production'], ['prod'], ['dev']])(
    'AC2 · NODE_ENV=%s (unknown mode) is rejected',
    (value) => {
      const error = captureEnvError(() =>
        parseEnv(webEnvSchema, { ...validWebSource(), NODE_ENV: value }),
      );
      expectFormatIssue(error, 'NODE_ENV');
    },
  );
});

describe('AC2 · all problems are reported in one error', () => {
  it('AC2 · missing DATABASE_URL, non-URL REDIS_URL and bad S3_BUCKET are all reported at once, in schema order', () => {
    const source = validWebSource();
    delete source.DATABASE_URL;
    source.REDIS_URL = '127.0.0.1:6379';
    source.S3_BUCKET = 'RMS_Images';
    const error = captureEnvError(() => parseEnv(webEnvSchema, source));
    expect(issueVariables(error)).toEqual(['DATABASE_URL', 'REDIS_URL', 'S3_BUCKET']);
    expect(onlyIssueFor(error, 'DATABASE_URL')).toBe('is required');
    expect(onlyIssueFor(error, 'REDIS_URL')).not.toBe('is required');
    expect(onlyIssueFor(error, 'S3_BUCKET')).not.toBe('is required');
  });

  it('AC2 · realtime with unknown NODE_ENV, http REDIS_URL and non-numeric port reports all three, once each', () => {
    const error = captureEnvError(() =>
      parseEnv(realtimeEnvSchema, {
        NODE_ENV: 'staging',
        REDIS_URL: 'http://127.0.0.1:6379',
        REALTIME_PORT: 'three-thousand',
      }),
    );
    expect(issueVariables(error)).toEqual(['NODE_ENV', 'REDIS_URL', 'REALTIME_PORT']);
  });

  it('AC2 · the error message lists each bad variable on its own line under the header', () => {
    const error = captureEnvError(() =>
      parseEnv(realtimeEnvSchema, { REDIS_URL: '', REALTIME_PORT: '99999' }),
    );
    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('EnvValidationError');
    const lines = error.message.split('\n');
    expect(lines[0]).toBe('Invalid environment variables:');
    expect(lines).toHaveLength(3);
    expect(lines[1]).toMatch(/^ {2}- REDIS_URL: is required$/);
    expect(lines[2]).toMatch(/^ {2}- REALTIME_PORT: .+$/);
  });

  it('AC2 · issues only name variables the schema declares (unknown ones never cause errors)', () => {
    const error = captureEnvError(() =>
      parseEnv(realtimeEnvSchema, {
        REDIS_URL: 'not a url',
        REALTIME_PORT: '3001',
        DATABASE_URL: 'mysql://bad',
        S3_BUCKET: 'BAD BUCKET',
      }),
    );
    expect(issueVariables(error)).toEqual(['REDIS_URL']);
  });
});

describe('AC2 · errors never leak secret values (CLAUDE.md rule 10)', () => {
  /** Everything a logger might print: message, stack, issues, and a deep inspect (includes `cause`). */
  function everythingPrintable(error: EnvValidationError): string {
    return [
      error.message,
      error.stack ?? '',
      JSON.stringify(error.issues),
      inspect(error, { depth: 10 }),
    ].join('\n');
  }

  it('AC2 · a malformed DATABASE_URL carrying the DB password is reported without the password', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, {
        ...validWebSource(),
        DATABASE_URL: `mysql://rms:${DB_PASSWORD}@127.0.0.1:3306/rms`,
      }),
    );
    expect(issueVariables(error)).toEqual(['DATABASE_URL']);
    expect(error.message).not.toContain(DB_PASSWORD);
    expect(JSON.stringify(error.issues)).not.toContain(DB_PASSWORD);
    expect(everythingPrintable(error)).not.toContain(DB_PASSWORD);
  });

  it('AC2 · when other variables are bad, the valid S3 secret and DB password never appear in the error', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, {
        ...validWebSource(),
        REDIS_URL: 'localhost:6379',
        S3_BUCKET: 'Bad_Bucket',
      }),
    );
    expect(issueVariables(error)).toEqual(['REDIS_URL', 'S3_BUCKET']);
    for (const secret of [S3_SECRET, DB_PASSWORD]) {
      expect(error.message).not.toContain(secret);
      expect(JSON.stringify(error.issues)).not.toContain(secret);
      expect(everythingPrintable(error)).not.toContain(secret);
    }
  });

  it('AC2 · a secret pasted into the wrong variable (S3 secret as S3_ENDPOINT) is not echoed back', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, { ...validWebSource(), S3_ENDPOINT: S3_SECRET }),
    );
    expect(issueVariables(error)).toEqual(['S3_ENDPOINT']);
    expect(everythingPrintable(error)).not.toContain(S3_SECRET);
  });

  it('AC2 · each issue has exactly the fields variable and message (no value field)', () => {
    const error = captureEnvError(() =>
      parseEnv(webEnvSchema, {
        ...validWebSource(),
        DATABASE_URL: `mysql://u:${DB_PASSWORD}@h/db`,
      }),
    );
    for (const issue of error.issues) {
      expect(Object.keys(issue).sort()).toEqual(['message', 'variable']);
    }
  });
});

describe('AC2 · parseEnv is pure: reads only the given source, no side effects', () => {
  it('AC2 · does not mutate the source (frozen source, and a copy compares equal afterwards)', () => {
    const source = { ...validRealtimeSource(), REALTIME_PORT: ' 3001 ', EXTRA: 'x' };
    const before = { ...source };
    Object.freeze(source);
    const env = parseEnv(realtimeEnvSchema, source);
    expect(env.REALTIME_PORT).toBe(3001);
    expect(source).toEqual(before);
  });

  it('AC2 · does not mutate the source when validation fails', () => {
    const source: Record<string, string | undefined> = { REDIS_URL: ' ', REALTIME_PORT: 'abc' };
    const before = { ...source };
    Object.freeze(source);
    captureEnvError(() => parseEnv(realtimeEnvSchema, source));
    expect(source).toEqual(before);
  });

  it('AC2 · validates the given source, not process.env', () => {
    vi.stubEnv('REDIS_URL', 'redis://127.0.0.1:6379');
    vi.stubEnv('REALTIME_PORT', '3001');
    const error = captureEnvError(() => parseEnv(realtimeEnvSchema, {}));
    expect(issueVariables(error)).toEqual(['REDIS_URL', 'REALTIME_PORT']);
  });

  it('AC2 · on failure it throws without logging or exiting; the caller decides', () => {
    const exit = vi.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('parseEnv must not call process.exit');
    });
    const logs = [
      vi.spyOn(console, 'error').mockImplementation(() => undefined),
      vi.spyOn(console, 'warn').mockImplementation(() => undefined),
      vi.spyOn(console, 'log').mockImplementation(() => undefined),
    ];
    captureEnvError(() => parseEnv(realtimeEnvSchema, {}));
    expect(exit).not.toHaveBeenCalled();
    for (const log of logs) expect(log).not.toHaveBeenCalled();
  });
});
