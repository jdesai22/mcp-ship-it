import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverComponentsExternalPackages: [],
  },
  // Set server to listen on port 3001
  server: {
    port: 3001,
  },
};

export default nextConfig;
