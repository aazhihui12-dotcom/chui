import { expect, test } from '@playwright/test';

for (const locale of ['cn', 'en']) for (const width of [1440, 390]) {
  test(`${locale} v2 products and supplied artwork at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    for (const [model, watts, count] of [
      ['AP-G1', '1500W', 3], ['AP-G3', '1500W', 3], ['AP-G11', '1600W', 3],
      ['AP-S1', '1400W', 3], ['AP-H1', '1000W', 3], ['AP-AR01', '930W', 4],
    ] as const) {
      expect((await page.goto(`/${locale}/ProductDetail/${model}.html/`))?.status()).toBe(200);
      await expect(page.locator('.product-summary')).toContainText(watts);
      const main = page.locator('.product-gallery__main img');
      await expect(main).toHaveAttribute('src', /apower\/v2\//);
      const previous = await main.getAttribute('src');
      await page.locator('.product-gallery__thumbnails button').nth(1).click();
      await expect(main).not.toHaveAttribute('src', previous!);
      await expect.poll(() => main.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await page.locator('.product-gallery__main').click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      const details = page.getByRole('tabpanel').locator('img');
      await expect(details).toHaveCount(count);
      for (let i = 0; i < count; i++) {
        const image = details.nth(i);
        await expect(image).toHaveAttribute('src', new RegExp(`apower/v2/${model.toLowerCase()}-detail-${i + 1}\\.webp`));
        await image.scrollIntoViewIfNeeded();
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
      if (model === 'AP-G3') {
        await page.evaluate(() => scrollTo(0, 0));
        await page.screenshot({ path: `test-results/v2-${locale}-product-${width}.png`, animations: 'disabled' });
      }
    }
    for (const [route, key] of [['Order_Management', 'order-phone'], ['Factory_tour', 'factory-5s']] as const) {
      await page.goto(`/${locale}/${route}/`);
      const image = page.locator(`img[src*="/v2/${key}.webp"]`);
      await expect(image).toHaveCount(1);
      await image.scrollIntoViewIfNeeded();
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      // naturalWidth can precede decode/rasterization of a large lazy image.
      // Capture the rendered material, not a transient blank scroll frame.
      await image.evaluate(async (img: HTMLImageElement) => {
        await img.decode();
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      await page.screenshot({ path: `test-results/v2-${locale}-${key}-${width}.png`, animations: 'disabled' });
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.goto(`/${locale}/`);
    const hero = page.locator('.home-hero');
    for (let i = 0; i < 3; i++) {
      const image = hero.locator('.hero-slide:not([hidden]) img');
      await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await page.screenshot({ path: `test-results/v2-${locale}-hero-${i + 1}-${width}.png`, animations: 'disabled' });
      await hero.getByRole('button', { name: locale === 'cn' ? '下一张' : 'Next slide', exact: true }).click();
    }
    expect(errors).toEqual([]);
  });
}

test('renamed Factory 1 address retains captured typography', async ({ page }) => {
  await page.goto('/en/Contact_Us/');
  const label = page.locator('dt').filter({ hasText: /^Factory 1 Address$/ });
  await expect(label).toHaveCSS('font-weight', '700');
  await expect(label).toHaveCSS('line-height', '21.328px');
});
