import {expect,test} from '@playwright/test';

// Catch missing imagery, copy/video overlap, CTA-before-video regressions and
// global player styling leaking into pages outside this requested module.
for(const locale of ['cn','en']) for(const width of [1440,1024,390]) {
  test(`${locale} ${width}: welcome follows the supplied photo-led reference`,async({page})=>{
    await page.setViewportSize({width,height:1000});
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`/${locale}/`);
    const section=page.locator('.home-welcome');
    await section.scrollIntoViewIfNeeded();
    const video=section.locator('.source-video');
    const photo=video.locator('img');
    await expect(photo).toBeVisible();
    await expect.poll(()=>photo.evaluate((el:HTMLImageElement)=>el.naturalWidth)).toBeGreaterThan(0);
    await expect(section).toHaveCSS('background-color','rgb(255, 255, 255)');
    await expect(section.locator('h2')).toHaveCSS('text-align','center');
    await expect(video).toHaveCSS('border-radius',width<768?'24px':'40px');
    const paragraph=await section.locator('p').last().boundingBox();
    const box=await video.boundingBox();
    const cover=await photo.boundingBox();
    const play=await video.locator('button').boundingBox();
    for(const bounds of [cover,play]) {
      expect(bounds!.x).toBeCloseTo(box!.x,0);
      expect(bounds!.y).toBeCloseTo(box!.y,0);
      expect(bounds!.width).toBeCloseTo(box!.width,0);
      expect(bounds!.height).toBeCloseTo(box!.height,0);
    }
    await expect(video).toHaveCSS('overflow','hidden');
    const cta=section.getByRole('link',{name:locale==='cn'?'联系我们':'Contact Us',exact:true});
    const button=await cta.boundingBox();
    expect(box!.y).toBeGreaterThan(paragraph!.y+paragraph!.height);
    expect(button!.y).toBeGreaterThan(box!.y+box!.height);
    expect(box!.width/box!.height).toBeCloseTo(980/549,2);
    expect(box!.x+box!.width/2).toBeCloseTo(width/2,0);
    expect(button!.x+button!.width/2).toBeCloseTo(width/2,0);
    await expect(cta).toHaveCSS('background-color','rgb(0, 0, 0)');
    if(width===1440) {
      await expect(section.locator('h2')).toHaveCSS('font-size','40px');
      expect(box!.width).toBe(980);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await section.screenshot({path:`test-results/welcome-${locale}-${width}.png`,animations:'disabled'});
    await page.route('https://www.youtube-nocookie.com/**',route=>route.abort());
    await section.getByRole('button',{name:locale==='cn'?'播放工厂概览视频':'Play factory overview video'}).click();
    await expect(video.locator('iframe')).toHaveAttribute('src','https://www.youtube-nocookie.com/embed/uGqOG4NfbZQ?autoplay=1');
    const iframe=await video.locator('iframe').boundingBox();
    expect(iframe!.width).toBeCloseTo(box!.width,0);
    expect(iframe!.height).toBeCloseTo(box!.height,0);
    await expect(section.getByRole('link',{name:locale==='cn'?'在 YouTube 打开视频':'Open video on YouTube'})).toBeVisible();
  });
}
