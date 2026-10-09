import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  // Keep an isolated deployment export so the existing local out/ preview stays live.
  distDir: process.env.NEXT_EXPORT_DIR || ".next",
  output: "export",
  experimental: { globalNotFound: true },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
