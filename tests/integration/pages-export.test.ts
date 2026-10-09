// @vitest-environment node
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { JSDOM } from 'jsdom';

it('prepares exported CSS assets and keeps external and already-prefixed URLs intact', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'apower-pages-export-'));
  try {
    mkdirSync(path.join(root, '_next/static'), { recursive: true });
    const file = path.join(root, '_next/static/styles.css');
    writeFileSync(file, `a{background:url('/media/hero.webp')}@font-face{src:url("/fonts/Poppins-Regular.woff2")}b{background:url(https://example.com/test.png)}c{background:url(/chui/media/ready.webp)}`);
    const result = spawnSync(process.execPath, ['scripts/prepare-pages-export.mjs', root], { encoding: 'utf8', env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/chui' } });
    expect(result.status, result.stderr).toBe(0);
    expect(readFileSync(file, 'utf8')).toBe(`a{background:url('/chui/media/hero.webp')}@font-face{src:url("/chui/fonts/Poppins-Regular.woff2")}b{background:url(https://example.com/test.png)}c{background:url(/chui/media/ready.webp)}`);
    expect(readFileSync(path.join(root, '.nojekyll'), 'utf8')).toBe('');
  } finally { rmSync(root, { recursive: true, force: true }); }
});

it('generates legacy redirects inside the project and resolves project-prefixed links', () => {
  const root = mkdtempSync(path.join(tmpdir(), 'apower-pages-routes-'));
  try {
    for (const locale of ['en', 'cn']) {
      mkdirSync(path.join(root, locale));
      writeFileSync(path.join(root, locale, 'index.html'), `<html lang="${locale === 'cn' ? 'zh-CN' : 'en'}"><a href="/chui/${locale}/">Home</a></html>`);
    }
    const manifest = path.join(root, 'manifest.json');
    writeFileSync(manifest, JSON.stringify({ sitemapUrls: ['https://www.lbhappliances.com/'] }));
    const result = spawnSync(process.execPath, ['scripts/check-routes.mjs', '--output', root, '--manifest', manifest, '--generate-legacy'], { encoding: 'utf8', env: { ...process.env, NEXT_PUBLIC_BASE_PATH: '/chui' } });
    expect(result.status, result.stderr).toBe(0);
    const redirect = new JSDOM(readFileSync(path.join(root, 'index.html'), 'utf8'));
    expect(redirect.window.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute('content')).toBe('0;url=/chui/en/');
    redirect.window.close();
  } finally { rmSync(root, { recursive: true, force: true }); }
});
