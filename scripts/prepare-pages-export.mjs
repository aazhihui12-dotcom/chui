import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Only exported CSS is changed. Source CSS and local root builds stay untouched.
const output = path.resolve(process.argv[2] || 'out');
const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
async function visit(directory) {
  for (const item of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, item.name);
    if (item.isDirectory()) await visit(file);
    else if (item.name.endsWith('.css') && base) {
      const css = await readFile(file, 'utf8');
      const updated = css.replace(/url\(\s*(["']?)(\/[^\s)'";]+)\1\s*\)/g, (match, quote, url) => {
        if (url.startsWith('//') || url === base || url.startsWith(`${base}/`)) return match;
        return `url(${quote}${base}${url}${quote})`;
      });
      if (updated !== css) await writeFile(file, updated);
    }
  }
}
await visit(output);
await writeFile(path.join(output, '.nojekyll'), '');
console.log(`Static export prepared for ${base || '/'} (CSS assets and .nojekyll).`);
