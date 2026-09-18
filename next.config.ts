import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  experimental: { globalNotFound: true },
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
