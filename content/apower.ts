import copy from './apower-copy.json';
import { apowerMedia } from './apower-media';
import type { Locale, ImageAsset, Category, Product, ProductPage, SitePage } from './schema';

/** Verbatim copy from the user's 2026 bilingual Word document, keyed by table index. */
export const text = (id: number, locale: Locale) => copy[id][locale];
export const artwork = (name: string, alt = ''): ImageAsset => {
 const src=apowerMedia[name];
 if(!src) throw new Error(`Unknown APOWER artwork: ${name}`);
 return {src,alt};
};
export const overviewVideo = 'uGqOG4NfbZQ';
export const factoryVideo = 'bx1R2NQPTxw';
export function apowerSeo(page:SitePage) {
 const descriptions:Record<string,number[]>={'/':[2,3],'/ProductIndex':[37,38],'/Exclusive_sale':[86,87],'/Contract_manufacturing_service':[95,96],'/PinZhiGuanLi':[119,120],'/Design_and_Development':[139],'/Order_Management':[151,152],'/Product_manufacturing':[157,158],'/Product_Warranty_and_After-Sales_Service':[169,170],'/Company_Introduction':[176],'/Lead_the_team':[189,190],'/Factory_tour':[194,195],'/Milestone':[203],'/Certification_certificate':[27,81],'/Sustainable_Development':[210,211],'/Product_Laboratory':[217,218],'/Contact_Us':[228,229],'/Contact':[228,229],'/FAQ':[234]};
 const rename=(s:string)=>s.replace(/LBH Appliances|LBH APPLIANCES|LBH电器|LHB|LBH/g,'APOWER TECH');
 return {title:page.kind==='home'?`${text(2,page.locale)} | APOWER TECH`:rename(page.seo.title),description:descriptions[page.legacyPath]?.map(id=>text(id,page.locale)).join(' ')||rename(page.seo.description)};
}
export function splitCopy(id: number, locale: Locale) {
 const value=text(id,locale).replace(/^(?:\d+\.\s*|步骤\s*\d+：|Step \d+: )/, '');
 const match=value.match(/^(.+?)(?:：|: | — |——)([\s\S]+)$/);
 return match?{heading:match[1],body:match[2]}:{heading:value,body:''};
}
export const apowerCategories: Category[] = [
 {id:'682975',legacyPath:'/Product/682975.html',title:{cn:'吹风机系列',en:'Hair Dryers'},productIds:['AP-G1','AP-G3','AP-G11'],image:artwork('range-dryers')},
 {id:'682973',legacyPath:'/Product/682973.html',title:{cn:'直发器系列',en:'Hair Straighteners'},productIds:['AP-H1'],image:artwork('range-straighteners')},
 {id:'garment-steamers',legacyPath:'/Product/garment-steamers.html',title:{cn:'吸附挂烫机系列',en:'Suction Garment Steamers'},productIds:['AP-AR01'],image:artwork('range-steamers')},
 {id:'682971',legacyPath:'/Product/682971.html',title:{cn:'高速多功能美发器',en:'High-Speed Multi-Stylers'},productIds:['AP-S1'],image:artwork('product-s1')},
];
export const apowerProducts: Product[] = ['AP-G1','AP-G3','AP-G11','AP-S1','AP-H1','AP-AR01'].map(model=>{
 const category=apowerCategories.find(c=>c.productIds.includes(model))!;
 const image=artwork('product-'+model.slice(3).toLowerCase(),model);
 const legacyPath=`/ProductDetail/${model}.html`;
 const localized=(locale:Locale):ProductPage=>({
  id:model,productId:model,model,categoryId:category.id,locale,legacyPath,kind:'product-detail',title:model,
  description:`${model} · ${category.title[locale]}`,seo:{title:`${model} | APOWER TECH`,description:category.title[locale]},
  images:[image],blocks:[],specifications:model==='AP-AR01'?[{label:locale==='cn'?'吸附力':'Adsorption capacity',value:'5500 Pa'},{label:locale==='cn'?'最高转速':'Maximum speed',value:'95000 RPM'}]:[],
  features:model==='AP-G1'?[{type:'rich-text',heading:locale==='cn'?'微雾精华护理':'Micro-Mist Essence Care',paragraphs:[locale==='cn'?'微雾精华吹护，让秀发更强韧、更有光泽。支持 1,000 台起订，可定制包装与丝印。':'Micro-Mist Essence Drying for Stronger, Shinier Hair. Minimum order quantity of 1,000 units; custom packaging and screen printing available.']}]:[],
  accessories:[],inquiryTitle:`${model} ${locale==='cn'?'产品询盘':'Product inquiry'}`,
  provenance:{sourceUrl:'APOWER TECH网站指导.xlsx',sourceLocale:locale,languageVerified:true,translation:'authored',coverage:'full'},
 });
 return {id:model,model,legacyPath,categoryId:category.id,image,gallery:[image],locales:{cn:localized('cn'),en:localized('en')}};
});
export const apowerCategoryPages:SitePage[]=apowerCategories.flatMap(c=>(['en','cn'] as const).map(locale=>({
 id:c.id,categoryId:c.id,locale,legacyPath:c.legacyPath,kind:'product-category',title:c.title[locale],description:c.title[locale],
 seo:{title:`${c.title[locale]} | APOWER TECH`,description:c.title[locale]},blocks:[],images:c.image?[c.image]:[],
 provenance:{sourceUrl:'APOWER TECH网站指导.xlsx',sourceLocale:locale,languageVerified:true,translation:'authored',coverage:'full'},
})));
export const apowerFaq=(locale:Locale)=>copy.slice(234,257).map(row=>{
 if(locale==='cn') return {id:row.id,question:row.label.replace(/^\d+\.\s*/,''),answer:row.cn};
 const [question,...answer]=row.en.replace(/^\d+\.\s*/,'').split(/\s{2,}/);
 return {id:row.id,question,answer:answer.join(' ')};
});
