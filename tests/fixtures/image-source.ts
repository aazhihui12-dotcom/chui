/** Artwork assertions compare the original file, independent of cache-key revisions. */
export function imageSourcePath(element: Element | null, attribute = 'src'): string {
  const source = element?.getAttribute(attribute);
  if (!source) throw new Error(`Expected an image ${attribute}`);
  return new URL(source, 'https://test.invalid').pathname;
}
