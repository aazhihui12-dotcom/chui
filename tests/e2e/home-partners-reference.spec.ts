import {expect,test} from '@playwright/test';

// Catch warm/grey testimonial cards, mismatched columns, clipped logos/copy,
// misaligned authors and loss of the existing carousel controls.
for(const locale of ['cn','en']) for(const width of [1440,1024,390]) {
  test(`${locale} ${width}: partner logos and white quote cards follow the supplied reference`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`/${locale}/`);
    const section=page.locator('.home-partners');
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveCSS('background-color','rgb(248, 249, 251)');
    await expect(section.locator('h2')).toHaveCSS('text-align','center');
    const carousel=section.locator('.partner-carousel');
    const viewport=await carousel.locator('.partner-carousel__viewport').boundingBox();
    const cards=section.locator('.testimonials figure');
    await expect(cards).toHaveCount(3);
    const boxes=[];
    const authors=[];
    for(const card of await cards.all()) {
      await expect(card).toHaveCSS('background-color','rgb(255, 255, 255)');
      await expect(card.locator('blockquote')).toHaveCSS('text-align','left');
      await expect.poll(()=>card.locator('img').evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
      const box=await card.boundingBox();
      const logo=await card.locator('img').boundingBox();
      const quote=await card.locator('blockquote').boundingBox();
      const author=await card.locator('figcaption').boundingBox();
      expect(logo!.width/logo!.height).toBeCloseTo(16/9,1);
      expect(quote!.y).toBeGreaterThanOrEqual(logo!.y+logo!.height);
      expect(author!.y).toBeGreaterThanOrEqual(quote!.y+quote!.height);
      expect(author!.y+author!.height).toBeLessThanOrEqual(box!.y+box!.height);
      boxes.push(box!); authors.push(author!);
    }
    if(width>=1024) {
      await expect(section.locator('h2')).toHaveCSS('font-size','40px');
      for(const box of boxes) expect(box.y).toBeCloseTo(boxes[0].y,0);
      for(const author of authors) expect(author.y).toBeCloseTo(authors[0].y,0);
      for(const logo of (await carousel.locator('.partner-carousel__track>div').all()).slice(0,5)) {
        const box=await logo.boundingBox();
        expect(box!.width).toBeCloseTo(viewport!.width/5,0);
        expect(box!.x+box!.width).toBeLessThanOrEqual(viewport!.x+viewport!.width+1);
      }
    } else {
      for(let index=1;index<boxes.length;index++) expect(boxes[index].y).toBeGreaterThan(boxes[index-1].y+boxes[index-1].height);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await section.screenshot({path:`test-results/partners-${locale}-${width}.png`,animations:'disabled'});
    const first=await carousel.locator('img').first().getAttribute('src');
    await carousel.getByRole('button',{name:locale==='cn'?'下一组合作伙伴':'Next partners',exact:true}).click();
    await expect(carousel.locator('img').first()).not.toHaveAttribute('src',first!);
    await carousel.getByRole('button',{name:locale==='cn'?'上一组合作伙伴':'Previous partners',exact:true}).click();
    await expect(carousel.locator('img').first()).toHaveAttribute('src',first!);
  });
}

test('partner autoplay and keyboard-accessible controls survive the new presentation',async({page})=>{
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.goto('/en/');
  const carousel=page.locator('.home-partners .partner-carousel');
  const first=await carousel.locator('img').first().getAttribute('src');
  await expect(carousel.locator('img').first()).not.toHaveAttribute('src',first!,{timeout:6500});
  await carousel.getByRole('button',{name:'Previous partners',exact:true}).focus();
  await expect(carousel.locator('.partner-carousel__controls')).toHaveCSS('opacity','1');
  await expect(carousel.getByRole('button',{name:'Previous partners',exact:true})).toBeFocused();
});
