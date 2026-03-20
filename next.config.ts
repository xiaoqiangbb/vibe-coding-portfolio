import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.volces.com",
      },
    ],
  },
};

export default nextConfig;
