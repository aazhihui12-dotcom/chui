import { chromium } from "playwright";
import { mkdir, readFile, writeFile } from "node:fs/promises";

// Read-only source inspection. Never submit forms or activate contact actions.
const source = JSON.parse(await readFile("docs/page-correspondence/report.json", "utf8")).pages;
const priority = ["/en", "/cn", "/en/ProductIndex", "/cn/ProductIndex", "/en/Contact_Us", "/cn/Contact_Us", "/en/ProductDetail/11906944.html", "/cn/ProductDetail/11898269.html"];
const routes = source.map(p => p.route).sort((a,b) => (priority.indexOf(a) < 0 ? 99 : priority.indexOf(a)) - (priority.indexOf(b) < 0 ? 99 : priority.indexOf(b)));
const dir = "docs/source-styles";
await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });
let next = 0;
const jobs = routes.flatMap(route => [1440,390].map(width => ({route,width})));
try {
  await Promise.all([0,1,2,3].map(async () => {
    const context = await browser.newContext({userAgent:"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/145.0.0.0 Safari/537.36", reducedMotion: "reduce"});
    await context.route("**/*", route => ["image","media"].includes(route.request().resourceType()) ? route.abort() : route.continue());
    while(next < jobs.length) {
      const {route,width} = jobs[next++];
      const filename = `${dir}/${route.slice(1).replaceAll("/","_")}-${width}.json`;
      if (!(process.argv.includes("--refresh-general") && !/\/(ProductDetail|NewsDetail)\//.test(route)) && !(process.argv.includes("--refresh-news") && /\/(Blog|NewsList|FAQ)/.test(route)) && await readFile(filename,"utf8").then(JSON.parse).then(r => !r.error).catch(() => false)) continue;
      const page = await context.newPage();
      await page.setViewportSize({width,height:1200});
      const record = {route,width,sourceUrl:`https://www.lbhappliances.com${route}`,capturedAt:new Date().toISOString()};
      try {
        const response=await page.goto(record.sourceUrl,{waitUntil:"domcontentloaded",timeout:45000});
        record.status=response.status();
        await page.evaluate(() => document.fonts.ready);
        if (/\/(Blog|NewsList|FAQ)/.test(route)) await page.waitForLoadState("networkidle",{timeout:15000}).catch(()=>{});
        if (route.endsWith("/Contact_Us")) await page.locator(".customFormSubmit").waitFor({ state: "attached", timeout: 15000 });
        if (/HeadlessChrome blocked|Access Denied/.test(await page.locator("body").innerText())) throw Error("Source denied capture");
        Object.assign(record, await page.evaluate(() => {
          const keys=["fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing","textTransform","color"];
          const boxKeys=[...keys,"backgroundColor","borderTopColor","borderTopWidth","borderTopStyle","borderRadius","paddingTop","paddingRight","paddingBottom","paddingLeft","width","height","boxShadow","display","gap"];
          const style=(element,box=false)=>Object.fromEntries((box?boxKeys:keys).map(key=>[key,getComputedStyle(element)[key]]));
          const clean=t=>(t||"").replace(/\s+/g," ").trim();
          // Scroll-reveal modules use visibility:hidden until observed, but their
          // computed typography is real; display:none responsive duplicates have no rects.
          const visible=e=>!!e.getClientRects().length&&!e.closest('[aria-hidden="true"],script,style,noscript,svg');
          const text=[];
          const walk=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);
          while(walk.nextNode()) {
            const n=walk.currentNode, e=n.parentElement, value=clean(n.textContent);
            if(!value||!visible(e))continue;
            const range=document.createRange(); range.selectNodeContents(n);
            const rect=range.getBoundingClientRect(); if(!rect.width||!rect.height)continue;
            text.push({text:value,tag:e.tagName,cls:typeof e.className==="string"?e.className:"",module:e.closest("[id^=module]")?.id,main:!!e.closest("#BodyMain1Zone"),...style(e)});
          }
          const candidates=[...document.querySelectorAll(".moduleButton,.btn,.btn-inquiry,button,input[type=submit],.submit,.submit-btn,.customFormSubmit,.product-inquiry,.pro-inquiry,[class*=inquiry-btn]")].filter(visible);
          const buttons=candidates.map((e,index)=>{
            e.setAttribute("data-style-capture",String(index));
            const box=e.querySelector(".buttonbox")||e;
            return {text:clean(e.textContent||e.value),cls:e.className,html:e.outerHTML.slice(0,2400),box:style(box,true),label:style(e.querySelector(".ButtonText")||e),icon:e.querySelector(".radius")?style(e.querySelector(".radius"),true):null};
          });
          return {body:style(document.body),text,buttons,fonts:[...document.fonts].map(f=>({family:f.family,weight:f.weight,status:f.status}))};
        }));
        // One hovered example per visual button variant; avoid repeated identical CTAs.
        const variants=new Set();
        for(let index=0;index<record.buttons.length;index++) {
          const button=record.buttons[index], key=JSON.stringify([button.box,button.label,button.icon]);
          if(variants.has(key))continue;variants.add(key);
          const locator=page.locator(`[data-style-capture="${index}"]`);
          try {await locator.hover({timeout:1500});await page.waitForTimeout(250);button.hover=await locator.evaluate(e=>{
            const keys=["backgroundColor","color","borderTopColor","borderTopWidth","borderRadius","boxShadow","transform"];
            const s=n=>n?Object.fromEntries(keys.map(k=>[k,getComputedStyle(n)[k]])):null;
            return {box:s(e.querySelector(".buttonbox")||e),label:s(e.querySelector(".ButtonText")||e),icon:s(e.querySelector(".radius"))};
          });}catch {button.hoverUnavailable=true;}
        }
      } catch(error) {record.error=String(error);}
      await writeFile(filename,JSON.stringify(record,null,2)+"\n");
      console.log(`${next}/${jobs.length} ${route} ${width} ${record.error||"OK"}`);
      await page.close();
    }
    await context.close();
  }));
} finally {await browser.close();}
