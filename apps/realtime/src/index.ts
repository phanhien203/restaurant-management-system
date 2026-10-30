import { serviceLabel } from '@rms/shared';

import { env } from './env.js';

// Skeleton entry point: Socket.IO server and Redis fan-out arrive with US-06.
console.log(
  `${serviceLabel('realtime')} started (pid ${String(process.pid)}, port ${String(env.REALTIME_PORT)})`,
);
