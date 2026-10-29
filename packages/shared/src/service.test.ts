import { describe, expect, it } from 'vitest';

import { serviceLabel } from './service.js';

describe('serviceLabel', () => {
  it('prefixes the service name with the app name', () => {
    expect(serviceLabel('web')).toBe('RMS web');
    expect(serviceLabel('realtime')).toBe('RMS realtime');
  });
});
