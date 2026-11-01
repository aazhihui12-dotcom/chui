import { readdir } from "node:fs/promises";
import { join, relative, resolve, sep } from "node:path";
const root = resolve(import.meta.dirname, "..");
export default {
  trailingSlash: true,
  // Public files are case-sensitive; their cache-header matching must be too.
  experimental: { globalNotFound: true, caseSensitiveRoutes: true },
  outputFileTracingRoot: root,
  turbopack: { root },
  images: { unoptimized: true },
  async headers() {
    // An exact build-time file list avoids giving missing assets a day-long
    // cache policy. Never match HTML, CMS APIs or persistent uploads here.
    const publicDir = join(root, 'public');
    const files = await Promise.all(['media', 'fonts'].map(async folder => {
      const entries = await readdir(join(publicDir, folder), { recursive: true, withFileTypes: true });
      return entries.filter(entry => entry.isFile()).map(entry => {
        const path = relative(publicDir, join(entry.parentPath, entry.name)).split(sep).join('/');
        return {
          source: '/' + path.replace(/([{}()[\]:*+?])/g, '\\$1'),
          headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }],
        };
      });
    }));
    return files.flat();
  },
  poweredByHeader: false,
};
