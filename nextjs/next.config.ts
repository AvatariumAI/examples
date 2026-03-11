import type { NextConfig } from 'next';
import path from 'path';

const nextConfig: NextConfig = {
  // Pin the workspace root to silence lockfile detection warnings
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
