import { serviceLabel } from '@rms/shared';

// Skeleton entry point: Socket.IO server and Redis fan-out arrive with US-06.
console.log(`${serviceLabel('realtime')} started (pid ${String(process.pid)})`);
