import { createServer } from 'node:http';
import { expect, test } from '@playwright/test';

const categoryPaths=['product-g1.webp','product-h1.webp','product-ar01.webp','ap-s1-color-3.webp'].map(name=>'/media/apower/v2/'+name);
const backgroundPaths=['/media/apower/v2/company-billboard.webp','/media/5310cd9c08714627280f68db4d03d84c30285090ee0faab7a2ac6b389c3fd17b.webp'];
const primedPaths=[...categoryPaths,...backgroundPaths];

test('new image URLs recover from old-site five-day cached 404s without clearing browser data',async({browser,request,baseURL})=>{
  let current=false;
  const currentImageRequests:string[]=[];
  // A real same-origin HTTP cache is essential: page.route() disables caching.
  const proxy=createServer(async(req,res)=>{
    const url=new URL(req.url!,'http://fixture.local');
    if(url.pathname==='/prime/'){
      res.writeHead(200,{'content-type':'text/html','cache-control':'no-store'});
      res.end(primedPaths.map(src=>`<img src="${src}" width="100" height="100">`).join(''));
      return;
    }
    const category=primedPaths.includes(url.pathname);
    if(category&&!current){
      // Measured from the original Cloudflare/Webflow site, 2026-11-02.
      res.writeHead(404,{'content-type':'text/html','cache-control':'public, max-age=432000'});
      res.end('Old site: Page not found');
      return;
    }
    if(category)currentImageRequests.push(req.url!);
    try{
      const response=await request.get(new URL(req.url!,baseURL).href);
      const body=await response.body();
      const headers:Record<string,string>={};
      for(const name of ['content-type','cache-control','etag','last-modified','vary'])if(response.headers()[name])headers[name]=response.headers()[name];
      res.writeHead(response.status(),headers);res.end(body);
    }catch{res.writeHead(502);res.end('Fixture upstream unavailable');}
  });
  await new Promise<void>(resolve=>proxy.listen(0,'127.0.0.1',resolve));
  const address=proxy.address();
  if(!address||typeof address==='string')throw new Error('Missing test server port');
  const origin=`http://127.0.0.1:${address.port}`;
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce',javaScriptEnabled:false});
  try{
    const primer=await context.newPage();
    await primer.goto(origin+'/prime/');
    const oldWidths=await primer.locator('img').evaluateAll(async imgs=>Promise.all(imgs.map(async img=>{try{await img.decode();}catch{}return img.naturalWidth;})));
    expect(oldWidths).toEqual([0,0,0,0,0,0]);
    await primer.close();
    current=true;
    const page=await context.newPage();
    await page.goto(origin+'/en/',{waitUntil:'domcontentloaded'});
    await page.locator('.home-products').scrollIntoViewIfNeeded();
    const images=await page.locator('.home-products img').evaluateAll(async imgs=>Promise.all(imgs.map(async img=>{try{await img.decode();}catch{}return {src:img.getAttribute('src')!,width:img.naturalWidth};})));
    expect(images.map(img=>img.width)).toEqual([1000,1000,1000,1000]);
    expect(images.map(img=>new URL(img.src,origin).pathname)).toEqual(categoryPaths);
    expect(currentImageRequests).toHaveLength(4);
    for(const url of currentImageRequests)expect(new URL(url,origin).searchParams.get('apower_v')).toBeTruthy();
    await page.goto(origin+'/en/Company_Introduction/',{waitUntil:'load'});
    for(const [index,selector] of ['.editorial-section--feature','.v3-company-values'].entries()){
      const section=page.locator(selector);
      await section.scrollIntoViewIfNeeded();
      const background=await section.evaluate(async element=>{
        const style=getComputedStyle(element);
        const match=style.backgroundImage.match(/url\((?:"([^"]*)"|'([^']*)'|([^)]*))\)/);
        const src=match?.[1]||match?.[2]||match?.[3]||'';
        const image=new Image();image.src=src;
        try{await image.decode();}catch{}
        return {src,width:image.naturalWidth,size:style.backgroundSize,position:style.backgroundPosition};
      });
      expect(background.width).toBeGreaterThan(0);
      const url=new URL(background.src,origin);
      expect(url.pathname).toBe(backgroundPaths[index]);
      expect(url.searchParams.get('apower_v')).toBeTruthy();
      expect(background.size).toBe('cover');
      expect(background.position).toBe('50% 50%');
    }
    expect(currentImageRequests).toHaveLength(6);
  }finally{
    await context.close();
    proxy.closeAllConnections();
    await new Promise<void>((resolve,reject)=>proxy.close(error=>error?reject(error):resolve()));
  }
});
