import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/vibe-coding-portfolio",
  reactCompiler: false,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
