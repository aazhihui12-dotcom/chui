import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => page.emulateMedia({ reducedMotion: 'reduce' }));

// Independent measurements from retained LBH slider modules: CN 1700px,
// EN 1800px centered containers; title tops 17% / 11% plus 10px padding.
// A fixed left/top offset or shared locale metrics must fail these checks.
for (const sample of [
  { locale: 'cn', width: 1440, x: 10, y: 112, bulletY: 228, bulletSize: '18px' },
  { locale: 'en', width: 1440, x: 10, y: 76, bulletY: 246, bulletSize: '16px' },
  { locale: 'cn', width: 1920, x: 120, y: 146, bulletY: 304, bulletSize: '18px' },
  { locale: 'en', width: 1920, x: 70, y: 98, bulletY: 328, bulletSize: '16px' },
  { locale: 'cn', width: 2560, x: 440, y: 191.33, bulletY: 405.33, bulletSize: '18px' },
  { locale: 'en', width: 2560, x: 390, y: 127.33, bulletY: 437.33, bulletSize: '16px' },
]) {
  test(`${sample.locale} ${sample.width}: first frame follows original centered text anchors`, async ({ page }) => {
    await page.setViewportSize({ width: sample.width, height: 1100 });
    await page.goto(`/${sample.locale}/`);
    const hero = (await page.locator('.home-hero').boundingBox())!;
    const heading = (await page.locator('.home-hero h1').boundingBox())!;
    const bullets = (await page.locator('.hero-slide:not([hidden]) ul').boundingBox())!;
    expect(heading.x).toBeCloseTo(sample.x, 0);
    expect(heading.y - hero.y).toBeCloseTo(sample.y, 0);
    // Longer replacement titles may push the list down, never up over the title.
    expect(bullets.y - hero.y).toBeGreaterThanOrEqual(sample.bulletY - .5);
    await expect(page.locator('.home-hero h1')).toHaveCSS('font-size', '36px');
    await expect(page.locator('.hero-slide:not([hidden]) li').first()).toHaveCSS('font-size', sample.bulletSize);
    if (sample.locale === 'cn' && sample.width === 1920) {
      // A two-character orphan is visually unbalanced on a wide desktop.
      const lines = await page.locator('.home-hero h1').evaluate(node => {
        const range = document.createRange(); range.selectNode(node.firstChild!);
        return Array.from(range.getClientRects()).map(rect => rect.width);
      });
      expect(lines[lines.length - 1]).toBeGreaterThan(lines[0] * .4);
    }
  });
}

for (const locale of ['cn', 'en']) for (const width of [320, 390, 430, 600, 768, 820, 1024, 1199, 1200, 1280, 1440, 1920, 2560]) {
  test(`${locale} ${width}: first-frame copy stays readable without overlapping its list`, async ({ page }) => {
    await page.setViewportSize({ width, height: width < 768 ? 844 : 1000 });
    await page.goto(`/${locale}/`);
    const visible = page.locator('.hero-slide:not([hidden])');
    const banner = (await visible.boundingBox())!;
    const heading = (await visible.locator('h1').boundingBox())!;
    const list = (await visible.locator('ul').boundingBox())!;
    const last = (await visible.locator('li').last().boundingBox())!;
    expect(heading.y + heading.height).toBeLessThanOrEqual(list.y + 1);
    expect(last.y + last.height).toBeLessThanOrEqual(banner.y + banner.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const textFits = await visible.locator('h1, li').evaluateAll(nodes => nodes.every(node => {
      const range = document.createRange(); range.selectNodeContents(node);
      return Array.from(range.getClientRects()).every(rect => rect.left >= -1 && rect.right <= innerWidth + 1);
    }));
    expect(textFits).toBe(true);
    if (width >= 768) {
      // Current APOWER artwork begins at the middle of the banner; long copy
      // must wrap before that product area rather than retain a full-width line.
      expect(heading.x + heading.width).toBeLessThanOrEqual(width * .48 + 1);
    }
    if (width < 768) {
      const artwork = (await visible.locator('img').boundingBox())!;
      expect(last.y + last.height).toBeLessThanOrEqual(artwork.y);
      expect(heading.x).toBeCloseTo(width * .057471 + 10, 0);
      expect(heading.y - banner.y).toBeCloseTo(width * .114943 + 10, 0);
    }
    if (width === 390 || width === 1920) {
      await page.screenshot({ path: `/tmp/apower-hero-${locale}-${width}.png`, animations: 'disabled' });
    }
  });
}
