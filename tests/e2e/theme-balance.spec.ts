import { expect, test } from '@playwright/test';

test('video dialog keyboard focus remains visible on charcoal surfaces', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('button', { name: 'Play manufacturing video' }).click();
  const close = page.getByRole('button', { name: 'Close video', exact: true });
  await page.keyboard.press('Tab');
  await close.focus();
  await expect(close).toHaveCSS('outline-color', 'rgb(201, 180, 152)');
});

// Catch generated per-route styles overriding the shared surface and CTA hierarchy.
for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: light product surfaces and secondary CTA survive source styles`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/${locale}`);
    const hero = page.locator('.home-hero');
    for (const selector of ['h1', 'h1 span', 'li', 'li span']) {
      for (const element of await hero.locator(selector).all()) {
        await expect(element).toHaveCSS('color', 'rgb(37, 35, 33)');
      }
    }
    await expect(hero).toHaveCSS('background-color', 'rgb(233, 223, 210)');
    const heroImage = hero.locator('.hero-slide:not([hidden]) img');
    await expect(heroImage).toHaveAttribute('src', '/media/apower/v2/hero-brand.webp');
    expect(await heroImage.evaluate(async (image: HTMLImageElement) => {
      await image.decode();
      return image.naturalWidth;
    })).toBeGreaterThan(0);
    expect((await hero.boundingBox())?.height).toBeGreaterThanOrEqual(width === 1440 ? 600 : locale === 'cn' ? 520 : 635);
    await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.home-mission .text-link')).not.toHaveCSS('color', 'rgb(255, 255, 255)');
    await expect(page.locator('.audience-card p').first()).not.toHaveCSS('color', 'rgb(255, 255, 255)');
    const primary = page.locator('.home-products .lbh-button:not(.lbh-button--outline)').first();
    const secondary = page.locator('.home-products .lbh-button--outline').first();
    const primaryBox = await primary.boundingBox();
    const secondaryBox = await secondary.boundingBox();
    await expect(primary).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await primary.hover();
    await expect(primary).toHaveCSS('background-color', 'rgb(26, 26, 26)');
    await expect(primary).toHaveCSS('color', 'rgb(201, 180, 152)');
    await expect(secondary).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(secondary).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
    expect(await secondary.evaluate(e => getComputedStyle(e).boxShadow)).not.toBe('none');
    await secondary.hover();
    await expect(secondary).toHaveCSS('color', 'rgb(26, 26, 26)');
    expect((await secondary.boundingBox())?.width).toBe(secondaryBox?.width);
    expect((await primary.boundingBox())?.height).toBe(primaryBox?.height);
    await expect(page.locator('.site-header')).toHaveCSS('background-color', 'rgb(51, 50, 50)');
    await page.goto(`/${locale}/Contact_Us`);
    await expect(page.locator('.contact-inquiry-panel input').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('.contact-details h2')).toHaveCSS('color', 'rgb(0, 0, 0)');
  });

  test(`${locale} ${width}: video statistics stay readable and dark card states use white text`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`/${locale}`);
    const video = page.locator('.home-manufacturing__media');
    for (const text of await video.locator('.stats-grid dd').all()) await expect.soft(text).toHaveCSS('color','rgb(217, 70, 75)');
    for (const text of await video.locator('.stats-grid dt').all()) await expect.soft(text).toHaveCSS('color', width === 390 ? 'rgb(34, 34, 34)' : 'rgb(255, 255, 255)');
    const overlay = await video.evaluate(e => {
      const style = getComputedStyle(e, '::after');
      return { background: style.backgroundColor, pointerEvents: style.pointerEvents, content: style.content };
    });
    expect.soft(overlay.background).toBe('rgba(51, 50, 50, 0.7)');
    expect.soft(overlay.pointerEvents).toBe('none');
    if (width === 390) await expect(video).toHaveCSS('background-color','rgb(255, 255, 255)');
    else expect.soft(overlay.content).not.toBe('none');
    await page.goto(`/${locale}/Company_Introduction`);
    await expect.soft(page.locator('.editorial-banner h1')).toHaveCSS('color', 'rgb(255, 255, 255)');
    if (width === 390) {
      await expect.soft(page.locator('.editorial-section--feature h2').first()).toHaveCSS('color', 'rgb(34, 34, 34)');
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
