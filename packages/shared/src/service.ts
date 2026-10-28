// Skeleton placeholder: proves both apps resolve and build against @rms/shared (US-01).
// Replaced by real Zod contracts and domain logic in later stories.
export const APP_NAME = 'RMS';

export type ServiceName = 'web' | 'realtime';

export function serviceLabel(service: ServiceName): string {
  return `${APP_NAME} ${service}`;
}
