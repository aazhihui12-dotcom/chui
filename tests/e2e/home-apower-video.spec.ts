import { expect, test } from '@playwright/test';

for (const locale of ['en', 'cn']) for (const width of [390, 768, 1440]) {
  test(`${locale} ${width}: homepage manufacturing uses APOWER preview and full video`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(`/${locale}/`);
    const section = page.locator('.home-manufacturing');
    const preview = section.locator('.video-preview video');
    await expect(preview).toHaveAttribute('src', '/media/apower/home-manufacturing-preview.mp4');
    await expect(preview).toHaveAttribute('poster', '/media/apower/factory-tour-video-poster.webp');
    await preview.evaluate((video: HTMLVideoElement) => video.load());
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(1280);
    await expect.poll(() => preview.evaluate((video: HTMLVideoElement) => video.paused)).toBe(true);
    expect(await page.locator('iframe').count()).toBe(0);
    await section.scrollIntoViewIfNeeded();
    await section.screenshot({ path: `/tmp/apower-home-video-${locale}-${width}.png`, animations: 'disabled' });
    const trigger = section.getByRole('button', { name: locale === 'cn' ? '播放制造视频' : 'Play manufacturing video', exact: true });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/bx1R2NQPTxw?autoplay=1');
    await expect(dialog.getByRole('link')).toHaveAttribute('href', 'https://www.youtube.com/watch?v=bx1R2NQPTxw');
    const frame = (await dialog.locator('iframe').boundingBox())!;
    expect(frame.width / frame.height).toBeCloseTo(16 / 9, 2);
    expect(frame.width).toBeLessThan(width);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(errors).toEqual([]);
  });
}

test('APOWER background retains keyboard pause, resume and reduced-motion support', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/en/');
  const video = page.locator('.home-manufacturing .video-preview video');
  await expect(video).toHaveAttribute('src', '/media/apower/home-manufacturing-preview.mp4');
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(false);
  await page.getByRole('button', { name: 'Pause background video', exact: true }).press('Enter');
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
  await page.getByRole('button', { name: 'Play background video', exact: true }).press('Enter');
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
});

test('keyboard users can leave the external player and close the manufacturing dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><button>Player controls</button>',
  }));
  await page.goto('/en/');
  const trigger = page.getByRole('button', { name: 'Play manufacturing video', exact: true });
  await trigger.click();
  const dialog = page.getByRole('dialog');
  await dialog.frameLocator('iframe').getByRole('button', { name: 'Player controls' }).focus();
  await page.keyboard.press('Tab');
  const exit = dialog.getByRole('button', { name: 'Close video and return to page', exact: true });
  await expect(exit).toBeFocused();
  await expect(exit).toBeInViewport();
  await page.keyboard.press('Enter');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});
