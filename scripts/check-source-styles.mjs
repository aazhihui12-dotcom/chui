import { readFile, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

// Browser verification against independently captured source metrics, not CSS text.
const pages=JSON.parse(await readFile("docs/source-styles/mapping.json","utf8"));
const browser=await chromium.launch({channel:"chrome"});
const results=[];let next=0;
try {
  await Promise.all([0,1,2,3].map(async()=>{
    const page=await browser.newPage({reducedMotion:"reduce"});
    while(next<pages.length){
      const entry=pages[next++];await page.setViewportSize({width:entry.width,height:1200});
      const response=await page.goto(`http://127.0.0.1:3001${entry.route}/`);
      await page.evaluate(()=>document.fonts.ready);
      const result=await page.evaluate(entry=>{
        const failures=[];let compared=0,hidden=0;
        for(const item of [...entry.matched,...entry.buttons]){
          const element=document.querySelector(item.selector);
          if(!element){failures.push({text:item.text,error:"Missing mapped element"});continue;}
          if(!element.getClientRects().length){hidden++;continue;}
          const style=getComputedStyle(element);
          for(const [key,want] of Object.entries(item.expected)){
            if(!want||want==="100%")continue;
            const actual=style[key];compared++;
            const numeric=/^-?[\d.]+px$/.test(want)&&/^-?[\d.]+px$/.test(actual);
            if(numeric?Math.abs(parseFloat(actual)-parseFloat(want))>.1:actual!==want)failures.push({text:item.text,key,expected:want,actual});
          }
        }
        return {compared,hidden,failures,overflow:document.documentElement.scrollWidth>innerWidth};
      },entry);
      results.push({route:entry.route,width:entry.width,status:response.status(),...result});
    }
    await page.close();
  }));
}finally{await browser.close();}
results.sort((a,b)=>a.route.localeCompare(b.route)||b.width-a.width);
await writeFile("docs/source-styles/verification.json",JSON.stringify(results,null,2)+"\n");
const failed=results.filter(r=>r.status!==200||r.failures.length||r.overflow);
console.log(JSON.stringify({pages:results.length,properties:results.reduce((n,r)=>n+r.compared,0),failed:failed.length,examples:failed.slice(0,8)},null,2));
if(failed.length)process.exitCode=1;
