import { expect, test } from '@playwright/test';

const players = [
  { route: 'Product_manufacturing', cover: 'production-video-poster.webp' },
  { route: 'Factory_tour', cover: 'factory-tour-video-poster.webp' },
];

for (const { route, cover: file } of players) for (const locale of ['en', 'cn']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: ${route} uses its high-resolution cover without changing the video or other players`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.route('https://www.youtube-nocookie.com/**', route => route.abort());
    const failures: string[] = [];
    page.on('pageerror', error => failures.push(error.message));
    await page.goto(`/${locale}/${route}/`);
    const player = page.locator('.source-video').first();
    const cover = player.locator('img');
    await expect(cover).toHaveAttribute('src', `/media/apower/${file}`);
    await player.scrollIntoViewIfNeeded();
    await cover.evaluate((node: HTMLImageElement) => node.decode());
    const size = await cover.evaluate((node: HTMLImageElement) => ({ width: node.naturalWidth, height: node.naturalHeight }));
    expect(size.width).toBeGreaterThanOrEqual(1920);
    expect(size.width / size.height).toBeCloseTo(16 / 9, 2);
    const frame = (await player.boundingBox())!;
    const image = (await cover.boundingBox())!;
    expect(image.x).toBeCloseTo(frame.x, 0);
    expect(image.y).toBeCloseTo(frame.y, 0);
    expect(image.width).toBeCloseTo(frame.width, 0);
    expect(image.height).toBeCloseTo(frame.height, 0);
    const play = (await player.locator('button > span').boundingBox())!;
    expect(play.x + play.width / 2).toBeCloseTo(frame.x + frame.width / 2, 0);
    expect(play.y + play.height / 2).toBeCloseTo(frame.y + frame.height / 2, 0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await player.screenshot({ path: `/tmp/apower-${route}-cover-${locale}-${width}.png`, animations: 'disabled' });
    expect(await page.locator('iframe').count()).toBe(0);
    await player.getByRole('button').click();
    await expect(player.locator('iframe')).toHaveAttribute('src', 'https://www.youtube-nocookie.com/embed/bx1R2NQPTxw?autoplay=1');
    await page.goto(`/${locale}/`);
    await expect(page.locator('.home-welcome__media .source-video img')).toHaveAttribute('src', '/media/manufacturing-poster.jpg');
    expect(failures).toEqual([]);
  });
}
