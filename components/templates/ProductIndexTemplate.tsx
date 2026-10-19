import { sitePath } from "@/lib/site-path";
import { pages } from '@/content/pages';
import { apowerCategories as categories, apowerProducts as products, text, splitCopy, overviewVideo, apowerFaq, artwork } from '@/content/apower';
import type { SitePage } from '@/content/schema';
import { ProductCatalog } from '@/components/interactive/ProductCatalog';
import { SourceVideo } from '@/components/interactive/SourceVideo';
import { SectionRenderer } from '@/components/site/SectionRenderer';
import { InquiryTrigger } from '@/components/interactive/InquiryTrigger';
import { homeCopy } from '@/content/home';
import { ImageDescription } from '@/components/interactive/ImageDescription';
import { Media } from '@/components/site/Media';
import { productOverviewPoster, proofCopy } from '@/content/apower-v3';

const source=pages.find(p=>p.locale==='cn' && p.kind==='product-index')!;
const photo=(index:number)=>{const b=source.blocks[index];return b?.type==='media'?b.image:undefined;};
export function ProductIndexTemplate({page}:{page:SitePage}) {
 const locale=page.locale, cn=locale==='cn', t=(id:number)=>text(id,locale), copy=homeCopy[locale];
 const img=(index:number)=>{const image=photo(index);return image&&<img src={sitePath(image.src)} alt="" width="600" height="440" loading="lazy"/>;};
 const pair=(id:number)=>splitCopy(id,locale);
 return <main id="main-content" className="product-page product-index apower-v3">
  <header className="product-index__banner"><h1>{t(37)}</h1></header>
  <section className="product-index__catalog"><ProductCatalog products={products} categories={categories} locale={locale} filterable presentation="carousel"/></section>
  <section className="product-index__proof" aria-label={cn?'制造优势':'Manufacturing advantages'}>{proofCopy(locale).map((description,i)=><ImageDescription key={i} image={photo(2+i*2)!} title={(cn?['按时生产','严格品质检验','竞争力价格','国际认证与专利']:['On-Time Production','Strict Quality Inspection','Competitive Pricing','International Certifications & Patents'])[i]} description={description} locale={locale}/>)}</section>
  <div className="button-row"><InquiryTrigger locale={locale} title={copy.quote}>{copy.quote}</InquiryTrigger><InquiryTrigger locale={locale} title={copy.catalogue} className="lbh-button lbh-button--outline">{copy.catalogue}</InquiryTrigger></div>
  <section className="product-index__categories" aria-label={cn?'产品系列':'Product ranges'}>{categories.map(c=><a key={c.id} href={sitePath(`/${locale}${c.legacyPath}`)}><img src={sitePath(c.image!.src)} alt="" width="600" height="440" loading="lazy"/><h2>{c.title[locale]}</h2></a>)}</section>
  <section className="product-index__section product-index__customization"><h2>{t(38)}</h2><div className="product-index__options">{[39,40,41,42,43,44].map((id,i)=><ImageDescription key={id} image={photo(33+i*3)!} title={pair(id).heading} description={pair(id).body} locale={locale}/>)}</div></section>
  <section className="product-index__section v3-product-overview"><h2>{t(45)}</h2><div><SourceVideo video={overviewVideo} locale={locale} poster={sitePath(productOverviewPoster)}/><p className="product-index__intro">{t(46)}</p></div></section>
  <section className="product-index__section"><h2>{t(47)}</h2><div className="product-index__services">{[48,52,56].map((id,i)=><article key={id}><h3>{t(id)}</h3>{img(55+i*8)}<div>{[1,2,3].map(j=><section key={j}><h4>{pair(id+j).heading}</h4><p>{pair(id+j).body}</p></section>)}</div></article>)}</div></section>
  <section className="product-index__section product-index__benefits"><h2>{t(60)}</h2><ol>{[61,62,63,64,65,66].map((id,i)=><li key={id}><Media image={artwork(['icon-people','icon-dryer','icon-coupon','icon-medal','icon-check','icon-approval'][i])}/><p>{t(id).replace(/^\d+\.\s*/,'')}</p></li>)}</ol></section>
  <section className="product-index__section product-index__manufacturing"><h2>{t(67)}</h2><ol className="product-index__steps">{t(68).split(' → ').map((title,i)=><li key={title}>{img(87+i*2)}<h3>{title}</h3></li>)}</ol></section>
  <section className="product-index__section product-index__assembly"><h2>{t(69)}</h2><ol>{Array.from({length:10},(_,i)=><li key={i}><Media image={artwork(`assembly-${i+1}`,pair(70+i).heading)}/><div><span>{String(i+1).padStart(2,'0')}</span><h3>{pair(70+i).heading.replace(/^(步骤\s*\d+：|Step \d+: )/,'')}</h3><p>{pair(70+i).body}</p></div></li>)}</ol><p className="product-index__pledge">{t(80)}</p><div className="button-row"><InquiryTrigger locale={locale} title={copy.contact}>{copy.contact} ↗</InquiryTrigger></div></section>
  <section className="product-index__section product-index__certifications" id="product-certifications"><h2>{t(27)}</h2><p className="product-index__intro">{t(81)}</p><div className="product-index__certification-strip" role="region" aria-label={cn?'产品认证标识':'Product certification marks'} tabIndex={0}><SectionRenderer blocks={source.blocks.filter(b=>b.type==='gallery').slice(0,1)}/></div></section>
  <section className="product-index__section v3-quality-numbers" aria-label={cn?'品质实力':'Quality in numbers'}><div className="v3-quality-grid">{[82,83,84,85].map(id=>{const p=pair(id),m=p.heading.match(/^(\d+[%+]?)\s*(.*)$/)!;return <article key={id}><h3><span>{m[1]}</span>{m[2]}</h3><p>{p.body}</p></article>;})}</div></section>
  <section className="product-index__section"><h2>{t(23)}</h2><SectionRenderer blocks={[source.blocks[128]]}/><div className="testimonials">{copy.testimonials.map((quote,i)=><figure key={i}>{img(129+i*3)}<blockquote>{quote}</blockquote><figcaption>—— {['Jeff Deng','Warren Steve','María Emilia'][i]}</figcaption></figure>)}</div></section>
  <section className="product-index__section product-index__faq"><h2>{cn?'常见问题':'FAQ'}</h2>{apowerFaq(locale).slice(0,4).map(f=><details key={f.id}><summary>{f.question}</summary><p>{f.answer}</p></details>)}<a className="text-link" href={sitePath(`/${locale}/FAQ`)}>{cn?'查看全部常见问题':'View all frequently asked questions'} →</a></section>
  <section className="product-index__cta"><h2>{t(35)}</h2><InquiryTrigger locale={locale} title={copy.contact}>{copy.contact} ↗</InquiryTrigger></section>
 </main>;
}
