import { sitePath, withoutBasePath } from './site-path';

/** Bypass the pre-migration site's five-day cached 404s, without disabling caching. */
export function mediaPath(source: string): string {
  const path = sitePath(source);
  if (!withoutBasePath(path).startsWith('/media/')) return path;
  const url = new URL(path, 'https://assets.invalid');
  // Stable across renders and releases; change only for an explicit asset refresh.
  url.searchParams.set('apower_v', '20261102');
  return url.pathname + url.search + url.hash;
}
