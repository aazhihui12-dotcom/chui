/** Plain anchors and public assets need the prefix; Next Link handles its own. */
export function sitePath<T extends string | undefined>(value: T): T {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  if (!value || !base || !value.startsWith('/') || value.startsWith('//') || value === base || value.startsWith(`${base}/`) || value.startsWith(`${base}?`) || value.startsWith(`${base}#`)) return value;
  return `${base}${value}` as T;
}

export function withoutBasePath(value: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
  return base && (value === base || value.startsWith(`${base}/`)) ? value.slice(base.length) || '/' : value;
}
