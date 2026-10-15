import { pages } from './pages';
import { text, splitCopy, artwork } from './apower';
import type { SitePage, ContentBlock, Locale } from './schema';

/** Keep the captured Chinese block positions; replace only the corresponding copy. */
export function apowerEditorial(page:SitePage):SitePage {
 const source=pages.find(p=>p.locale==='cn'&&p.legacyPath===page.legacyPath);
 if(!source) return page;
 const locale=page.locale,t=(id:number)=>text(id,locale);
 const result:SitePage={...page,images:source.images,blocks:source.blocks.map(b=>b.type==='rich-text'?{type:'rich-text',paragraphs:[]}:b),provenance:{...page.provenance,coverage:'full',translation:'authored'}};
 const h=(index:number,id:number,paragraphs:number[]=[])=>{result.blocks[index]={type:'rich-text',heading:t(id),paragraphs:paragraphs.map(t)};};
 const p=(index:number,...ids:number[])=>{result.blocks[index]={type:'rich-text',paragraphs:ids.map(t)};};
 const label=(index:number,cn:string,en:string)=>{result.blocks[index]={type:'rich-text',heading:locale==='cn'?cn:en,paragraphs:[]};};
 const pair=(a:number,b:number,id:number)=>{const s=splitCopy(id,locale);result.blocks[a]={type:'rich-text',heading:s.heading,paragraphs:[]};result.blocks[b]={type:'rich-text',paragraphs:[s.body]};};
 // All shared closing sections use the supplied mission and contact CTA.
 source.blocks.forEach((b,i)=>{
  if(b.type==='rich-text'&&b.paragraphs.some(s=>s.includes('XX'))) p(i,34);
  if(b.type==='rich-text'&&b.heading?.includes('让我们今天联系')) label(i,'让我们今天就取得联系，找到正确的解决方案！','Let’s connect today and find the right solution.');
  if(b.type==='cta') result.blocks[i]={...b,actions:b.actions.map(a=>({...a,label:locale==='cn'?'联系我们':'Contact Us',href:`/${locale}/Contact_Us`}))};
 });
 switch(page.legacyPath){
  case '/Exclusive_sale':
   {
    const introduction=t(87).match(/^(.+?[。.])\s*([\s\S]*)$/)!;
    h(2,86);result.blocks[3]={type:'rich-text',paragraphs:[introduction[1],introduction[2],t(88),t(89)]};
    h(5,90);p(6,91);[92,93,94].forEach((id,i)=>pair(7+i*2,8+i*2,id));result.blocks[13]={type:'media',image:artwork('exclusive-testing')};
   }break;
  case '/Contract_manufacturing_service':
   h(2,95,[96,97]);[99,100,101,102].forEach((id,i)=>p(4+i,id));h(8,103);p(9,104);
   [105,106,107,108,109,110,111,112].forEach((id,i)=>{if(i===1){const s=splitCopy(id,locale);result.blocks[14]={type:'rich-text',heading:s.heading,paragraphs:[s.body]};}else {const offset=i>=2?-1:0;pair(11+i*3+offset,12+i*3+offset,id);}});
   if(locale==='en')result.blocks[2]={type:'rich-text',heading:'You have a systematic Chinese production team at your disposal.',paragraphs:[t(96),t(97)]};
   h(33,113);p(34,114);[115,116,117,118].forEach((id,i)=>pair(36+i*3,37+i*3,id));break;
  case '/PinZhiGuanLi':
   h(2,119,[120,121,122]);h(3,123);p(4,124);[125,126,127].forEach((id,i)=>pair(5+i*2,6+i*2,id));h(11,128);p(12,129);h(13,130);[131,132,133,134].forEach((id,i)=>pair(15+i*3,16+i*3,id));h(26,135);p(27,136);break;
  case '/Design_and_Development':
   h(2,137,[138]);p(3,139,140);p(6,141);h(7,142);p(8,143);[144,145,146].forEach((id,i)=>p(9+i,id));h(13,147);
   [148,149,150].forEach((id,i)=>{
     const value=t(id).replace(/^\d+\.\s*/,''),split=value.match(/^(.+?[。.])\s*([\s\S]*)$/),start=14+i*6;
     const labels=locale==='cn'?[['咨询','工程及报价'],['估算与分析','模具制造'],['原型制作与审批','修改并完成']][i]:[['Consultation','Engineering & quotation'],['Estimation & analysis','Mold making'],['Prototyping & approval','Revision & finalization']][i];
     const body=split?.[2]||'',boundary=body.indexOf(labels[1]),first=body.slice(0,boundary).replace(new RegExp('^'+labels[0]+'[:：]\\s*'),''),second=body.slice(boundary).replace(new RegExp('^'+labels[1]+'[:：]\\s*'),'');
     result.blocks[start]={type:'rich-text',heading:split?.[1]||value,paragraphs:[]};
     result.blocks[start+1]={type:'rich-text',heading:labels[0],paragraphs:[first.trim()]};result.blocks[start+2]={type:'rich-text',heading:labels[1],paragraphs:[second.trim()]};
   });break;
  case '/Order_Management':
   h(2,151,[152]);result.blocks[3]={type:'media',image:artwork('order-status','APOWER')};result.blocks[4]={type:'media',image:artwork('order-phone','APOWER')};h(5,153);[154,155,156].forEach((id,i)=>p(6+i,id));break;
  case '/Product_manufacturing':
   h(2,157);p(3,158);[159,161,163,166].forEach((id,i)=>h(4+i,id));label(8,'测试与包装','Testing and Packaging');
   h(9,159);p(10,160);h(11,161);p(12,162);h(13,163);p(14,164,165);h(15,166);p(16,167);
   {const copy=splitCopy(168,locale);result.blocks[17]={type:'rich-text',heading:copy.heading,paragraphs:[copy.body]};}
   [['老化测试','Burn-in Testing'],['产品清洁','Product Cleaning'],['成品包装','Product Packaging'],['成品装箱','Carton Packing']].forEach(([cn,en],i)=>label(19+i*2,cn,en));break;
  case '/Product_Warranty_and_After-Sales_Service':
   {
    const warranty=t(170).match(/^(.+?[。.])\s*([\s\S]*)$/)!;
    result.blocks[2]={type:'rich-text',heading:t(169),paragraphs:[warranty[1],warranty[2]]};
    const support=splitCopy(171,locale),intro=support.body.match(/^(.+?[。.])\s*([\s\S]*)$/)!;
    result.blocks[5]={type:'rich-text',heading:support.heading,paragraphs:[intro[1]]};
    result.blocks[6]={type:'rich-text',paragraphs:['1.'+intro[2]]};
    result.blocks[8]={type:'rich-text',paragraphs:['2.'+t(172)]};
    result.blocks[9]={type:'rich-text',paragraphs:['3.'+t(173)]};
   }break;
  case '/Company_Introduction':
   h(2,174);result.blocks[3]={type:'media',image:artwork('company-billboard','APOWER TECH')};h(4,175);p(5,176);h(6,177);p(7,178);h(8,27);h(10,179);h(11,180);
   [181,182,183,184].forEach((id,i)=>pair(13+i*2,14+i*2,id));h(25,185);[186,187,188].forEach((id,i)=>pair(26+i*2,27+i*2,id));h(32,23);[24,25,26].forEach((id,i)=>{result.blocks[34+i*3]={type:'rich-text',paragraphs:[t(id).replace(/\s*[—–]+\s*(Jeff Deng|Warren Steve|María Emilia)$/,'')]};result.blocks[35+i*3]={type:'rich-text',paragraphs:['—— '+['Jeff Deng','Warren Steve','María Emilia'][i]]};});break;
  case '/Lead_the_team':
   h(3,189);p(4,190);result.blocks[5]={type:'stats',items:[{value:'100+',label:locale==='cn'?'主要员工':'Key Employees'}]};result.blocks[6]={type:'stats',items:[{value:'10+',label:locale==='cn'?'主要部门':'Core Departments'}]};break;
  case '/Factory_tour':
   result.blocks[2]={type:'rich-text',heading:locale==='cn'?'工厂参观':'Factory Tour',paragraphs:locale==='cn'?[
    '探索 APOWER TECH 的优质生产设施，了解我们如何以速度、品质和精度完成项目。',
    '工厂设有独立生产车间，配备先进设备与校准的检测工具，确保制造全过程的高标准。',
   ]:[
    'Explore the quality manufacturing facilities of APOWER TECH and see how we complete projects with speed, excellence, and precision.',
    'Our factory has independent production workshops equipped with the latest equipment and calibrated testing tools, ensuring the highest standards throughout the manufacturing process.',
   ]};label(3,'组装现场','Assembly Site');label(4,'电机工厂','Motor Factory');h(5,193,[195]);h(6,196);
   result.blocks[7]={type:'stats',items:[197,198,199,200].map(id=>{const m=t(id).match(/^([\d,+]+)\s*(.*)$/)!;return {value:m[1],label:m[2]};})};h(8,201);p(9,202);
   [['原材料储存','Raw Material Storage'],['模具铸造车间','Mold Workshop'],['注塑成型车间','Injection Molding'],['打磨车间','Polishing Workshop'],['装配车间','Assembly Workshop'],['包装车间','Packaging Workshop'],['质量检验车间','Quality Inspection'],['成品存储车间','Finished Goods Storage']].forEach(([cn,en],i)=>label(10+i*2,cn,en));
   label(26,'精益管理——基于 5S 原则','Lean Management — The 5S Principles');result.blocks[27]={type:'media',image:artwork('factory-5s',locale==='cn'?'APOWER 5S 精益管理':'APOWER 5S lean management')};break;
  case '/Milestone':
   result.blocks[16]={type:'timeline',items:Array.from({length:7},(_,i)=>{const s=t(203+i);const year=s.slice(0,4);const value=s.slice(4).replace(/^[\s—]+/,'');const m=value.match(/^(.+?)[：:]\s*([\s\S]*)$/)!;return {year,title:m[1],description:m[2]};})};break;
  case '/Certification_certificate':result.title=t(27);break;
  case '/Sustainable_Development':h(2,210);p(3,211,212);h(6,213);p(7,214);h(9,215);p(10,216);break;
  case '/Product_Laboratory':h(2,217,[218]);[219,220,221,222].forEach((id,i)=>p(3+i,id));h(8,223);pair(10,11,224);[['自研产品老化系统','In-House Burn-in System'],['电子元器件测试设备','Electronic Component Testing'],['振动跌落试验设备','Vibration and Drop Testing']].forEach(([cn,en],i)=>label(13+i*2,cn,en));break;
  default:return page;
 }
 return result;
}
