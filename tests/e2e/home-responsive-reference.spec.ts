import { expect, test } from '@playwright/test';

// Hand-checked LBH homepage captures: mobile heading/line-height records,
// grid-col-1 categories, 40px partner padding, and gallery xsItemCount=2.
// These assertions catch theme overrides, desktop rules leaking into mobile,
// missing mobile modules, and clipped replacement copy (not source text matches).
for (const locale of ['cn', 'en']) for (const width of [320, 390, 430, 768]) {
  test(`${locale} ${width}: complete responsive reference layout`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/`);
    const mobile = width < 768;
    await expect(page.locator('.home-customization')).toBeVisible();
    await expect(page.locator('.home-audiences__heading')).toHaveCSS('clip-path', 'inset(50%)');
    if (mobile) {
      await expect(page.locator('.site-header')).toHaveCSS('height', '50px');
      await expect(page.locator('.home-hero h1')).toHaveCSS('font-size', locale === 'cn' ? '20px' : '14px');
      await expect(page.locator('.home-hero h1 span')).toHaveCSS('font-size', locale === 'cn' ? '20px' : '14px');
      await expect(page.locator('.home-manufacturing > h2')).toHaveCSS('font-size', locale === 'cn' ? '26px' : '22px');
      await expect(page.locator('.home-manufacturing > h2')).toHaveCSS('line-height', locale === 'cn' ? '39px' : '33px');
      await expect(page.locator('.home-manufacturing__media .stats-grid dd').first()).toHaveCSS('font-size', '50px');
      await expect(page.locator('.home-manufacturing__media .stats-grid dt').first()).toHaveCSS('font-size', '14px');
      await expect(page.locator('.home-manufacturing__media .stats-grid dt').first()).toHaveCSS('color', 'rgb(0, 0, 0)');
      const video = await page.locator('.home-manufacturing__media .video-preview').boundingBox();
      const stats = await page.locator('.home-manufacturing__media .stats-grid').boundingBox();
      expect(stats!.y).toBeGreaterThanOrEqual(video!.y + video!.height);
      const category = await page.locator('.product-category').all();
      const first = await category[0].boundingBox();
      const second = await category[1].boundingBox();
      expect(first!.x).toBeCloseTo(second!.x, 0);
      expect(second!.y).toBeGreaterThan(first!.y + first!.height - 1);
      await expect(page.locator('.audience-card').first()).toHaveCSS('padding', '40px');
      const join = page.locator('.audience-card .lbh-button').first();
      await expect(join).toHaveCSS('height', '50px');
      const welcomeVideo = await page.locator('.home-welcome .source-video').boundingBox();
      const contact = await page.locator('.home-welcome .lbh-button').boundingBox();
      expect(contact!.y).toBeGreaterThan(welcomeVideo!.y + welcomeVideo!.height);
      const featured = await page.locator('.home-featured-products').boundingBox();
      const audience = await page.locator('.home-audiences').boundingBox();
      expect(featured!.y).toBeGreaterThanOrEqual(audience!.y + audience!.height);
      const certificates = await page.locator('.home-certifications img').all();
      const boxes = await Promise.all(certificates.slice(0, 3).map(e => e.boundingBox()));
      expect(boxes[1]!.y).toBeCloseTo(boxes[0]!.y, 0);
      expect(boxes[2]!.y).toBeGreaterThan(boxes[0]!.y + boxes[0]!.height);
      await expect(page.locator('.home-final-cta')).toBeHidden();
    }
    for (const photo of await page.locator('.audience-card img').all()) {
      const r = await photo.boundingBox();
      expect(r!.width / r!.height).toBeCloseTo(530 / 308, 1);
    }
    const testimonial = await page.locator('.testimonials img').first().boundingBox();
    expect(testimonial!.width / testimonial!.height).toBeCloseTo(16 / 9, 1);
    if(width===390) {
      await expect.poll(()=>page.locator('.hero-slide:not([hidden]) img').first().evaluate((e:HTMLImageElement)=>e.complete&&e.naturalWidth>0)).toBe(true);
      await page.screenshot({path:`test-results/home-${locale}-mobile-preview.png`,animations:'disabled'});
    }
    for (let slide = 0; slide < 3; slide++) {
      const current = page.locator('.hero-slide:not([hidden])');
      const banner = await current.boundingBox();
      const last = await current.locator('li, a.lbh-button').last().boundingBox();
      const artwork = await current.locator('.home-hero__image').boundingBox();
      expect(last!.y + last!.height).toBeLessThanOrEqual(banner!.y + banner!.height);
      if (mobile) expect(last!.y + last!.height).toBeLessThanOrEqual(artwork!.y);
      await page.getByRole('button', { name: locale === 'cn' ? '下一张' : 'Next slide', exact: true }).click();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const image of await page.locator('.home-page img:visible').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((e:HTMLImageElement) => e.naturalWidth)).toBeGreaterThan(0);
    }
    await page.screenshot({ path:`test-results/home-${locale}-${width}-full.png`,fullPage:true,animations:'disabled' });
  });
}
