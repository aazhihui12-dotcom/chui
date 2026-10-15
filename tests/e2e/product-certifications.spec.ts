import { expect, test } from '@playwright/test';

for (const locale of ['cn', 'en']) for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`${locale} ${width}: all seven certification icons stay in one enlarged row`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/ProductIndex/`);
    const section = page.locator('.product-index__certifications');
    const icons = section.locator('img');
    await expect(icons).toHaveCount(7);
    await section.scrollIntoViewIfNeeded();
    const bounds = await icons.evaluateAll(nodes => nodes.map(node => {
      const rect = node.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    }));
    for (const [index, rect] of bounds.entries()) {
      expect(rect.y).toBeCloseTo(bounds[0].y, 0);
      expect(rect.height).toBeGreaterThanOrEqual(90);
      if (index) expect(rect.x).toBeGreaterThan(bounds[index - 1].x + bounds[index - 1].width);
    }
    expect(bounds[0].x).toBeGreaterThanOrEqual(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width >= 768) {
      expect(bounds[0].x).toBeGreaterThanOrEqual(0);
      expect(bounds[6].x + bounds[6].width).toBeLessThanOrEqual(width);
    } else {
      const strip = section.getByRole('region', { name: locale === 'cn' ? '产品认证标识' : 'Product certification marks' });
      await strip.focus();
      await page.keyboard.press('ArrowRight');
      await expect.poll(() => strip.evaluate(node => node.scrollLeft)).toBeGreaterThan(0);
      for (let step = 0; step < 24; step++) await page.keyboard.press('ArrowRight');
      await expect.poll(async () => {const last=(await icons.last().boundingBox())!;return last.x+last.width;}).toBeLessThanOrEqual(width);
      await strip.evaluate(node => { node.scrollLeft = 0; });
    }
    if (width === 1440 || width === 390) {
      await section.screenshot({ path: `/tmp/apower-certifications-${locale}-${width}.png`, animations: 'disabled', style: '.skip-link,.mobile-shortcuts,.floating-actions{visibility:hidden!important}' });
    }
  });
}
