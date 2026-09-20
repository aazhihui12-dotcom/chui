import { expect, test } from '@playwright/test';

// Catch generated per-route styles overriding the shared surface and CTA hierarchy.
for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: light product surfaces and secondary CTA survive source styles`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/${locale}`);
    const hero = page.locator('.home-hero');
    for (const selector of ['h1', 'h1 span', 'li', 'li span', '.hero-counter']) {
      for (const element of await hero.locator(selector).all()) {
        await expect(element).toHaveCSS('color', 'rgb(255, 255, 255)');
      }
    }
    await expect(hero).toHaveCSS('background-color', 'rgb(16, 39, 70)');
    const heroImage = hero.locator('img');
    await expect(heroImage).toHaveAttribute('src', '/media/home-desktop-deep-blue.webp');
    expect(await heroImage.evaluate(async (image: HTMLImageElement) => {
      await image.decode();
      return [image.naturalWidth, image.naturalHeight];
    })).toEqual([1920, 800]);
    if (width === 390) {
      await expect(hero).toHaveCSS('background-image', /home-mobile-deep-blue\.webp/);
      expect(await hero.evaluate(async () => {
        const image = new Image();
        image.src = '/media/home-mobile-deep-blue.webp';
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
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(16, 39, 70)');
    await page.goto(`/${locale}/Contact_Us`);
    await expect(page.locator('.contact-inquiry-panel input').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.contact-details h2')).toHaveCSS('color', 'rgb(23, 50, 77)');
  });

  test(`${locale} ${width}: video statistics stay readable and dark card states use white text`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/${locale}`);
    const video = page.locator('.home-manufacturing__media');
    for (const text of await video.locator('.stats-grid dd, .stats-grid dt').all()) {
      await expect.soft(text).toHaveCSS('color', 'rgb(255, 255, 255)');
    }
    const overlay = await video.evaluate(e => {
      const style = getComputedStyle(e, '::after');
      return { background: style.backgroundColor, pointerEvents: style.pointerEvents, content: style.content };
    });
    expect.soft(overlay.background).toBe('rgba(16, 39, 70, 0.7)');
    expect.soft(overlay.pointerEvents).toBe('none');
    expect.soft(overlay.content).not.toBe('none');
    await page.goto(`/${locale}/Company_Introduction`);
    await expect.soft(page.locator('.editorial-banner h1')).toHaveCSS('color', 'rgb(255, 255, 255)');
    if (width === 390) {
      await expect.soft(page.locator('.editorial-section--feature h2').first()).toHaveCSS('color', 'rgb(23, 50, 77)');
    }
    await page.goto(`/${locale}/ProductIndex`);
    const card = page.locator('.product-carousel .product-card').first();
    await card.hover();
    await expect.soft(card.locator('h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.mouse.move(0, 0);
    await card.focus();
    await expect.soft(card.locator('h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
    await page.goto(`/${locale}/Product/682971.html`);
    await expect(page.locator('.product-category-nav h2')).toHaveCSS('color', 'rgb(255, 255, 255)');
  });
}
