import { readFile, writeFile, mkdir } from "node:fs/promises";
import { JSDOM } from "jsdom";
import { themeColor } from "./apower-colors.mjs";

// Match rendered text to independently captured source text. Source typography is
// scoped to the active route, so Next's retained styles cannot leak on navigation.
const routes = JSON.parse(await readFile("docs/page-correspondence/report.json", "utf8")).pages.map(p=>p.route);
const fontKeys = ["fontFamily","fontSize","fontWeight","fontStyle","lineHeight","letterSpacing","textTransform","color"];
const normal = t=>(t||"").normalize("NFKC").replace(/[\s\p{P}\p{S}]/gu,"").toLowerCase();
const cssKey = key=>key.replace(/[A-Z]/g,s=>`-${s.toLowerCase()}`);
const decl = (record,keys,light=false)=>keys.filter(k=>record?.[k]!==undefined).map(k=>`${cssKey(k)}:${themeColor(cssKey(k),record[k],light)} !important`).join(";");
const report=[];
await mkdir("public/source-styles",{recursive:true});await mkdir("out/source-styles",{recursive:true});
const captureCache = new Map();
const readCapture=async(route,width)=>{
  const key=`${route}-${width}`;
  if(!captureCache.has(key)) captureCache.set(key, await readFile(`docs/source-styles/${route.slice(1).replaceAll("/","_")}-${width}.json`,"utf8").then(JSON.parse).then(c=>{
    for(const button of c.buttons||[]) if(!button.text&&button.html) button.text=JSDOM.fragment(button.html).textContent.replace(/\s+/g," ").trim();
    return c;
  }).catch(()=>null));
  return captureCache.get(key);
};
const aliases = {
  "立即询价":["立即报价","取得快速报价"],"咨询家电专家":["与家电专家交流"],"联系我们":["立刻咨询"],
  "Get a Quote Now":["Inquiry"],"立即询盘":["立即询价"],"索取完整产品目录":["获取产品目录"],
};
for (const route of routes) {
  const dom=new JSDOM(await readFile(`out${route}/index.html`,"utf8"));
  const doc=dom.window.document, main=doc.querySelector("#main-content");
  const prefix=`:root:has([data-source-page="${route}"]) #main-content`;
  const selector=e=>{
    const parts=[];while(e&&e!==main){const tag=e.tagName.toLowerCase(), siblings=[...e.parentElement.children].filter(n=>n.tagName===e.tagName);parts.unshift(`${tag}:nth-of-type(${siblings.indexOf(e)+1})`);e=e.parentElement;}
    return `${prefix}${parts.length?" > "+parts.join(" > "):""}`;
  };
  const sheets=[];
  for(const width of [1440,390]) {
    const capture=await readCapture(route,width);
    if(!capture||capture.error)throw new Error(`Missing verified source styles: ${route} at ${width}px`);
    const texts=capture.text.filter(t=>t.main && !/iconfont|digital-num|digital-unit/.test(t.cls));
    const reference=new Map();for(const t of texts){const k=normal(t.text);if(k&&!reference.has(k))reference.set(k,t);}
    const rules=[], matched=[], unmatched=[];
    for(const element of main.querySelectorAll("h1,h2,h3,h4,p,li,dt,dd,blockquote,figcaption,span,a,button,time,label,th,td,strong")) {
      if(element.closest(".sr-only,.source-button__arrow,.lbh-button,.product-breadcrumb,.product-filter-disclosure,svg,[aria-hidden=true]"))continue;
      const own=[...element.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join("").trim();
      const value=own||element.textContent.trim(),key=normal(value);
      if(!key||key.length<2||!own&&element.querySelector("h1,h2,h3,p,a,button,li,dt,dd"))continue;
      let target=reference.get(key);
      if(element.closest(".article-card")) {
        if(element.matches("h2,h2 > a"))target=texts.find(t=>/news-title|laout-110-title/.test(t.cls))||target;
        else if(element.matches("p"))target=texts.find(t=>/news-desc/.test(t.cls)||t.text==="内容介绍")||target;
        else if(element.matches("time"))target=texts.find(t=>/news-time-year/.test(t.cls)||/^\d{4}-\d{2}-\d{2}$/.test(t.text))||target;
      }
      if(!target&&route.endsWith("/Blog")&&element.tagName==="H1")target=reference.get(normal("博客"));
      if(route.endsWith("/FAQ")) {
        if(element.tagName==="H1")target=texts.find(t=>/^(FQA|FAQ|常问问题)$/.test(t.text))||target;
        else if(element.tagName==="BUTTON"&&element.closest(".faq-list"))target=texts.find(t=>/news-title-txt/.test(t.cls))||target;
        else if(element.tagName==="P"&&element.closest(".faq-list"))target=texts.find(t=>/news-desc-txt/.test(t.cls))||target;
      }
      if(element.closest(".product-specifications,.product-parameter-list") && /^(TH|TD|DT|DD)$/.test(element.tagName)) {
        const row=normal(element.closest("tr,dl > div")?.textContent);
        target=texts.find(t=>normal(t.text)===row)||texts.find(t=>t.tag!=="H1" && normal(t.text).includes(key));
      }
      if(!target&&key.length>12) target=texts.filter(t=>normal(t.text).length>12&&(normal(t.text).includes(key)||key.includes(normal(t.text)))).sort((a,b)=>normal(b.text).length-normal(a.text).length)[0];
      // Some source headings are split into several spans. Match an actual
      // constituent only within heading-sized source text, not body paragraphs.
      if(!target&&/^H[1-4]$/.test(element.tagName))target=texts.filter(t=>normal(t.text).length>2&&parseFloat(t.fontSize)>=20&&key.includes(normal(t.text))).sort((a,b)=>normal(b.text).length-normal(a.text).length)[0];
      if(!target){if(key.length>8)unmatched.push({text:value.slice(0,160),selector:selector(element)});continue;}
      // Do not fix line-height zero from source counters onto text containers.
      const metrics={...target};if(parseFloat(metrics.lineHeight)===0)delete metrics.lineHeight;
      // Active and hovered states must remain interactive, not frozen to the
      // state visible during the source capture.
      if(element.closest(".product-tabs__list,.product-category-nav"))delete metrics.color;
      const dynamicCard=element.matches("h2,h3")&&element.closest(".product-card,.home-featured-products a");
      const lightPhoto=!!element.closest(".home-hero,.product-category-banner") || element.matches(".home-sustainability > .home-section > h2");
      rules.push(`${selector(element)}{${decl(metrics,dynamicCard?fontKeys.filter(k=>k!=="color"):fontKeys,lightPhoto)}${dynamicCard?`;--source-rest-color:${themeColor('color',target.color)}`:""}}`);
      matched.push({selector:selector(element),text:value,sourceText:target.text,expected:Object.fromEntries(fontKeys.map(k=>[k,metrics[k]]))});
    }
    const home=await readCapture(route.startsWith("/cn")?"/cn":"/en",width);
    const ownButtons=capture.buttons.filter(b=>b.text), fallbackButtons=home?.buttons||[];
    const buttons=[];
    for(const element of main.querySelectorAll(".lbh-button")) {
      const label=element.querySelector(".source-button__label")?.textContent||element.textContent;
      const names=[label,...(aliases[label]||[])].map(normal);
      let target=ownButtons.find(b=>names.includes(normal(b.text)));
      if(element.classList.contains("inquiry-submit")) {
        target=ownButtons.find(b=>b.cls.includes("customFormSubmit"));
        if(!target)continue;
      }
      if(!target&&element.classList.contains("product-inquiry"))target=ownButtons.find(b=>/enquiry/.test(b.cls));
      target ||= fallbackButtons.find(b=>names.includes(normal(b.text)));
      if(!target)target=ownButtons.find(b=>b.cls.includes("moduleButton"))||fallbackButtons.find(b=>b.cls.includes("moduleButton"));
      if(!target)continue;
      const font={...target.label}, box={...target.box};
      // Preserve narrow screens: source sizes are capped by the available column.
      if(element.classList.contains("product-inquiry")&&width===390)box.width="100%";
      if(element.classList.contains("inquiry-submit"))box.width="100%";
      const keyList=["backgroundColor","borderRadius","borderTopWidth","borderTopStyle","borderTopColor","height","width","boxShadow"];
      rules.push(`${selector(element)}{${decl({...box,...font},[...fontKeys,...keyList])};max-width:100% !important}`);
      const hover=target.hover?.box||target.box;
      rules.push(`${selector(element)}:hover{${decl(hover,["backgroundColor","boxShadow"])};color:${themeColor('color',target.hover?.label?.color||target.label.color)} !important}`);
      buttons.push({selector:selector(element),text:label,sourceText:target.text,expected:{...Object.fromEntries(fontKeys.map(k=>[k,font[k]])),...Object.fromEntries(keyList.map(k=>[k,box[k]]))}});
    }
    sheets.push(`@media (${width===1440?"min-width:768px":"max-width:767px"}){\n${rules.join("\n")}\n}`);
    report.push({route,width,matched,unmatched,buttons});
  }
  const css=`/* Generated from captured source typography; run build-source-styles.mjs after export. */\n${sheets.join("\n")}\n`;
  const name=route.slice(1).replaceAll("/","_")+".css";
  await writeFile(`public/source-styles/${name}`,css);await writeFile(`out/source-styles/${name}`,css);dom.window.close();
}
await writeFile("docs/source-styles/mapping.json",JSON.stringify(report,null,2)+"\n");
console.log(`Source styles: ${routes.length} pages; ${report.reduce((n,r)=>n+(r.matched?.length||0),0)} text matches; ${report.reduce((n,r)=>n+(r.buttons?.length||0),0)} button matches; ${report.filter(r=>r.error).length} pending captures.`);
