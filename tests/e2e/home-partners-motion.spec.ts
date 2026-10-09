import {expect,test,type Locator} from '@playwright/test';

// A direct DOM reorder would pass a final-slide assertion but lose every frame
// of the source transition. Check real intermediate geometry and the seam.
async function seek(carousel:Locator,time:number) {
  await carousel.evaluate((element,time)=>{
    for(const animation of element.getAnimations({subtree:true})) {
      if((animation.effect as KeyframeEffect)?.getKeyframes().some(frame=>'transform' in frame)) {
        animation.pause(); animation.currentTime=time;
      }
    }
  },time);
}
async function finish(carousel:Locator) {
  await carousel.evaluate(element=>{
    for(const animation of element.getAnimations({subtree:true})) {
      if((animation.effect as KeyframeEffect)?.getKeyframes().some(frame=>'transform' in frame)) animation.finish();
    }
  });
}
for(const locale of ['cn','en']) test(`${locale}: desktop logos travel for two seconds before committing a seamless next/previous loop`,async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto(`/${locale}/#partners`);
  const carousel=page.locator('.home-partners .partner-carousel');
  await carousel.hover();
  const track=carousel.locator('.partner-carousel__track');
  const first=track.locator('img').first();
  const source=await first.getAttribute('src');
  const before=(await first.boundingBox())!;
  const cell=(await track.locator(':scope>div').first().boundingBox())!;
  await carousel.getByRole('button',{name:locale==='cn'?'下一组合作伙伴':'Next partners',exact:true}).click();
  await expect.poll(()=>track.evaluate(el=>el.getAnimations().map(a=>a.effect!.getTiming().duration))).toContain(2000);
  await seek(carousel,1000);
  await expect(first).toHaveAttribute('src',source!);
  const during=(await first.boundingBox())!;
  expect(during.x).toBeLessThan(before.x-10);
  expect(during.x).toBeGreaterThan(before.x-cell.width+1);
  await finish(carousel);
  await expect(first).not.toHaveAttribute('src',source!);
  expect((await first.boundingBox())!.x).toBeCloseTo(before.x,0);
  await carousel.getByRole('button',{name:locale==='cn'?'上一组合作伙伴':'Previous partners',exact:true}).click();
  await expect.poll(()=>track.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await seek(carousel,1000);
  // The original first logo enters from the previous-side buffer, not a blank.
  const returning=track.locator(`img[src="${source}"]`).last();
  expect((await returning.boundingBox())!.x).toBeGreaterThan(before.x-cell.width);
  expect((await returning.boundingBox())!.x).toBeLessThan(before.x);
  await finish(carousel);
  await expect(first).toHaveAttribute('src',source!);
  expect((await first.boundingBox())!.x).toBeCloseTo(before.x,0);
});

test.describe('phone coverflow',()=>{
  test.use({hasTouch:true});
  for(const locale of ['cn','en']) test(`${locale}: centered logos change depth over a one-second transition`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto(`/${locale}/#partners`);
    const carousel=page.locator('.home-partners .partner-carousel');
    const viewport=carousel.locator('.partner-carousel__viewport');
    const track=carousel.locator('.partner-carousel__track');
    const first=track.locator(':scope>div').first();
    const source=await first.locator('img').getAttribute('src');
    const vp=(await viewport.boundingBox())!, initial=(await first.boundingBox())!;
    expect(initial.x+initial.width/2).toBeCloseTo(vp.x+vp.width/2,0);
    const neighbor=track.locator(':scope>div').nth(1);
    expect(await neighbor.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m43)).toBeLessThan(-190);
    await carousel.getByRole('button',{name:locale==='cn'?'下一组合作伙伴':'Next partners',exact:true}).click();
    await expect.poll(()=>track.evaluate(el=>el.getAnimations().map(a=>a.effect!.getTiming().duration))).toContain(1000);
    await seek(carousel,500);
    const depth=await neighbor.evaluate(el=>new DOMMatrix(getComputedStyle(el).transform).m43);
    expect(depth).toBeGreaterThan(-190); expect(depth).toBeLessThan(-1);
    await finish(carousel);
    await expect(first.locator('img')).not.toHaveAttribute('src',source!);
    const settled=(await first.boundingBox())!;
    expect(settled.x+settled.width/2).toBeCloseTo(vp.x+vp.width/2,0);
    await carousel.screenshot({path:`test-results/partners-coverflow-${locale}-390.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  });

  test('a real touch drag follows the finger, then settles on the next logo without changing pages',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/cn/#partners');
    const carousel=page.locator('.home-partners .partner-carousel');
    // The native touch API doesn't auto-scroll the way locator.click does.
    await carousel.scrollIntoViewIfNeeded();
    const track=carousel.locator('.partner-carousel__track');
    const first=track.locator('img').first();
    const source=await first.getAttribute('src');
    const rect=(await carousel.locator('.partner-carousel__viewport').boundingBox())!;
    const before=(await first.boundingBox())!;
    const session=await page.context().newCDPSession(page);
    const x=rect.x+rect.width*.7,y=rect.y+rect.height*.45;
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-80,y}]});
    await expect.poll(async()=> (await first.boundingBox())!.x).toBeLessThan(before.x-10);
    await expect(first).toHaveAttribute('src',source!);
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await session.detach();
    await expect(first).not.toHaveAttribute('src',source!);
    await expect(page).toHaveURL(/\/cn\/#partners$/);
    await expect(carousel.getByRole('button',{name:'继续轮播',exact:true})).toBeVisible();
    await carousel.getByRole('button',{name:'继续轮播',exact:true}).focus();
    await page.keyboard.press('Enter');
    await expect(carousel.getByRole('button',{name:'暂停轮播',exact:true})).toBeVisible();
  });

  test('the back-layer logo survives the loop commit instead of disappearing at the left edge',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/cn/#partners');
    const carousel=page.locator('.home-partners .partner-carousel');
    const track=carousel.locator('.partner-carousel__track');
    const previous=await track.locator('.partner-carousel__previous img').last().getAttribute('src');
    await carousel.getByRole('button',{name:'下一组合作伙伴',exact:true}).click();
    await expect.poll(()=>track.evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
    await seek(carousel,990);
    const oldBuffer=track.locator(`.partner-carousel__previous img[src="${previous}"]`);
    const during=(await oldBuffer.boundingBox())!;
    await finish(carousel);
    await expect(oldBuffer).toHaveCount(1);
    const after=(await oldBuffer.boundingBox())!;
    expect(after.x).toBeCloseTo(during.x,0);
    expect(after.width).toBeCloseTo(during.width,0);
  });

  test('autoplay does not move a logo while a finger is held on it',async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.clock.install();
    await page.goto('/cn/#partners');
    const carousel=page.locator('.home-partners .partner-carousel');
    await carousel.scrollIntoViewIfNeeded();
    const rect=(await carousel.locator('.partner-carousel__viewport').boundingBox())!;
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:rect.x+rect.width*.5,y:rect.y+rect.height*.4}]});
    await page.clock.fastForward(4000);
    expect(await carousel.getAttribute('class')).not.toContain('partner-carousel--moving');
    await expect(carousel.getByRole('status')).toHaveText('1 / 7');
    await session.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
    await session.detach();
  });

  for(const ending of ['touchEnd','touchCancel']) test(`${ending}: a short or cancelled drag returns to the original centered logo`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.goto('/cn/#partners');
    const carousel=page.locator('.home-partners .partner-carousel');
    await carousel.scrollIntoViewIfNeeded();
    const first=carousel.locator('.partner-carousel__track img').first();
    const source=await first.getAttribute('src'), before=(await first.boundingBox())!;
    const vp=(await carousel.locator('.partner-carousel__viewport').boundingBox())!;
    const x=vp.x+vp.width*.55,y=vp.y+vp.height*.4;
    const session=await page.context().newCDPSession(page);
    await session.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});
    await session.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-30,y}]});
    await expect.poll(async()=> (await first.boundingBox())!.x).toBeLessThan(before.x-2);
    await session.send('Input.dispatchTouchEvent',{type:ending,touchPoints:[]});
    await session.detach();
    await expect(carousel).not.toHaveClass(/partner-carousel--moving/);
    await expect(first).toHaveAttribute('src',source!);
    expect((await first.boundingBox())!.x).toBeCloseTo(before.x,0);
    await carousel.getByRole('button',{name:'下一组合作伙伴',exact:true}).click();
    await expect(first).not.toHaveAttribute('src',source!);
  });
});

test('resizing during a slide settles to the phone center and leaves navigation unlocked',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/#partners');
  const carousel=page.locator('.home-partners .partner-carousel');
  const first=carousel.locator('.partner-carousel__track img').first();
  const source=await first.getAttribute('src');
  await carousel.getByRole('button',{name:'Next partners',exact:true}).click();
  await expect(carousel).toHaveClass(/partner-carousel--moving/);
  await page.setViewportSize({width:390,height:844});
  await expect(first).not.toHaveAttribute('src',source!);
  await expect(carousel).not.toHaveClass(/partner-carousel--moving/);
  const vp=(await carousel.locator('.partner-carousel__viewport').boundingBox())!, image=(await first.boundingBox())!;
  expect(image.x+image.width/2).toBeCloseTo(vp.x+vp.width/2,0);
  await carousel.getByRole('button',{name:'Previous partners',exact:true}).click();
  await expect(first).toHaveAttribute('src',source!);
});

test('changing reduced motion during travel settles the logo and stops subsequent autoplay',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/#partners');
  const carousel=page.locator('.home-partners .partner-carousel');
  await carousel.hover();
  const first=carousel.locator('.partner-carousel__track img').first();
  const source=await first.getAttribute('src');
  await carousel.getByRole('button',{name:'Next partners',exact:true}).click();
  await expect.poll(()=>carousel.locator('.partner-carousel__track').evaluate(el=>el.getAnimations().length)).toBeGreaterThan(0);
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(first).not.toHaveAttribute('src',source!);
  await expect.poll(()=>carousel.locator('.partner-carousel__track').evaluate(el=>el.getAnimations().length)).toBe(0);
  await expect(carousel.getByRole('button',{name:/Pause|Resume/})).toHaveCount(0);
});
