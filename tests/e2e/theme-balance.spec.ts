import { expect, test } from '@playwright/test';

// Catch generated per-route styles overriding the shared surface and CTA hierarchy.
for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: light product surfaces and secondary CTA survive source styles`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/${locale}`);
    const hero = page.locator('.home-hero');
    const heroImage = hero.locator('img');
    await expect(heroImage).toHaveAttribute('src', '/media/home-desktop-ice-blue.webp');
    expect(await heroImage.evaluate(async (image: HTMLImageElement) => {
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    })).toEqual([1920, 800]);
    if (width === 390) {
      await expect(hero).toHaveCSS('background-image', /home-mobile-ice-blue\.webp/);
      expect(await hero.evaluate(async () => {
        const image = new Image();
        image.src = '/media/home-mobile-ice-blue.webp';
        await image.decode();
        return [image.naturalWidth, image.naturalHeight];
      })).toEqual([1308, 1816]);
    }
    expect((await hero.boundingBox())?.height).toBe(width === 1440 ? 600 : locale === 'cn' ? 520 : 635);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.home-mission .text-link')).not.toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.audience-card p').first()).not.toHaveCSS('color', 'rgb(255, 255, 255)');
    const primary = page.locator('.home-products .lbh-button:not(.lbh-button--outline)').first();
    const secondary = page.locator('.home-products .lbh-button--outline').first();
    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();
    await expect(primary).toHaveCSS('background-color', 'rgb(22, 93, 204)');
    await primary.hover();
    await expect(primary).toHaveCSS('background-color', 'rgb(16, 74, 166)');
    await expect(secondary).toHaveCSS('color', 'rgb(22, 93, 204)');
    await expect(secondary).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(await secondary.evaluate(e => getComputedStyle(e).boxShadow)).not.toBe('none');
    await secondary.hover();
    await expect(secondary).toHaveCSS('color', 'rgb(16, 74, 166)');
    expect((await secondary.boundingBox())?.width).toBe(secondaryBox?.width);
    expect((await primary.boundingBox())?.height).toBe(primaryBox?.height);
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(23, 24, 32)');
    await page.goto(`/${locale}/Contact_Us`);
    await expect(page.locator('.contact-inquiry-panel input').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.contact-details h2')).toHaveCSS('color', 'rgb(37, 36, 45)');
  });
}
