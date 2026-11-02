import { cleanup, render } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { Media } from '@/components/site/Media';

afterEach(()=>{cleanup();vi.unstubAllEnvs();});
function image(src:string,priority=false){
  return render(<Media image={{src,alt:'Product',width:1000,height:1000}} priority={priority}/>).container.querySelector('img')!;
}

it('gives built-in images a stable new cache key instead of a migration-era unversioned URL',()=>{
  const first=image('/media/apower/v2/product-g1.webp').getAttribute('src')!;
  const url=new URL(first,'https://apowertech.net');
  expect(url.pathname).toBe('/media/apower/v2/product-g1.webp');
  expect(url.searchParams.get('apower_v')??'').toMatch(/^\d{8}$/);
  expect(image('/media/apower/v2/product-g1.webp').getAttribute('src')).toBe(first);
  expect(image(first).getAttribute('src')).toBe(first);
});

it('preserves query values and the fragment while replacing a stale image version',()=>{
  const url=new URL(image('/media/picture.webp?crop=cover&apower_v=old#preview').getAttribute('src')!,'https://apowertech.net');
  expect(url.pathname).toBe('/media/picture.webp');
  expect(url.searchParams.get('crop')).toBe('cover');
  expect(url.searchParams.getAll('apower_v')).toHaveLength(1);
  expect(url.searchParams.get('apower_v')??'').toMatch(/^\d{8}$/);
  expect(url.hash).toBe('#preview');
});

it.each(['/media/a.webp','/chui/media/a.webp'])('retains one GitHub project prefix for %s',src=>{
  vi.stubEnv('NEXT_PUBLIC_BASE_PATH','/chui');
  const url=new URL(image(src).getAttribute('src')!,'https://example.test');
  expect(url.pathname).toBe('/chui/media/a.webp');
  expect(url.searchParams.get('apower_v')??'').toMatch(/^\d{8}$/);
});

it.each(['/uploads/00000000-0000-4000-8000-000000000000.webp','https://example.test/media/picture.webp','//example.test/media/picture.webp','data:image/png;base64,AA=='])('does not rewrite the source contract of %s',src=>{
  expect(image(src).getAttribute('src')).toBe(src);
});

it('keeps dimensions, decoding, lazy loading and the eager hero priority',()=>{
  const lazy=image('/media/picture.webp');
  expect(lazy).toHaveAttribute('width','1000');
  expect(lazy).toHaveAttribute('height','1000');
  expect(lazy).toHaveAttribute('loading','lazy');
  expect(lazy).toHaveAttribute('decoding','async');
  const eager=image('/media/hero.webp',true);
  expect(eager).toHaveAttribute('loading','eager');
  expect(eager).toHaveAttribute('fetchpriority','high');
});
