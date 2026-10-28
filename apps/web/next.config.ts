import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Lint runs as its own Turbo task (`pnpm lint`) with the root flat config; don't repeat it in `next build`.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
