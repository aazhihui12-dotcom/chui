import {expect,test} from '@playwright/test';

test('CN 390x900 does not download video when less than half the preview is visible',async({page})=>{
  await page.setViewportSize({width:390,height:900});
  await page.emulateMedia({reducedMotion:'no-preference'});
  const videoRequests:string[]=[];
  page.on('request',r=>{if(r.url().includes('home-manufacturing-preview.mp4'))videoRequests.push(r.url());});
  await page.goto('/cn/',{waitUntil:'networkidle'});
  const preview=page.locator('.home-manufacturing .video-preview');
  const box=(await preview.boundingBox())!;
  expect((900-box.y)/box.height).toBeLessThan(.5);
  expect(videoRequests).toEqual([]);
  await preview.scrollIntoViewIfNeeded();
  await expect(preview.locator('video')).toHaveJSProperty('paused',false);
});
