// Next.js calls `register()` once per server instance before it serves requests.
export async function register(): Promise<void> {
  // The Edge runtime has no process.exit and no server env to check; the NEXT_RUNTIME guard also lets Next drop
  // the Node-only import below from the edge bundle.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { EnvValidationError } = await import('@rms/shared/env');
    try {
      await import('./src/server/env');
    } catch (error) {
      if (error instanceof EnvValidationError) {
        // Exit explicitly: a throw here does not stop Next 15. `next start` keeps listening and answers every
        // request with 500, and `next dev` exits with code 0. The message names variables, never values.
        console.error(error.message);
        process.exit(1);
      }
      throw error;
    }
  }
}
