import { expect, test } from '@playwright/test';

// Retained CN modules 720156467 / 724117931: fadeInUp, 0.5s delay,
// 2.5s duration and a 150px vertical entrance. These tests exercise the
// actual animation lifecycle, not just the presence of a CSS class.
for (const locale of ['cn', 'en']) for (const width of [1440, 390]) {
  test(`${locale} ${width}: sustainability enters on scroll and only once`, async ({ page }) => {
    await page.setViewportSize({ width, height:900 });
    await page.emulateMedia({ reducedMotion:'no-preference' });
    await page.goto(`/${locale}/`);
    const row = page.locator('.sustainability-grid');
    await expect(row).toHaveAttribute('data-home-motion-state', 'pending');
    await expect(row).toHaveCSS('opacity', '0');
    await page.locator('.home-sustainability').scrollIntoViewIfNeeded();
    await expect(row).toHaveAttribute('data-home-motion-state', 'running');
    const timing = await row.evaluate(el => {
      const animation = el.getAnimations()[0];
      const timing = animation.effect!.getTiming();
      animation.pause();
      animation.currentTime = 1000;
      return {delay:timing.delay, duration:timing.duration, easing:timing.easing};
    });
    expect(timing).toEqual({ delay:500, duration:2500, easing:'ease' });
    const middle = await row.evaluate(el => ({opacity:Number(getComputedStyle(el).opacity),translate:getComputedStyle(el).translate}));
    expect(middle.opacity).toBeGreaterThan(0);
    expect(middle.opacity).toBeLessThan(1);
    expect(middle.translate).not.toBe('none');
    // Animation sampling must not overwrite the grid's horizontal centering.
    const section = await page.locator('.home-sustainability').boundingBox();
    const box = await row.boundingBox();
    expect(box!.x + box!.width / 2).toBeCloseTo(section!.x + section!.width / 2, 0);
    await row.evaluate(el => el.getAnimations().forEach(animation => animation.finish()));
    await expect(row).toHaveAttribute('data-home-motion-state', 'settled');
    await expect(row).toHaveCSS('opacity', '1');
    await row.screenshot({path:`test-results/home-motion-${locale}-${width}.png`});
    await page.locator('.home-hero').scrollIntoViewIfNeeded();
    await page.locator('.home-sustainability').scrollIntoViewIfNeeded();
    expect(await row.evaluate(el => el.getAnimations().length)).toBe(0);
  });
}

test('partner cards retain the five original staggered entrance delays', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/cn/');
  const cards = page.locator('.audience-card');
  for (const [index, delay] of [300,600,900,1200,1500].entries()) {
    const card=cards.nth(index);
    await card.scrollIntoViewIfNeeded();
    await expect(card).toHaveAttribute('data-home-motion-state','running');
    expect(await card.evaluate(el => el.getAnimations()[0].effect!.getTiming().delay)).toBe(delay);
    await card.evaluate(el=>el.getAnimations().forEach(animation=>animation.finish()));
    await expect(card).toHaveAttribute('data-home-motion-state','settled');
  }
});

test('reduced motion and a live preference change keep all homepage content visible', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/');
  await expect(page.locator('.sustainability-grid')).toHaveAttribute('data-home-motion-state','pending');
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.sustainability-grid')).toHaveCSS('opacity','1');
  await expect(page.locator('.sustainability-grid')).toHaveCSS('animation-name','none');
  await page.reload();
  await page.locator('.home-sustainability').scrollIntoViewIfNeeded();
  await expect(page.locator('.sustainability-grid')).toHaveCSS('opacity','1');
  await expect(page.locator('.sustainability-grid')).toHaveCSS('animation-name','none');
});

test('homepage content remains visible without JavaScript', async ({ browser, baseURL }) => {
  const context=await browser.newContext({javaScriptEnabled:false});
  const page=await context.newPage();
  await page.goto(`${baseURL}/cn/`);
  await page.locator('.home-sustainability').scrollIntoViewIfNeeded();
  await expect(page.locator('.sustainability-grid')).toHaveCSS('opacity','1');
  await expect(page.locator('.sustainability-grid a')).toHaveCount(4);
  await context.close();
});

test('unsupported observers never leave content invisible', async ({ page }) => {
  await page.addInitScript(()=>Object.defineProperty(window,'IntersectionObserver',{value:undefined,configurable:true}));
  await page.goto('/en/');
  await page.locator('.home-sustainability').scrollIntoViewIfNeeded();
  await expect(page.locator('.sustainability-grid')).toHaveCSS('opacity','1');
});

test('keyboard focus reveals an entrance immediately', async ({ page }) => {
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/');
  const row=page.locator('.sustainability-grid');
  await expect(row).toHaveAttribute('data-home-motion-state','pending');
  const link=row.locator('a').first();
  await link.focus();
  await expect(link).toBeFocused();
  await expect(row).toHaveAttribute('data-home-motion-state','settled');
  await expect(row).toHaveCSS('opacity','1');
});

for (const width of [1024,1280]) test(`hero ${width}: source motion naturally finishes within banner bounds`, async ({ page }) => {
  await page.setViewportSize({width,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/');
  const title=page.locator('.hero-slide:not([hidden]) h1');
  const bullets=page.locator('.hero-slide:not([hidden]) ul');
  await expect(title).toHaveAttribute('data-home-motion-state','running');
  expect(await title.evaluate(el=>el.getAnimations()[0].effect!.getTiming().duration)).toBe(2500);
  await expect(title).toHaveAttribute('data-home-motion-state','settled',{timeout:6000});
  await expect(bullets).toHaveAttribute('data-home-motion-state','settled');
  const banner=await page.locator('.hero-slide:not([hidden])').boundingBox();
  const last=await bullets.locator('li').last().boundingBox();
  expect(last!.y+last!.height).toBeLessThanOrEqual(banner!.y+banner!.height);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
});
