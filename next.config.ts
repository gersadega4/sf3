import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      // twivatar fallback
      { protocol: "https", hostname: "twivatar.glitch.me" },
      // unavatar fallback
      { protocol: "https", hostname: "unavatar.io" },
      // common Twitter CDN (if you later switch to direct X CDN images)
      { protocol: "https", hostname: "pbs.twimg.com" },
      // optional generic for X
      { protocol: "https", hostname: "abs.twimg.com" },
    ],
  },
};

export default nextConfig;
