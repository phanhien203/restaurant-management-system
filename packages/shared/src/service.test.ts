import { describe, expect, it } from 'vitest';

import { APP_NAME, serviceLabel } from './service.js';

describe('serviceLabel', () => {
  it('prefixes the service name with the app name', () => {
    expect(serviceLabel('web')).toBe('RMS web');
    expect(serviceLabel('realtime')).toBe('RMS realtime');
  });

  it('uses APP_NAME so the label follows a rename', () => {
    expect(serviceLabel('web').startsWith(`${APP_NAME} `)).toBe(true);
  });
});
