import {expect,test} from '@playwright/test';

// Catch missing source hover transitions, fake zoom affordances, changed card
// geometry, lost keyboard access, and hover overlays leaking onto phones.
for(const locale of ['cn','en']) {
  test(`${locale}: partner hover reveals the source inset frame and magnifier, then restores`,async({page})=>{
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(`/${locale}/`);
    const cell=page.locator('.partner-carousel__track>div').first();
    await cell.scrollIntoViewIfNeeded();
    const bounds=await cell.boundingBox();
    await expect(cell.locator('.home-gallery__icon')).toHaveCSS('opacity','0');
    await cell.hover();
    await expect(cell.locator('.home-gallery__icon')).toHaveCSS('opacity','1');
    await expect(cell.locator('.home-gallery__frame')).toHaveCSS('left','10px');
    expect(await cell.boundingBox()).toEqual(bounds);
    await cell.screenshot({path:`test-results/home-logo-hover-${locale}.png`});
    await page.locator('.home-partners').screenshot({path:`test-results/home-partners-hover-${locale}.png`});
    await page.mouse.move(0,0);
    await expect(cell.locator('.home-gallery__icon')).toHaveCSS('opacity','0');
    await expect(cell.locator('.home-gallery__frame')).toHaveCSS('left','-10px');
  });

  test(`${locale}: contact arrow rotates into its white circle without moving the button`,async({page})=>{
    await page.goto(`/${locale}/`);
    const button=page.locator('.home-welcome .lbh-button');
    await button.scrollIntoViewIfNeeded();
    const bounds=await button.boundingBox();
    const arrow=button.locator('.source-button__arrow svg');
    await button.hover();
    await expect(arrow).toHaveCSS('transform','matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, 0)');
    await expect.poll(()=>button.locator('.source-button__arrow').evaluate(el=>getComputedStyle(el,'::after').opacity)).toBe('1');
    expect(await button.boundingBox()).toEqual(bounds);
    await page.mouse.move(0,0);
    await expect(arrow).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
    await button.focus();
    await expect(arrow).toHaveCSS('transform','matrix(0.707107, -0.707107, 0.707107, 0.707107, 0, 0)');
    await expect(button).toHaveAttribute('href',`/${locale}/Contact_Us`);
  });

  test(`${locale}: manufacturing play button grows and returns on mouse leave`,async({page})=>{
    await page.goto(`/${locale}/`);
    const button=page.locator('.home-manufacturing .video-preview');
    const play=button.locator('.video-preview__play');
    await button.hover();
    await expect(play).toHaveCSS('transform','matrix(1.4, 0, 0, 1.4, 0, 0)');
    await page.mouse.move(0,0);
    await expect(play).toHaveCSS('transform','matrix(1, 0, 0, 1, 0, 0)');
  });

  test(`${locale}: certificate hover opens the corresponding image and Escape returns focus`,async({page})=>{
    await page.goto(`/${locale}/`);
    const section=page.locator('.home-certifications');
    const image=section.locator('img').first();
    const src=await image.getAttribute('src');
    const button=section.locator('.home-gallery__image').first();
    await section.scrollIntoViewIfNeeded();
    await button.hover();
    await expect(button.locator('.home-gallery__icon')).toHaveCSS('opacity','1');
    await button.click();
    const dialog=page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('img')).toHaveAttribute('src',src!);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(button).toBeFocused();
  });
}

test('source product hover zoom stays clipped inside the original image slot',async({page})=>{
  await page.goto('/cn/');
  const card=page.locator('.product-category').first();
  await card.scrollIntoViewIfNeeded();
  const bounds=await card.boundingBox();
  await card.hover();
  await expect(card.locator('img')).toHaveCSS('transform','matrix(1.1, 0, 0, 1.1, 0, 0)');
  await expect(card).toHaveCSS('box-shadow','rgba(0, 0, 0, 0.1) 0px 15px 30px 0px');
  await expect(card.locator('.home-product-image')).toHaveCSS('overflow','hidden');
  expect(await card.boundingBox()).toEqual(bounds);
});

test('partner enlargement is not constrained to the carousel thumbnail height',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/cn/#partners');
  const button=page.locator('.partner-carousel__track>div').first().locator('.home-gallery__image');
  const src=await button.locator('img').getAttribute('src');
  await button.click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('img')).toHaveAttribute('src',src!);
  expect((await dialog.locator('img').boundingBox())!.height).toBeGreaterThan(300);
  await expect(dialog.locator('h2')).toHaveCSS('font-size','16px');
  await dialog.getByRole('button',{name:'关闭图片'}).click();
  await expect(button).toBeFocused();
  expect(await page.evaluate(()=>document.body.style.overflow)).toBe('');
});

test('phone gallery hides mouse-only overlays but still permits image preview',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/cn/');
  const button=page.locator('.partner-carousel__track>div').first().locator('.home-gallery__image');
  await button.scrollIntoViewIfNeeded();
  await button.hover();
  await expect(button.locator('.home-gallery__icon')).toHaveCSS('display','none');
  await button.click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('reduced motion retains immediate keyboard hover feedback without animated transitions',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/en/');
  const button=page.locator('.partner-carousel__track>div').first().locator('.home-gallery__image');
  await button.focus();
  await expect(button.locator('.home-gallery__icon')).toHaveCSS('opacity','1');
  await expect(button.locator('.home-gallery__icon')).toHaveCSS('transition-duration','0s');
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
});

for(const width of [1440,390]) test(`${width}: keyboard traversal cannot independently scroll offscreen partner logos`,async({page})=>{
  await page.setViewportSize({width,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/en/#partners');
  const carousel=page.locator('.partner-carousel');
  const first=carousel.locator('.partner-carousel__track>div').first().locator('button');
  await first.focus();
  const bounds=await first.boundingBox();
  // Five desktop logos or the centered phone logo, then the previous control.
  for(let i=0;i<(width===390?1:5);i++) await page.keyboard.press('Tab');
  await expect(carousel.getByRole('button',{name:'Previous partners',exact:true})).toBeFocused();
  expect(await carousel.locator('.partner-carousel__viewport').evaluate(el=>el.scrollLeft)).toBe(0);
  expect(await first.boundingBox()).toEqual(bounds);
});

test('opening a logo during carousel travel keeps that selected image when the loop commits',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/en/#partners');
  const carousel=page.locator('.partner-carousel');
  const first=carousel.locator('.partner-carousel__track>div').first().locator('img');
  const original=await first.getAttribute('src');
  await carousel.getByRole('button',{name:'Next partners',exact:true}).click();
  await expect(carousel).toHaveClass(/partner-carousel--moving/);
  const button=carousel.locator('.partner-carousel__track>div').nth(1).locator('.home-gallery__image');
  const selected=await button.locator('img').getAttribute('src');
  // The user may click a moving visible logo; do not wait for CSS to settle.
  await button.click({force:true});
  const dialog=page.getByRole('dialog');
  await expect(dialog.locator('img')).toHaveAttribute('src',selected!);
  await expect(first).not.toHaveAttribute('src',original!);
  await expect(dialog.locator('img')).toHaveAttribute('src',selected!);
});

test('logo hover passes through intermediate opacity and inset instead of switching instantly',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.goto('/en/#partners');
  const button=page.locator('.partner-carousel__track>div').first().locator('.home-gallery__image');
  await button.hover();
  await button.evaluate(el=>{
    for(const animation of el.getAnimations({subtree:true})) {
      animation.pause(); animation.currentTime=150;
    }
  });
  const opacity=await button.locator('.home-gallery__icon').evaluate(el=>Number(getComputedStyle(el).opacity));
  const left=await button.locator('.home-gallery__frame').evaluate(el=>parseFloat(getComputedStyle(el).left));
  expect(opacity).toBeGreaterThan(0); expect(opacity).toBeLessThan(1);
  expect(left).toBeGreaterThan(-10); expect(left).toBeLessThan(10);
  await button.evaluate(el=>{for(const animation of el.getAnimations({subtree:true})) animation.finish();});
  await expect(button.locator('.home-gallery__icon')).toHaveCSS('opacity','1');
  await expect(button.locator('.home-gallery__frame')).toHaveCSS('left','10px');
});
