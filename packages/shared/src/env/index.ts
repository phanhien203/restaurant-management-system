// Server-only entry point (`@rms/shared/env`): kept out of the main barrel so client bundles never pull it in.
export {
  databaseEnvShape,
  nodeEnvShape,
  realtimeEnvSchema,
  redisEnvShape,
  s3EnvShape,
  webEnvSchema,
  type RealtimeEnv,
  type WebEnv,
} from './schemas.js';
export { EnvValidationError, parseEnv, type EnvIssue, type EnvSource } from './parse-env.js';
