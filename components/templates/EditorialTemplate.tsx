import type { ContentBlock, SitePage } from "@/content/schema";
import { editorialSections, chineseEditorialSections, type editorialPaths, type EditorialEntry, type EditorialSourceGallery } from "@/content/editorial";
import { Fragment } from "react";
import { SectionRenderer, renderBlock } from "@/components/site/SectionRenderer";
import { EditorialGallery } from "@/components/interactive/EditorialGallery";
import { Media } from "@/components/site/Media";
import { SourceVideo } from "@/components/interactive/SourceVideo";
import "./editorial.css";
import { apowerEditorial } from '@/content/apower-editorial';
import { factoryVideo, text, artwork } from '@/content/apower';
import { factoryTourPoster, manufacturingLabels, productManufacturingPoster, stripPaths } from '@/content/apower-v3';
import { ContactStrip } from '@/components/site/ContactStrip';
import { ImageDescription } from '@/components/interactive/ImageDescription';
import { sitePath } from '@/lib/site-path';
import { manufacturingPoster } from '@/content/home';

export function EditorialTemplate({ page }: { page: SitePage }) {
  page=apowerEditorial(page);
  const isSummary = page.provenance.coverage === "localized-summary";
  const originalSections = chineseEditorialSections[page.legacyPath as (typeof editorialPaths)[number]];
  let sections = originalSections?.map(section=>({...section,groups:section.groups.map(group=>[...group])}));
  const hasStrip=stripPaths.includes(page.legacyPath);
  const isExclusive=page.legacyPath==='/Exclusive_sale';
  if(sections&&hasStrip&&page.legacyPath!=='/Exclusive_sale')sections=sections.slice(0,-1);
  if(sections&&isExclusive){
    sections[0]={...sections[0],groups:[[3],[4]]};
    sections[sections.length-1]={layout:'split',groups:[[13],[14]]};
  }
  if(sections&&page.legacyPath==='/Lead_the_team')sections=[{layout:'split',groups:[[2],[3,4,5,6]]}];
  if(sections&&page.legacyPath==='/Factory_tour'){
    sections[0]={layout:'split',groups:[[2],[{video:factoryVideo}]]};
    sections=sections.filter((_,index)=>index!==2);
    sections=sections.map(section=>section.groups[0]?.[0]===6?{...section,tone:'dark'}:section.layout==='cards'?{...section,groups:section.groups.map(group=>[group[1],group[0]])}:section);
  }
  if(sections&&page.legacyPath==='/Design_and_Development')sections[3]={...sections[3],tone:'dark'};
  if(sections&&page.legacyPath==='/Company_Introduction')sections.splice(3,2,{layout:'stack',groups:[[10,11,12],[13,14],[15,16],[17,18],[19,20]]});
  if(sections&&page.legacyPath==='/Product_Laboratory')sections=sections.map(section=>section.layout==='cards'?{...section,groups:section.groups.map(group=>[group[1],group[0]])}:section);
  const blocks = page.blocks.map((block): ContentBlock => {
    if (block.type !== "gallery" || !["/Company_Introduction", "/Certification_certificate"].includes(page.legacyPath)) return block;
    return { ...block, images: block.images.map((image, index) => ({ ...image, alt: image.alt || `${page.locale === "cn" ? "产品认证证书" : "Product certificate"} ${index + 1}` })) };
  });
  const seenImages = new Set<string>();
  const summaryBlocks = blocks.slice(1).flatMap((block): ContentBlock[] => {
    if (block.type === "rich-text" && !block.heading && block.paragraphs.length === 1 && block.paragraphs[0] === page.title) return [];
    if (block.type === "rich-text" && block.heading === page.title) return block.paragraphs.length ? [{ ...block, heading: undefined }] : [];
    if (block.type === "media") {
      if (seenImages.has(block.image.src)) return [];
      seenImages.add(block.image.src);
    }
    return [block];
  });
  const sourceGalleries = sections?.flatMap((section) => section.groups.flat()).filter((entry): entry is EditorialSourceGallery => typeof entry !== "number" && "media" in entry) ?? [];
  const renderSourceGallery = (gallery: EditorialSourceGallery) => <EditorialGallery images={gallery.media.map((index) => page.images[index])} label={gallery.label[page.locale]} locale={page.locale} autoplayMs={gallery.autoplayMs || (page.legacyPath === "/PinZhiGuanLi" ? 3000 : 0)} />;
  const renderEntry = (entry: EditorialEntry) => {
    if (typeof entry === "number") {
      const exclusiveIcon=page.legacyPath==='/Exclusive_sale'&&[7,9,11].includes(entry)?['icon-payment','icon-people','icon-crown'][[7,9,11].indexOf(entry)]:null;
      const missionIcon=page.legacyPath==='/Company_Introduction'&&[26,28,30].includes(entry)?['icon-medal','icon-people','icon-growth'][[26,28,30].indexOf(entry)]:null;
      return <>{(exclusiveIcon||missionIcon)&&<Media image={artwork((exclusiveIcon||missionIcon)!)} className="v3-benefit-icon"/>}{renderBlock(blocks[entry])}</>;
    }
    if ("media" in entry) return renderSourceGallery(entry);
    if ("video" in entry) return <SourceVideo video={page.legacyPath==='/Factory_tour'?factoryVideo:entry.video} locale={page.locale} poster={sitePath(page.legacyPath==='/Factory_tour'?factoryTourPoster:manufacturingPoster)} />;
    return <div className="editorial-test-item"><Media image={{ ...page.images[entry.icon], alt: "" }} />{renderBlock(blocks[entry.block])}</div>;
  };
  // Summaries have fewer text blocks, so do not reuse English block indices.
  // Merge the reviewed galleries into the existing summary images by source order.
  const summaryMedia = isSummary && sourceGalleries.length ? page.images.flatMap((image, imageIndex) => {
    const gallery = sourceGalleries.find((item) => item.media.includes(imageIndex));
    if (gallery) return gallery.media[0] === imageIndex ? [<Fragment key={image.src}>{renderSourceGallery(gallery)}</Fragment>] : [];
    const block = summaryBlocks.find((item) => item.type === "media" && item.image.src === image.src);
    return block ? [<Fragment key={image.src}>{renderBlock(block)}</Fragment>] : [];
  }) : null;

  const v3=hasStrip||['/Company_Introduction','/Factory_tour','/Certification_certificate','/Sustainable_Development','/Product_Laboratory'].includes(page.legacyPath);
  return <main id="main-content" data-editorial-path={page.legacyPath} className={`editorial-page${v3?' apower-v3':''}${isSummary ? " editorial-page--summary" : ""}`}>
    <header className="editorial-banner"><h1>{page.title}</h1></header>
    {isSummary && <aside role="note" className="editorial-summary-note">{page.locale === "cn" ? "本页为英文资料的中文摘要，非已核验的中文原文。" : "This page is a localized summary of the English material, not a verified source-language page."}</aside>}
    {isSummary || !sections ? <div className="editorial-summary">{summaryMedia ? <>
      <SectionRenderer blocks={summaryBlocks.filter((block) => block.type === "rich-text")} />
      {summaryMedia}
      <SectionRenderer blocks={summaryBlocks.filter((block) => block.type === "cta")} />
    </> : <SectionRenderer blocks={summaryBlocks} />}</div> : sections.map((section, index) => <section
      className={`editorial-section editorial-section--${section.layout}${section.tone ? ` editorial-section--${section.tone}` : ""}${page.legacyPath==='/Company_Introduction'&&index===3?' v3-company-values':''}${page.legacyPath==='/Design_and_Development'&&index===3?' v3-design-facilities':''}${isExclusive&&index===0?' v3-exclusive-intro':''}`}
      id={isExclusive&&index===0?'exclusive-opportunities':undefined}
      key={index}
    >
      {isExclusive&&index===0&&renderBlock(blocks[2])}
      {page.legacyPath==='/Contract_manufacturing_service' && index===1 && <h2 className="editorial-facts-title">{text(98,page.locale)}</h2>}
      {page.legacyPath==='/Design_and_Development'&&index===3&&renderBlock(blocks[7])}
      {page.legacyPath==='/Product_manufacturing'&&index===1?<div className="v3-manufacturing-stages">{manufacturingLabels[page.locale].map((label,i)=><article key={label}><Media image={artwork(`manufacturing-${i+1}`,label)}/><h3>{label}</h3></article>)}</div>:
      <div className="editorial-section__inner">{section.groups.map((indices, groupIndex) => <div className="editorial-section__group" key={groupIndex}>
        {page.legacyPath==='/Contract_manufacturing_service'&&index===5?(()=>{
          const image=indices.map(i=>typeof i==='number'?blocks[i]:undefined).find(b=>b?.type==='media');
          const copy=indices.map(i=>typeof i==='number'?blocks[i]:undefined).filter(b=>b?.type==='rich-text');
          return image?.type==='media'&&<ImageDescription image={image.image} locale={page.locale} title={copy.find(b=>b?.type==='rich-text'&&b.heading)?.heading||''} description={copy.flatMap(b=>b?.type==='rich-text'?b.paragraphs:[]).join('\n\n')}/>;
        })():indices.filter(entry=>!(page.legacyPath==='/Design_and_Development'&&index===3&&entry===7)).map((entry, entryIndex) => <Fragment key={entryIndex}>{renderEntry(entry)}</Fragment>)}
      </div>)}</div>}
      {page.legacyPath==='/Product_manufacturing'&&index===0&&<SourceVideo video={factoryVideo} locale={page.locale} poster={sitePath(productManufacturingPoster)}/>}
    </section>)}
    {hasStrip&&<ContactStrip locale={page.locale}/>}
  </main>;
}
