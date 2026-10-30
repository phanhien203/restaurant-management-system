import { EnvValidationError, parseEnv, realtimeEnvSchema, type RealtimeEnv } from '@rms/shared/env';

// Parsed once at import, before anything listens, so a bad configuration stops the process at boot (US-02 AC2).
function loadEnv(): RealtimeEnv {
  try {
    return parseEnv(realtimeEnvSchema, process.env);
  } catch (error) {
    if (error instanceof EnvValidationError) {
      // The message names variables and reasons only, never values (parseEnv contract).
      console.error(error.message);
      process.exit(1);
    }
    throw error;
  }
}

export const env: RealtimeEnv = loadEnv();
