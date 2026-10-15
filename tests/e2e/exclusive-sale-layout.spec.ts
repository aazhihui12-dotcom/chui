import { expect, test } from '@playwright/test';

for (const locale of ['en', 'cn']) for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`${locale} ${width}: exclusive introduction separates its centered title from the copy and photograph`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/Exclusive_sale/`);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('main > .editorial-section').first();
    await section.scrollIntoViewIfNeeded();
    const title = section.getByRole('heading', { name: locale === 'en' ? 'We Value Your Business Opportunities' : '我们珍视您的商业机会', exact: true });
    const copy = section.locator('.editorial-section__group').first();
    const paragraphs = copy.locator('p');
    const image = section.locator('img');
    await expect(section.getByRole('heading')).toHaveCount(1);
    await expect(paragraphs).toHaveCount(4);
    await expect(paragraphs.first()).toHaveText(locale === 'en' ? 'APOWER TECH recommends distinctive, innovative products tailored to your brand.' : 'APOWER 电器专为您的品牌推荐独特的创新产品。');
    await expect(paragraphs.nth(1)).toHaveText(locale === 'en' ? 'Bringing differentiated products to your market gives your brand a unique competitive advantage.' : '将差异化产品引入您的市场，可让您的品牌在竞争中占据独特优势。');
    await expect(paragraphs.first()).toHaveCSS('font-size', '24px');
    await expect(paragraphs.nth(1)).toHaveCSS('font-size', '16px');
    await expect(paragraphs.nth(1)).toHaveCSS('line-height', '32px');
    await expect(paragraphs.first()).toHaveCSS('color', 'rgb(0, 0, 0)');
    await expect(paragraphs.nth(2)).toHaveCSS('color', locale === 'en' ? 'rgb(98, 96, 92)' : 'rgb(0, 0, 0)');
    for (const node of [title, ...await paragraphs.all()]) {
      await expect(node).toHaveCSS('font-weight', '500');
      expect(await node.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Inter');
    }
    await image.evaluate((node: HTMLImageElement) => node.decode());
    const headingBounds = (await title.boundingBox())!;
    const copyBounds = (await copy.boundingBox())!;
    const imageBounds = (await image.boundingBox())!;
    expect(Math.abs(headingBounds.x + headingBounds.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(headingBounds.y + headingBounds.height + 24).toBeLessThanOrEqual(copyBounds.y);
    expect(headingBounds.y + headingBounds.height + 24).toBeLessThanOrEqual(imageBounds.y);
    if (width >= 768) {
      expect(copyBounds.x + copyBounds.width + 24).toBeLessThanOrEqual(imageBounds.x);
      expect(Math.abs(imageBounds.y - copyBounds.y)).toBeLessThanOrEqual(1);
    } else {
      expect(copyBounds.y + copyBounds.height + 24).toBeLessThanOrEqual(imageBounds.y);
    }
    expect(imageBounds.width / imageBounds.height).toBeCloseTo(16 / 9, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440 || width === 390) await section.screenshot({ path: `/tmp/apower-exclusive-${locale}-${width}.png`, animations: 'disabled', style: '.skip-link,.mobile-shortcuts,.floating-actions{visibility:hidden!important}' });
  });
}
