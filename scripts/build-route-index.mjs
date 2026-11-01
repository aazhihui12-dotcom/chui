// Generated metadata, not page bodies, crosses the language-switch client boundary.
import { readFile, writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

export function generatedArray(text,symbol){
  const declaration=text.indexOf(`export const ${symbol}:`);
  const marker=text.indexOf('= [',declaration);
  if(declaration<0||marker<0)throw new Error(`Expected generated literal ${symbol} array`);
  const start=marker+2;
  let depth=0,quoted=false,escaped=false;
  for(let i=start;i<text.length;i++){
    const char=text[i];
    if(quoted){
      if(escaped)escaped=false;
      else if(char==='\\')escaped=true;
      else if(char==='"')quoted=false;
    }else if(char==='"')quoted=true;
    else if(char==='[')depth++;
    else if(char===']'&&--depth===0)return JSON.parse(text.slice(start,i+1));
  }
  throw new Error(`Unterminated generated ${symbol} array`);
}

async function build(){
const root=new URL('../',import.meta.url);
const models=JSON.parse(await readFile(new URL('content/apower-models.json',root),'utf8'));
const initial=['/Product/garment-steamers.html',...models.map(model=>`/ProductDetail/${model}.html`)];
const paths={en:new Set(initial),cn:new Set(initial)};
for(const symbol of ['pages','products','articles']){
  const text=await readFile(new URL(`content/${symbol}.ts`,root),'utf8');
  // Parse JSON only. Never evaluate content or import its server-side graph.
  const records=generatedArray(text,symbol);
  for(const record of records){
    for(const page of record.locales?Object.values(record.locales):[record]){
      if(!paths[page.locale]||typeof page.legacyPath!=='string')throw new Error('Invalid localized page in route index');
      paths[page.locale].add(page.legacyPath);
    }
  }
}
const result=Object.fromEntries(Object.entries(paths).map(([locale,values])=>[locale,[...values].sort()]));
await writeFile(new URL('content/route-index.json',root),JSON.stringify(result,null,2)+'\n');
console.log(`Route index: ${result.en.length} English / ${result.cn.length} Chinese paths, no page content.`);
}
if(process.argv[1]&&pathToFileURL(resolve(process.argv[1])).href===import.meta.url)await build();
