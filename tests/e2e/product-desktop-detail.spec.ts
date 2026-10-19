import { expect, test } from '@playwright/test';

const models = ['AP-G1', 'AP-G3', 'AP-G11', 'AP-S1', 'AP-H1', 'AP-AR01'];

for (const locale of ['en', 'cn']) for (const model of models) for (const width of [1024, 1440, 1920, 2560]) {
  test(`${locale} ${model} ${width}: desktop gallery and specifications do not shrink on wide screens`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1100 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/ProductDetail/${model}.html/`);
    await page.evaluate(() => document.fonts.ready);
    const gallery = page.locator('.product-gallery');
    const main = gallery.locator('.product-gallery__main');
    const image = main.locator('img');
    const summary = page.locator('.product-summary');
    const thumbnails = gallery.locator('.product-gallery__thumbnails');
    const galleryBox = (await gallery.boundingBox())!;
    const mainBox = (await main.boundingBox())!;
    const infoBox = (await summary.boundingBox())!;
    expect(mainBox.width).toBeGreaterThanOrEqual(width === 1024 ? 360 : 450);
    expect(infoBox.width).toBeGreaterThanOrEqual(width === 1024 ? 460 : 580);
    expect(galleryBox.y).toBeCloseTo(infoBox.y, 0);
    expect(infoBox.x).toBeGreaterThanOrEqual(mainBox.x + mainBox.width + 30);
    expect((await thumbnails.boundingBox())!.y).toBeGreaterThanOrEqual(mainBox.y + mainBox.height);
    await expect(image).toHaveCSS('object-fit', 'contain');
    await expect(summary.locator('h1')).toHaveCSS('color', 'rgb(255, 255, 255)');
    const cells = await summary.locator('th, td').evaluateAll(nodes => nodes.map(node => {
      const range = document.createRange(); range.selectNodeContents(node);
      const text = range.getBoundingClientRect(), box = node.getBoundingClientRect();
      return { contained: text.left >= box.left - 1 && text.right <= box.right + 1 };
    }));
    expect(cells.every(cell => cell.contained)).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440) {
      const first = await image.getAttribute('src');
      const color = thumbnails.locator('button').nth(1);
      await color.click();
      await expect(color).toHaveAttribute('aria-pressed', 'true');
      await expect(image).not.toHaveAttribute('src', first!);
      await main.click();
      await expect(page.getByRole('dialog', { name: locale === 'cn' ? `${model}图片库` : `${model} gallery`, exact: true })).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.getByRole('dialog')).toHaveCount(0);
      await expect(main).toBeFocused();
    }
    if (model === 'AP-G3' && width === 1920) await page.locator('.product-detail__top').screenshot({ path: `/tmp/apower-detail-fixed-${locale}-1920.png`, animations: 'disabled' });
  });
}

for (const locale of ['en', 'cn']) for (const model of models) {
  test(`${locale} ${model}: existing phone gallery remains unchanged`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/ProductDetail/${model}.html/`);
    const top = page.locator('.product-detail__top');
    const main = page.locator('.product-gallery__main');
    const summary = page.locator('.product-summary');
    await expect(top).toHaveCSS('padding', '35px 24px');
    await expect(top).toHaveCSS('grid-template-columns', '322px');
    expect((await main.boundingBox())!.height).toBe(320);
    expect((await summary.boundingBox())!.y).toBeGreaterThan((await main.boundingBox())!.y + 320);
    await expect(page.locator('.product-gallery__thumbnails')).toHaveCSS('position', 'absolute');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
