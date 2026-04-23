import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tell Next.js/Turbopack to not bundle these packages (they're only for Trigger.dev)
  serverExternalPackages: ['@ffmpeg-installer/ffmpeg', 'fluent-ffmpeg'],
  
  // Empty turbopack config to silence Next.js 16 warning
  turbopack: {},
  
  webpack: (config, { isServer }) => {
    // Webpack fallback for compatibility
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@ffmpeg-installer/ffmpeg': 'commonjs @ffmpeg-installer/ffmpeg',
        'fluent-ffmpeg': 'commonjs fluent-ffmpeg',
      });
    }
    return config;
  },
};

export default nextConfig;
