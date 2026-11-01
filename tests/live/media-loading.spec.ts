import { expect, test } from '@playwright/test';

test.use({ reducedMotion: 'no-preference' });
const videoPath = '/media/apower/home-manufacturing-preview.mp4';
const backgroundPath = '/media/51a97dab42ca11657877b8ccd8b420f4a8e002b2afd65dfda466975a828018c8.webp';

for (const width of [1440, 390]) {
  test(`${width}: offscreen video stays unloaded and preserves visible playback and manual pause`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const videos: string[] = [];
    page.on('request', r => { if (r.url().includes(videoPath)) videos.push(r.url()); });
    await page.goto('/en/', { waitUntil: 'networkidle' });
    const preview = page.locator('.home-manufacturing .video-preview');
    expect((await preview.boundingBox())!.y).toBeGreaterThan(844);
    expect(videos).toEqual([]);
    await expect(preview.locator('img')).toHaveAttribute('loading', 'lazy');
    await preview.scrollIntoViewIfNeeded();
    const video = preview.locator('video');
    await expect(video).toHaveAttribute('src', videoPath);
    await expect(video).toHaveJSProperty('paused', false);
    await expect(video).toHaveJSProperty('muted', true);
    await page.locator('.home-hero').scrollIntoViewIfNeeded();
    await expect(video).toHaveJSProperty('paused', true);
    await preview.scrollIntoViewIfNeeded();
    await expect(video).toHaveJSProperty('paused', false);
    await page.getByRole('button', { name: 'Pause background video' }).focus();
    await page.keyboard.press('Enter');
    await expect(video).toHaveJSProperty('paused', true);
    await page.locator('.home-hero').scrollIntoViewIfNeeded();
    await preview.scrollIntoViewIfNeeded();
    await expect(video).toHaveJSProperty('paused', true);
  });

  test(`${width}: lazy background retains the original cover layout`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const requested: string[] = [];
    page.on('request', r => { if (r.url().includes(backgroundPath)) requested.push(r.url()); });
    await page.goto('/en/', { waitUntil: 'networkidle' });
    expect(requested).toEqual([]);
    const section = page.locator('.home-sustainability');
    await section.scrollIntoViewIfNeeded();
    const image = section.locator(':scope > img');
    await expect(image).toHaveAttribute('loading', 'lazy');
    await expect.poll(() => image.evaluate((i: HTMLImageElement) => i.naturalWidth)).toBeGreaterThan(0);
    await expect(image).toHaveCSS('object-fit', 'cover');
    const bounds = (await section.boundingBox())!;
    const picture = (await image.boundingBox())!;
    expect(picture.x).toBeCloseTo(bounds.x, 0);
    expect(picture.y).toBeCloseTo(bounds.y, 0);
    expect(picture.width).toBeCloseTo(bounds.width, 0);
    expect(picture.height).toBeCloseTo(bounds.height, 0);
    await expect(section.locator('.sustainability-grid a')).toHaveCount(4);
    await section.screenshot({ path: `test-results-live/media-background-${width}.png` });
  });

  test(`${width}: static background poster keeps the original video crop and brightness`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/en/');
    const preview = page.locator('.home-manufacturing .video-preview');
    await preview.scrollIntoViewIfNeeded();
    const poster = preview.locator('img');
    await expect(poster).toHaveCSS('filter', 'none');
    await expect(poster).toHaveCSS('object-fit', 'cover');
    const frame = (await preview.boundingBox())!;
    const image = (await poster.boundingBox())!;
    expect(image.width).toBeCloseTo(frame.width, 0);
    expect(image.height).toBeCloseTo(frame.height, 0);
  });
}

test('reduced motion keeps the poster and live changes pause an activated video', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cn/');
  const preview = page.locator('.home-manufacturing .video-preview');
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.locator('img')).toHaveAttribute('loading', 'lazy');
  await expect(preview.locator('video')).toHaveCount(0);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect(preview.locator('video')).toHaveJSProperty('paused', false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(preview.locator('video')).toHaveJSProperty('paused', true);
});

test('public file caching does not leak into missing files, pages or CMS responses', async ({ request }) => {
  for (const path of ['/media/apower/v2/hero-brand.webp', '/fonts/Inter-Medium.woff2']) {
    const response = await request.get(path);
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control']).toBe('public, max-age=86400');
  }
  for (const path of ['/en/', '/admin/', '/media/apower/definitely-missing-performance.webp', '/media/apower/v2/HERO-BRAND.webp', '/MEDIA/apower/v2/hero-brand.webp', '/fonts/INTER-MEDIUM.woff2']) {
    const response = await request.get(path);
    expect(response.headers()['cache-control']).not.toContain('max-age=86400');
  }
  const unauthorized = await request.get('/api/cms/content/product/');
  expect(unauthorized.status()).toBe(401);
  expect(unauthorized.headers()['cache-control']).toContain('no-store');
});

test('case-sensitive asset headers retain existing bilingual routes and slash redirects', async ({ request }) => {
  for (const path of ['/en/ProductIndex/', '/cn/Design_and_Development/', '/en/ProductDetail/AP-G1.html', '/cn/Factory_tour/']) {
    expect((await request.get(path)).status()).toBe(200);
  }
  const redirect = await request.get('/en', { maxRedirects: 0 });
  expect(redirect.status()).toBe(308);
  expect(redirect.headers().location).toBe('/en/');
});
