import assert from 'node:assert/strict';
import { chromium } from 'playwright';

// Run against a mounted /chui export or the public release without changing it.
const base = new URL(process.argv[2] || 'http://127.0.0.1:3002/chui/').href.replace(/\/?$/, '/');
const label = process.argv[3] || 'release';
assert.match(label, /^[a-z0-9-]+$/);
const routes = ['', 'ProductIndex', 'Product/682975.html', 'ProductDetail/AP-G1.html',
  'Exclusive_sale', 'Contract_manufacturing_service', 'PinZhiGuanLi', 'Design_and_Development',
  'Order_Management', 'Product_manufacturing', 'Product_Warranty_and_After-Sales_Service',
  'Company_Introduction', 'Lead_the_team', 'Factory_tour', 'Certification_certificate',
  'Sustainable_Development', 'Product_Laboratory', 'Contact_Us'];
const browser = await chromium.launch({ channel: 'chrome' });
try {
  for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    for (const route of routes) {
      const response = await page.goto(`${base}${locale}/${route}${route ? '/' : ''}`);
      assert.equal(response?.status(), 200, `${locale}/${route}`);
      await page.evaluate(() => document.fonts.ready);
      const fonts = await page.evaluate(() => Array.from(document.fonts).filter(font => font.status === 'loaded').map(font => font.family.replaceAll('"', '').replaceAll("'", '')));
      for (const font of ['Inter', 'APOWER Han']) assert(fonts.includes(font), `Missing loaded font: ${font}`);
      const wrong = await page.locator('h1,h2,h3,p,li,dt,dd,label,input,textarea,select,button').evaluateAll(nodes => nodes.filter(node => {
        const style = getComputedStyle(node);
        return style.fontWeight !== '500' || !style.fontFamily.includes('Inter');
      }).map(node => node.textContent?.trim().slice(0, 60)));
      assert.deepEqual(wrong, [], `${locale}/${route}: typography`);
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${locale}/${route}: overflow`);
      if (route === 'ProductDetail/AP-G1.html') assert.equal(await page.locator('.product-specifications td').first().evaluate(node => getComputedStyle(node).color), 'rgb(255, 255, 255)');
      for (const image of await page.locator('img[src*="/apower/v3/"]:visible').all()) {
        await image.scrollIntoViewIfNeeded();
        assert(await image.evaluate(async node => { await node.decode(); return node.naturalWidth > 0; }), `${route}: image`);
      }
      if (!route) {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `/tmp/apower-v3-preview-final/${label}-${locale}-${width}.png`, animations: 'disabled' });
      }
    }
    await page.goto(`${base}${locale}/ProductIndex/`);
    const trigger = page.locator('.product-index__options button').first();
    await trigger.click();
    assert(await page.getByRole('dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.equal(await page.getByRole('dialog').count(), 0);
    assert(await trigger.evaluate(node => document.activeElement === node));
    await page.goto(`${base}${locale}/Contact_Us/`);
    const product = page.getByRole('combobox');
    const value = locale === 'cn' ? '高速吹风机系列' : 'Hair Dryers';
    await product.selectOption(value);
    assert.equal(await product.inputValue(), value);
    assert.equal(await page.getByRole('checkbox').count(), 5);
    for (const name of ['company', 'phone']) assert(await page.locator(`[name="${name}"]`).evaluate(node => node.required));
    assert.deepEqual(errors, []);
    console.log(`${locale} ${width}: 18 pages, loaded Medium fonts, supplied photos, popup and form passed.`);
    await page.close();
  }
} finally {
  await browser.close();
}
console.log(`Release smoke checks passed: ${base}`);
