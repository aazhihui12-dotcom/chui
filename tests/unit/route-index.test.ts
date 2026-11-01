import { expect, it } from 'vitest';
import { allPages, getPage } from '@/lib/content';
import { getAlternatePath } from '@/lib/routes';
import { localizedLegacyPath } from '@/lib/locale-path';
import index from '@/content/route-index.json';

it('keeps the lightweight route inventory synchronized with all server pages',()=>{
  for(const locale of ['en','cn'] as const){
    expect(index[locale]).toEqual([...new Set(allPages.filter(p=>p.locale===locale).map(p=>p.legacyPath))].sort());
  }
});

it('retains all alternate targets and home fallback from the existing server lookup',()=>{
  for(const page of allPages){
    const alternate=page.locale==='en'?'cn':'en';
    const slug=page.legacyPath.split('/').filter(Boolean);
    const target=getPage(alternate,slug);
    const expected=target?`/${alternate}${slug.length?localizedLegacyPath(page.legacyPath,alternate):''}`:`/${alternate}`;
    expect(getAlternatePath(page.locale,slug),page.legacyPath).toBe(expected);
  }
  expect(getAlternatePath('en',['ProductDetail','AP-unknown.html'])).toBe('/cn');
  expect(getAlternatePath('cn',['NewsDetail','not-a-real-article.html'])).toBe('/en');
});
