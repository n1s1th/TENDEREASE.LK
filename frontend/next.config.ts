import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  turbopack: {
    root: __dirname,
  },
  outputFileTracingRoot: __dirname,
  async redirects() {
    return [
      {
        source: '/help',
        destination: '/qa',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
