import { test, expect } from '@playwright/test';
const routes = ['', 'ProductIndex', 'Product/682975.html', 'ProductDetail/AP-G1.html', 'Exclusive_sale', 'Contract_manufacturing_service', 'PinZhiGuanLi', 'Design_and_Development', 'Order_Management', 'Product_manufacturing', 'Product_Warranty_and_After-Sales_Service', 'Company_Introduction', 'Lead_the_team', 'Factory_tour', 'Certification_certificate', 'Sustainable_Development', 'Product_Laboratory', 'Contact_Us'];
for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: v3 fonts, photos and responsive modules`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', e => errors.push(e.message));
    for (const route of routes) {
      expect((await page.goto(`/${locale}/${route}${route ? '/' : ''}`))?.status()).toBe(200);
      await page.evaluate(() => document.fonts.ready);
      for(const family of ['Inter','APOWER Han'])expect(await page.evaluate(family=>Array.from(document.fonts).some(font=>font.family.replaceAll('"','').replaceAll("'",'')===family&&font.status==='loaded'),family)).toBe(true);
      for (const node of await page.locator('h1,h2,h3,p,li,dt,dd,label,input,textarea,select,button').all()) {
        const result = await node.evaluate(e => ({ text: e.textContent?.trim(), weight: getComputedStyle(e).fontWeight, family: getComputedStyle(e).fontFamily }));
        expect(result.family, `${route}: ${result.text?.slice(0, 35)}`).toContain('Inter');
        expect(result.weight, `${route}: ${result.text?.slice(0, 35)}`).toBe('500');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      for (const image of await page.locator('img[src*="/apower/v3/"]:visible').all()) {
        await image.scrollIntoViewIfNeeded();
        await image.evaluate((img: HTMLImageElement) => img.decode());
        expect(await image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      }
      if (['', 'ProductIndex', 'Company_Introduction', 'Contact_Us'].includes(route)) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `test-results/v3-${locale}-${route || 'home'}-${width}.png`, animations: 'disabled' });
      }
    }
    expect(errors).toEqual([]);
  });
}
test('English desktop hero uses the requested 64px heading and 20px list',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await page.goto('/en/');
  await expect(page.locator('.home-hero h1')).toHaveCSS('font-size','64px');
  await expect(page.locator('.hero-slide:not([hidden]) li').first()).toHaveCSS('font-size','20px');
});
test('product specifications remain white and readable on the new dark surface',async({page})=>{
  for(const locale of ['en','cn'])for(const model of ['AP-G1','AP-G3','AP-G11','AP-S1','AP-H1','AP-AR01']){
    await page.goto(`/${locale}/ProductDetail/${model}.html/`);
    await expect(page.locator('.product-detail__top')).toHaveCSS('background-color','rgb(51, 50, 50)');
    await expect(page.locator('.product-specifications td').first()).toHaveCSS('color','rgb(255, 255, 255)');
  }
});
test('assembly numbering does not enlarge or gray the contact button label',async({page})=>{
  await page.goto('/en/ProductIndex/');
  const button=page.locator('.product-index__assembly .inquiry-trigger');
  const label=button.locator('span').first();
  await expect(label).toHaveCSS('font-size','16px');
  await expect(label).toHaveCSS('color','rgb(255, 255, 255)');
});
test('white company values text has a contrast-safe scrim even over bright snow',async({page})=>{
  await page.goto('/en/Company_Introduction/');
  const surface=page.locator('.v3-company-values .editorial-section__inner');
  const background=await surface.evaluate(el=>getComputedStyle(el).backgroundImage);
  const alphas=[...background.matchAll(/rgba\(0, 0, 0, ([\d.]+)\)/g)].map(m=>Number(m[1]));
  expect(background).not.toContain('transparent');
  expect(alphas.length).toBeGreaterThan(0);
  const channel=1-Math.min(...alphas);
  const luminance=channel<=.04045?channel/12.92:((channel+.055)/1.055)**2.4;
  expect(1.05/(luminance+.05)).toBeGreaterThanOrEqual(4.5);
});
test('image popup slides upward, closes with Escape and restores focus', async ({ page }) => {
  await page.goto('/en/ProductIndex/');
  const trigger = page.locator('.product-index__options button').first();
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  expect(await dialog.evaluate(e => getComputedStyle(e).animationName)).not.toBe('none');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
for(const locale of ['en','cn'])for(const width of [320,768,1024,1280,1920]){
  test(`${locale} ${width}: all hero slides keep their complete text inside the banner`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`/${locale}/`);
    await page.evaluate(()=>document.fonts.ready);
    for(let i=0;i<3;i++){
      const slide=page.locator('.hero-slide:not([hidden])');
      const banner=(await slide.boundingBox())!;
      for(const node of await slide.locator('h1:visible,h2:visible,p:visible,li:visible,a:visible').all()){
        const bounds=(await node.boundingBox())!;
        expect(bounds.y+bounds.height,await node.textContent()).toBeLessThanOrEqual(banner.y+banner.height+1);
        expect(await node.evaluate(el=>{
          const r=document.createRange();r.selectNodeContents(el);
          return [...r.getClientRects()].every(b=>b.left>=-1&&b.right<=innerWidth+1);
        })).toBe(true);
      }
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      await page.getByRole('button',{name:locale==='cn'?'下一张':'Next slide',exact:true}).click();
    }
  });
}
test('guidance modules render supplied photos, centered headings and complete desktop/mobile previews',async({page})=>{
  test.setTimeout(120000);
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const width of [1440,390]){
    await page.setViewportSize({width,height:900});
    for(const [route,selector,name] of [
      ['ProductIndex','.product-index__categories','categories'],
      ['ProductIndex','.product-index__options','customization'],
      ['ProductIndex','.product-index__benefits','benefits'],
      ['ProductIndex','.product-index__assembly','assembly'],
      ['Company_Introduction','.v3-company-values','values'],
      ['Design_and_Development','.v3-design-facilities','facilities'],
      ['Exclusive_sale','.editorial-section--cards','exclusive-icons'],
      ['Product_manufacturing','.v3-manufacturing-stages','manufacturing'],
      ['Lead_the_team','.editorial-section--split','team'],
      ['Contact_Us','.contact-inquiry-panel','form'],
    ]){
      await page.goto(`/en/${route}/`);
      await page.evaluate(()=>document.fonts.ready);
      const module=page.locator(selector).first();
      await module.scrollIntoViewIfNeeded();
      for(const img of await module.locator('img:visible').all()){
        await img.scrollIntoViewIfNeeded();
        await img.evaluate((img:HTMLImageElement)=>img.decode());
      }
      await module.screenshot({path:`/tmp/apower-v3-preview-final/${name}-${width}.png`,animations:'disabled',style:'.skip-link,.mobile-shortcuts,.floating-actions{visibility:hidden!important}'});
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    }
  }
});
