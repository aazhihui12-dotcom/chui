import type { ContentBlock, SitePage } from "@/content/schema";
import { editorialSections, type editorialPaths, type EditorialEntry, type EditorialSourceGallery } from "@/content/editorial";
import { Fragment } from "react";
import { SectionRenderer, renderBlock } from "@/components/site/SectionRenderer";
import { EditorialGallery } from "@/components/interactive/EditorialGallery";
import { Media } from "@/components/site/Media";
import "./editorial.css";

export function EditorialTemplate({ page }: { page: SitePage }) {
  const isSummary = page.provenance.coverage === "localized-summary";
  const sections = editorialSections[page.legacyPath as (typeof editorialPaths)[number]];
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
  const renderSourceGallery = (gallery: EditorialSourceGallery) => <EditorialGallery images={gallery.media.map((index) => page.images[index])} label={gallery.label[page.locale]} locale={page.locale} />;
  const renderEntry = (entry: EditorialEntry) => {
    if (typeof entry === "number") return renderBlock(blocks[entry]);
    if ("media" in entry) return renderSourceGallery(entry);
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

  return <main id="main-content" data-editorial-path={page.legacyPath} className={`editorial-page${isSummary ? " editorial-page--summary" : ""}`}>
    <header className="editorial-banner"><h1>{page.title}</h1></header>
    {isSummary && <aside role="note" className="editorial-summary-note">{page.locale === "cn" ? "本页为英文资料的中文摘要，非已核验的中文原文。" : "This page is a localized summary of the English material, not a verified source-language page."}</aside>}
    {isSummary || !sections ? <div className="editorial-summary">{summaryMedia ? <>
      <SectionRenderer blocks={summaryBlocks.filter((block) => block.type === "rich-text")} />
      {summaryMedia}
      <SectionRenderer blocks={summaryBlocks.filter((block) => block.type === "cta")} />
    </> : <SectionRenderer blocks={summaryBlocks} />}</div> : sections.map((section, index) => <section
      className={`editorial-section editorial-section--${section.layout}${section.tone ? ` editorial-section--${section.tone}` : ""}`}
      key={index}
    >
      <div className="editorial-section__inner">{section.groups.map((indices, groupIndex) => <div className="editorial-section__group" key={groupIndex}>
        {indices.map((entry, entryIndex) => <Fragment key={entryIndex}>{renderEntry(entry)}</Fragment>)}
      </div>)}</div>
    </section>)}
  </main>;
}
