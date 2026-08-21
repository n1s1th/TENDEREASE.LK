import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
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
