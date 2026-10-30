import { resolve } from "node:path";
const root = resolve(import.meta.dirname, "..");
export default {
  trailingSlash: true,
  experimental: { globalNotFound: true },
  outputFileTracingRoot: root,
  turbopack: { root },
  images: { unoptimized: true },
  poweredByHeader: false,
};
