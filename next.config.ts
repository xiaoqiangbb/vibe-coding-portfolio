import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vibe-coding-portfolio",
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
