import { expect, test } from '@playwright/test';

for (const locale of ['en', 'cn']) for (const width of [320, 375, 393, 430, 700, 701, 768, 900, 1440]) {
  test(`${locale} ${width}: product headings stay inside their banner and clear the catalog`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/ProductIndex/`);
    await page.evaluate(() => document.fonts.ready);
    const banner = page.locator('.product-index__banner');
    const heading = banner.locator('h1');
    const catalog = page.locator('.product-index__catalog');
    const filter = catalog.locator('.product-filter-disclosure summary');
    const titleBox = (await heading.boundingBox())!;
    const bannerBox = (await banner.boundingBox())!;
    const filterBox = (await filter.boundingBox())!;
    for (const arrow of await catalog.locator('.product-carousel__controls > button').all()) {
      const bounds = (await arrow.boundingBox())!;
      expect(bounds.x).toBeGreaterThanOrEqual(0);
      expect(bounds.x + bounds.width).toBeLessThanOrEqual(width);
    }
    expect(titleBox.y + titleBox.height).toBeLessThanOrEqual(bannerBox.y + bannerBox.height);
    expect(filterBox.y).toBeGreaterThanOrEqual(titleBox.y + titleBox.height + 12);
    const font = await heading.evaluate(node => Number.parseFloat(getComputedStyle(node).fontSize));
    if (width <= 900) {
      expect(font).toBeLessThanOrEqual(width <= 767 ? 24 : 28);
      await expect(heading).toHaveCSS('text-transform', 'none');
      for (const title of await page.locator('.product-index__section > h2').all()) {
        const size = await title.evaluate(node => Number.parseFloat(getComputedStyle(node).fontSize));
        expect(size).toBeLessThanOrEqual(width <= 767 ? 24 : 28);
      }
      const proofBox = (await page.locator('.product-index__proof').boundingBox())!;
      const carouselBox = (await catalog.locator('.product-carousel').boundingBox())!;
      expect(proofBox.y - carouselBox.y - carouselBox.height).toBeLessThanOrEqual(40);
    } else {
      expect(font).toBe(34);
      await expect(heading).toHaveCSS('text-transform', 'uppercase');
    }
    await page.screenshot({ path: `/tmp/apower-product-mobile-top-${locale}-${width}.png`, animations: 'disabled' });
    await filter.click();
    await catalog.getByRole('button', { name: locale === 'cn' ? '吸附挂烫机系列' : 'Suction Garment Steamers', exact: true }).click();
    await filter.click();
    await expect(catalog.getByRole('link', { name: 'AP-AR01', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}

for (const locale of ['en', 'cn']) for (const width of [320, 393, 768, 1440]) {
  test(`${locale} ${width}: quality overview uses an undistorted APOWER cover and its original video`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
    await page.goto(`/${locale}/ProductIndex/`);
    const section = page.locator('.v3-product-overview');
    const player = section.locator('.source-video');
    const cover = player.locator('img');
    await expect(cover).toHaveAttribute('src', '/media/apower/overview-video-poster.webp');
    await player.scrollIntoViewIfNeeded();
    await cover.evaluate((image: HTMLImageElement) => image.decode());
    expect(await cover.evaluate((image: HTMLImageElement) => image.naturalWidth)).toBe(1920);
    const imageBox = (await cover.boundingBox())!;
    const playerBox = (await player.boundingBox())!;
    for (const key of ['x', 'y', 'width', 'height'] as const) expect(imageBox[key]).toBeCloseTo(playerBox[key], 0);
    expect(playerBox.width / playerBox.height).toBeCloseTo(16 / 9, 2);
    const control = (await player.locator('button > span').boundingBox())!;
    expect(control.x + control.width / 2).toBeCloseTo(playerBox.x + playerBox.width / 2, 0);
    expect(control.y + control.height / 2).toBeCloseTo(playerBox.y + playerBox.height / 2, 0);
    await section.screenshot({ path: `/tmp/apower-product-mobile-quality-${locale}-${width}.png`, animations: 'disabled' });
    expect(await player.locator('iframe').count()).toBe(0);
    await player.getByRole('button').press('Enter');
    await expect(player.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/uGqOG4NfbZQ?autoplay=1');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
