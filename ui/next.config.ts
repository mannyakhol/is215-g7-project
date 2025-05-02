import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
    swcMinify: true,
    eslint: {
      ignoreDuringBuilds: true,
  },
     typescript: {
      ignoreBuildErrors: true,
  },
};

export default nextConfig;
