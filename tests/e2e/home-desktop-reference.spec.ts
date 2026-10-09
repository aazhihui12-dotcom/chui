import {expect,test} from '@playwright/test';

// Static geometry is measured at rest; the separate motion suite samples
// source entrances with normal motion enabled, including their final bounds.
test.beforeEach(async ({page})=>{await page.emulateMedia({reducedMotion:'reduce'});});

// Literal measurements from the retained LBH /cn desktop CSS and screenshots.
// Catch accidental AP theme overrides and mobile rules leaking into desktop.
for(const locale of ['cn','en']) for(const width of [1440,1920]) {
 test(`${locale} desktop ${width}: reference module proportions`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.goto(`/${locale}/`);
  await expect(page.locator('.home-hero h1')).toHaveCSS('font-size','36px');
  await expect(page.locator('.home-hero h1 span')).toHaveCSS('font-size','36px');
  await expect(page.locator('.home-hero h1')).toHaveCSS('line-height','54px');
  expect((await page.locator('.home-hero').boundingBox())!.height).toBeCloseTo(width*5/12,0);
  const controls=await page.locator('.hero-controls').boundingBox();
  expect(controls!.x).toBeGreaterThan(width-100);
  if(width===1440) {
   await expect.poll(()=>page.locator('.hero-slide:not([hidden]) img').first().evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
   await page.screenshot({path:`test-results/home-${locale}-desktop-preview.png`,animations:'disabled'});
  }
  await expect(page.locator('.home-featured-products')).toBeHidden();
  await expect(page.locator('.home-manufacturing > h2')).toHaveCSS('font-weight','400');
  await expect(page.locator('.home-manufacturing__media')).toHaveCSS('height','290px');
  await expect(page.locator('.home-products__grid img').first()).toHaveCSS('width','224px');
  await expect(page.locator('.home-audiences__grid')).toHaveCSS('width','1200px');
  await expect(page.locator('.audience-card').first()).toHaveCSS('padding','40px');
  const photo=await page.locator('.audience-card img').first().boundingBox();
  expect(photo!.width).toBeCloseTo(530,0); expect(photo!.height).toBeCloseTo(308,0);
  await expect(page.locator('.home-welcome .source-video')).toHaveCSS('width','980px');
  const testimonial=await page.locator('.testimonials img').first().boundingBox();
  expect(testimonial!.width/testimonial!.height).toBeCloseTo(16/9,1);
  await expect(page.locator('.home-certifications img').first()).toHaveCSS('width','180px');
  await expect(page.locator('.home-customization')).toBeVisible();
  const outline=page.locator('.home-customization .lbh-button--outline');
  await outline.hover();
  await expect(outline).toHaveCSS('color','rgb(26, 26, 26)');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 });
}
test('desktop rules do not override the mobile reference metrics',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/cn/');
 await expect(page.locator('.home-hero h1')).toHaveCSS('font-size','20px');
 await expect(page.locator('.home-hero')).toHaveCSS('min-height','520px');
 await expect(page.locator('.home-customization')).toBeVisible();
 await expect(page.locator('.home-featured-products')).toBeVisible();
});
for(const locale of ['cn','en']) for(const width of [1024,1280]) {
 test(`${locale} laptop ${width}: all banner content stays inside the banner`,async({page})=>{
  await page.setViewportSize({width,height:900});
  await page.goto(`/${locale}/`);
  for(let slide=0;slide<3;slide++){
   const visible=page.locator('.hero-slide:not([hidden])');
   const banner=await visible.boundingBox();
   const copy=await visible.locator('.home-hero__inner').boundingBox();
   const last=await visible.locator('li, a.lbh-button').last().boundingBox();
   expect(last!.y+last!.height).toBeLessThanOrEqual(banner!.y+banner!.height);
   expect(copy!.width).toBeLessThanOrEqual(width);
   await page.getByRole('button',{name:locale==='cn'?'下一张':'Next slide',exact:true}).click();
  }
 });
}
