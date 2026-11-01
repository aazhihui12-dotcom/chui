import { expect, test } from '@playwright/test';

test('homepage client JavaScript does not ship the full content catalog', async ({page})=>{
  await page.goto('/en/',{waitUntil:'networkidle'});
  const bytes=await page.evaluate(()=>performance.getEntriesByType('resource')
    .filter(e=>e.name.includes('/_next/')&&e.name.endsWith('.js'))
    .reduce((n,e)=>n+(e as PerformanceResourceTiming).encodedBodySize,0));
  expect(bytes).toBeLessThan(210000);
  await expect(page.getByRole('link',{name:'中文',exact:true})).toHaveAttribute('href','/cn');
});

test('legacy translations, current models and editorial pages retain their alternate links',async({page})=>{
  for(const [path,target] of [
    ['/en/ProductDetail/AP-G1.html','/cn/ProductDetail/AP-G1.html'],
    ['/en/ProductDetail/11906944.html','/cn/ProductDetail/11898269.html'],
    ['/cn/NewsDetail/6809208.html','/en/NewsDetail/6860206.html'],
    ['/en/Design_and_Development/','/cn/Design_and_Development'],
  ]){
    await page.goto(path);
    await expect(page.locator('.language-switch')).toHaveAttribute('href',target);
  }
});
