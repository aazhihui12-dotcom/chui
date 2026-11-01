import { expect, test } from '@playwright/test';

test('English downloads only the small Han UI shard, without changing glyph metrics', async ({ page }) => {
  await page.goto('/en/', {waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const sizes = await page.evaluate(()=>performance.getEntriesByType('resource')
    .filter(e=>e.name.includes('/fonts/APOWER-Han'))
    .map(e=>({url:e.name, bytes:(e as PerformanceResourceTiming).encodedBodySize})));
  expect(sizes.reduce((n,e)=>n+e.bytes,0)).toBeLessThan(20000);
  expect(sizes.some(e=>e.url.includes('-ui.woff2'))).toBe(true);
  const metrics=await page.evaluate(async()=>{
    const original=await new FontFace('Original Han','url(/fonts/APOWER-Han-Medium.woff)',{weight:'500'}).load();
    document.fonts.add(original);
    const c=document.createElement('canvas').getContext('2d')!;
    const measure=(family:string)=>{c.font=`500 32px "${family}"`;return c.measureText('中文↗✓').width;};
    return {before:measure('Original Han'),after:measure('APOWER Han')};
  });
  expect(metrics.after).toBeCloseTo(metrics.before,3);
});

test('Chinese body fonts decode and preserve original text widths',async({page})=>{
  await page.goto('/cn/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  const result=await page.evaluate(async()=>{
    const loaded=performance.getEntriesByType('resource').filter(e=>e.name.includes('/fonts/APOWER-Han')).map(e=>e.name);
    const text='中文制造技术与合作伙伴，质量管理。';
    await document.fonts.load('500 32px "APOWER Han"',text);
    const original=await new FontFace('Original Han','url(/fonts/APOWER-Han-Medium.woff)',{weight:'500'}).load();document.fonts.add(original);
    const c=document.createElement('canvas').getContext('2d')!;
    const measure=(family:string)=>{c.font=`500 32px "${family}"`;return c.measureText(text).width;};
    return {loaded,before:measure('Original Han'),after:measure('APOWER Han')};
  });
  expect(result.loaded.some(url=>url.endsWith('-body.woff2'))).toBe(true);
  expect(result.after).toBeCloseTo(result.before,3);
});

