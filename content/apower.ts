import copy from './apower-copy.json';
import { apowerMedia, apowerAssetDetails } from './apower-media';
import { apowerSpecifications } from './apower-v2';
import type { Locale, ImageAsset, Category, Product, ProductPage, SitePage } from './schema';

/** Verbatim copy from the user's 2026 bilingual Word document, keyed by table index. */
export const text = (id: number, locale: Locale) => copy[id][locale];
export const artwork = (name: string, alt = ''): ImageAsset => {
 const src=apowerMedia[name];
 if(!src) throw new Error(`Unknown APOWER artwork: ${name}`);
 return {...apowerAssetDetails[name],src,alt};
};
const productArtwork = (model: string, group: 'color' | 'detail', locale: Locale): ImageAsset[] =>
 Object.keys(apowerAssetDetails).filter(key=>key.startsWith(`${model.toLowerCase()}-${group}-`))
  .sort((a,b)=>a.localeCompare(b,'en',{numeric:true})).map((key,index)=>artwork(key,`${model} ${locale==='cn'?(group==='color'?'配色图':'产品详情'):(group==='color'?'color option':'product detail')} ${index+1}`));
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
 const gallery=(locale:Locale)=>[...new Map([image,...productArtwork(model,'color',locale)].map(asset=>[asset.src,asset])).values()];
 const legacyPath=`/ProductDetail/${model}.html`;
 const localized=(locale:Locale):ProductPage=>({
  id:model,productId:model,model,categoryId:category.id,locale,legacyPath,kind:'product-detail',title:model,
  description:`${model} · ${category.title[locale]}`,seo:{title:`${model} | APOWER TECH`,description:category.title[locale]},
  images:gallery(locale),blocks:[],specifications:apowerSpecifications(model,locale),
  features:productArtwork(model,'detail',locale).map(image=>({type:'media',image})),
  accessories:[],inquiryTitle:`${model} ${locale==='cn'?'产品询盘':'Product inquiry'}`,
  provenance:{sourceUrl:'APOWER TECH网站指导 2.0.xlsx',sourceLocale:locale,languageVerified:true,translation:'authored',coverage:'full'},
 });
 return {id:model,model,legacyPath,categoryId:category.id,image,gallery:gallery('en'),locales:{cn:localized('cn'),en:localized('en')}};
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
