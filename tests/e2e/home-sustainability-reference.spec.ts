import { expect, test } from '@playwright/test';

// LBH retained homepage: full-width 1920:406 leaf photograph, transparent
// icon columns, source PNGs and white Poppins typography (not white cards).
for (const locale of ['cn', 'en']) for (const width of [1098, 1280, 1440, 1920, 390]) {
  test(`${locale} ${width}: sustainability reference composition`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/`);
    const section = page.locator('.home-sustainability');
    await section.scrollIntoViewIfNeeded();
    const cards = section.locator('.sustainability-grid a');
    await expect(cards).toHaveCount(4);
    await expect(cards.first()).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    await expect(cards.first().locator('h3')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(section.locator('.sustainability-grid img')).toHaveCount(4);
    for (const icon of await section.locator('.sustainability-grid img').all()) {
      await expect.poll(() => icon.evaluate((e: HTMLImageElement) => e.naturalWidth)).toBe(200);
      await expect(icon).toHaveAttribute('alt', '');
    }
    if (width >= 1024) {
      const container = await section.locator('.home-section').boundingBox();
      const title = await section.locator('h2').boundingBox();
      expect(title!.x + title!.width / 2).toBeCloseTo(container!.x + container!.width / 2, 0);
      const rectangles = await Promise.all((await cards.all()).map(card => card.boundingBox()));
      for (const r of rectangles) {
        expect(r!.y).toBeCloseTo(rectangles[0]!.y, 0);
      }
      if (locale === 'en') {
        await expect(section.locator('h2')).toHaveCSS('font-size', '32px');
        await expect(section.locator('h2')).toHaveCSS('font-weight', '700');
        await expect(cards.nth(1).locator('h3')).toHaveCSS('line-height', '30px');
        await expect(section.locator('h2')).toHaveCSS('font-family', 'Poppins');
        await expect(cards.first().locator('h3')).toHaveCSS('font-family', 'Poppins');
      } else {
        await expect(section.locator('h2')).toHaveCSS('font-size', '40px');
        await expect(section.locator('h2')).toHaveCSS('font-weight', '400');
        await expect(cards.nth(0).locator('h3')).toHaveCSS('font-size', '20px');
        await expect(cards.nth(1).locator('h3')).toHaveCSS('font-size', '20px');
        await expect(cards.nth(2).locator('h3')).toHaveCSS('font-size', '18px');
        await expect(cards.nth(3).locator('h3')).toHaveCSS('font-size', '18px');
        await expect(cards.first().locator('h3')).toHaveCSS('line-height', '23.994px');
      }
      const bounds = await section.boundingBox();
      const grid = await section.locator('.sustainability-grid').boundingBox();
      // Source margin-top: -10.9718% of the full-width photograph, not
      // bottom alignment against the height of the replacement labels.
      expect(grid!.y - bounds!.y).toBeCloseTo(bounds!.height - bounds!.width * 0.109718, 0);
      for (const card of await cards.all()) {
        const label = await card.locator('h3').boundingBox();
        const icon = await card.locator('img').boundingBox();
        const column = await card.boundingBox();
        expect(label!.width).toBeCloseTo(column!.width - 30, 0);
        expect(label!.y - icon!.y - icon!.height).toBeCloseTo(18, 0);
      }
      if (width === 1440) {
        const bounds = await section.boundingBox();
        expect(bounds!.height).toBeCloseTo(304.5, 0);
        expect((await section.locator('.sustainability-grid').boundingBox())!.width).toBeCloseTo(1089, 0);
      }
    } else {
      const first = await cards.nth(0).boundingBox();
      const second = await cards.nth(1).boundingBox();
      const third = await cards.nth(2).boundingBox();
      expect(second!.y).toBeCloseTo(first!.y, 0);
      expect(third!.y).toBeGreaterThan(first!.y);
      expect(third!.y).toBeGreaterThanOrEqual(first!.y + first!.height);
      if (locale === 'en') {
        await expect(cards.nth(0).locator('h3')).toHaveCSS('font-family', /Helvetica Neue/);
        await expect(cards.nth(1).locator('h3')).toHaveCSS('font-family', 'Verdana');
        await expect(cards.nth(2).locator('h3')).toHaveCSS('font-family', 'Poppins');
      } else {
        await expect(cards.first().locator('h3')).toHaveCSS('line-height', '23.994px');
      }
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await expect(cards.first()).toHaveAttribute('href', `/${locale}/Sustainable_Development`);
    await section.screenshot({ path: `test-results/sustainability-${locale}-${width}.png`, animations: 'disabled' });
  });
}
