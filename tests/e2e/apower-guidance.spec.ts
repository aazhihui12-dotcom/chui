import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const locale of ['en','cn']) for(const width of [1440,390]) {
 test(`${locale} workbook homepage and product flows at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const errors:string[]=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`/${locale}/`);
  const hero=page.locator('.home-hero');
  await expect(hero.locator('h1')).toContainText('APOWER');
  const next=hero.getByRole('button',{name:locale==='cn'?'下一张':'Next slide',exact:true});
  for(let i=0;i<3;i++){
   const slide=hero.locator('.hero-slide:not([hidden])');
   await expect(slide.locator('img')).toBeVisible();
   await expect.poll(()=>slide.locator('img').evaluate((e:HTMLImageElement)=>e.naturalWidth)).toBeGreaterThan(0);
   for(const node of await slide.locator('h1,h2,li').all()) expect(await node.evaluate(e=>getComputedStyle(e).color)).toBe('rgb(37, 35, 33)');
   await next.click();
  }
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const homeContrast=await new AxeBuilder({page}).withRules(['color-contrast']).analyze();
  expect(homeContrast.violations).toEqual([]);
  await page.goto(`/${locale}/ProductIndex/`);
  await expect(page.locator('.product-index__categories a')).toHaveCount(4);
  await page.locator('.product-filter-disclosure summary').click();
  await page.getByRole('button',{name:locale==='cn'?'吸附挂烫机系列':'Suction Garment Steamers',exact:true}).click();
  await page.locator('.product-filter-disclosure summary').click();
  await page.getByRole('link',{name:'AP-AR01',exact:true}).click();
  await expect(page.getByRole('heading',{level:1})).toHaveText('AP-AR01');
  await expect(page.locator('.product-summary')).toContainText('930W');
  await page.locator('.product-summary').getByRole('link',{name:locale==='cn'?'立即询盘':'Inquiry',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  expect(errors).toEqual([]);
});
}
test('company desktop background uses the supplied APOWER billboard',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 for(const locale of ['en','cn']){
  await page.goto(`/${locale}/Company_Introduction/`);
  await expect(page.locator('.editorial-section--feature')).toHaveCSS('background-image',/apower\/v2\/company-billboard\.webp/);
 }
});
test('the supplied video IDs and all bilingual new detail routes are available',async({page})=>{
 for(const locale of ['en','cn']){
  for(const model of ['AP-G1','AP-G3','AP-G11','AP-S1','AP-H1','AP-AR01']){
   const r=await page.goto(`/${locale}/ProductDetail/${model}.html/`);
   expect(r?.status()).toBe(200);
   await expect(page.getByRole('heading',{level:1})).toHaveText(model);
  }
  await page.goto(`/${locale}/ProductIndex/`);
  await page.getByRole('button',{name:locale==='cn'?'播放工厂概览视频':'Play factory overview video'}).click();
  await expect(page.locator('iframe')).toHaveAttribute('src',/uGqOG4NfbZQ/);
  await page.goto(`/${locale}/Factory_tour/`);
  await page.getByRole('button',{name:locale==='cn'?'播放工厂概览视频':'Play factory overview video'}).click();
  await expect(page.locator('iframe')).toHaveAttribute('src',/bx1R2NQPTxw/);
 }
});
