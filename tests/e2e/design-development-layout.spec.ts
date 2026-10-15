import { expect, test } from '@playwright/test';

for (const locale of ['en', 'cn']) for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`${locale} ${width}: design introduction has a unified centered title and a compact aligned text/image row`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/Design_and_Development/`);
    await page.evaluate(() => document.fonts.ready);
    const sections = page.locator('main > .editorial-section');
    const titleSection = sections.nth(0);
    const bodySection = sections.nth(1);
    const title = titleSection.getByRole('heading');
    const paragraphs = bodySection.locator('p');
    const image = bodySection.locator('img');
    await expect(title).toHaveCount(1);
    await expect(title).toHaveText(locale === 'en' ? 'The Engine Behind Brand Sales: A Dedicated Team and a Design-Driven Mindset' : '品牌销售引擎：专注的团队与设计态度');
    await expect(titleSection.locator('p')).toHaveCount(0);
    await expect(paragraphs).toHaveCount(2);
    await expect(paragraphs.first()).toContainText('ARON');
    await expect(paragraphs.first()).toContainText(locale === 'en' ? 'our first five years' : '成立 5 年内');
    await expect(image).toHaveAttribute('src', '/media/35ba69dfcc0902a8c361ffbadd99d1a993a8dd14b9d5a2e3d94bdb49985d2beb.webp');
    await expect(title).toHaveCSS('font-size', width >= 768 ? '40px' : '22px');
    for (const node of [title, ...await paragraphs.all()]) {
      await expect(node).toHaveCSS('font-weight', '500');
      expect(await node.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Inter');
    }
    for (const paragraph of await paragraphs.all()) {
      await expect(paragraph).toHaveCSS('font-size', '16px');
      await expect(paragraph).toHaveCSS('line-height', '32px');
      await expect(paragraph).toHaveCSS('color', locale === 'en' ? 'rgb(98, 96, 92)' : 'rgb(0, 0, 0)');
    }
    await image.evaluate((node: HTMLImageElement) => node.decode());
    await titleSection.scrollIntoViewIfNeeded();
    const headingBounds = (await title.boundingBox())!;
    const textBounds = (await bodySection.locator('.content-text').boundingBox())!;
    const firstParagraphBounds = (await paragraphs.first().boundingBox())!;
    const imageBounds = (await image.boundingBox())!;
    const headingGap = firstParagraphBounds.y - headingBounds.y - headingBounds.height;
    expect(Math.abs(headingBounds.x + headingBounds.width / 2 - width / 2)).toBeLessThanOrEqual(1);
    expect(headingGap).toBeGreaterThanOrEqual(24);
    expect(headingGap).toBeLessThanOrEqual(60);
    if (width >= 768) {
      expect(textBounds.x + textBounds.width + 24).toBeLessThanOrEqual(imageBounds.x);
      expect(Math.abs(firstParagraphBounds.y - imageBounds.y)).toBeLessThanOrEqual(1);
    } else {
      expect(textBounds.y + textBounds.height + 24).toBeLessThanOrEqual(imageBounds.y);
    }
    expect(imageBounds.width / imageBounds.height).toBeCloseTo(1.5, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (width === 1440 || width === 390) {
      const start = (await titleSection.boundingBox())!;
      const end = (await bodySection.boundingBox())!;
      const scrollY = await page.evaluate(() => window.scrollY);
      await page.screenshot({ path: `/tmp/apower-design-${locale}-${width}.png`, clip: { x: 0, y: start.y + scrollY, width, height: end.y + end.height - start.y }, animations: 'disabled', style: '.skip-link,.mobile-shortcuts,.floating-actions{visibility:hidden!important}' });
    }
  });
}

for (const locale of ['en', 'cn']) for (const width of [320, 390, 768, 1024, 1440, 1920]) {
  test(`${locale} ${width}: facilities body and numbered benefits align left while the title stays centered`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(`/${locale}/Design_and_Development/`);
    await page.evaluate(() => document.fonts.ready);
    const section = page.locator('.v3-design-facilities');
    const title = section.locator(':scope > .content-text h2');
    const paragraphs = section.locator('.editorial-section__inner p');
    await expect(title).toHaveCSS('text-align', 'center');
    await expect(paragraphs).toHaveCount(4);
    for (const paragraph of await paragraphs.all()) {
      await expect(paragraph).toHaveCSS('text-align', 'left');
      await expect(paragraph).toHaveCSS('color', 'rgb(255, 255, 255)');
      await expect(paragraph).toHaveCSS('font-weight', '500');
    }
    const edges = await paragraphs.evaluateAll(nodes => nodes.map(node => {
      const range = document.createRange();
      range.selectNodeContents(node);
      return { box: node.getBoundingClientRect().left, text: range.getClientRects()[0].left };
    }));
    for (const edge of edges) {
      expect(edge.box).toBeCloseTo(edges[0].box, 0);
      expect(edge.text).toBeCloseTo(edge.box, 0);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await section.scrollIntoViewIfNeeded();
    await section.locator('img').evaluate((node: HTMLImageElement) => node.decode());
    if (width === 1440 || width === 390) await section.screenshot({ path: `/tmp/apower-facilities-${locale}-${width}.png`, animations: 'disabled', style: '.skip-link,.mobile-shortcuts,.floating-actions{visibility:hidden!important}' });
  });
}
