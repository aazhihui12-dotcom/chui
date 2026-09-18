import type { ContentBlock, SitePage } from "@/content/schema";
import { editorialSections, type editorialPaths } from "@/content/editorial";
import { SectionRenderer } from "@/components/site/SectionRenderer";
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
    if (block.type === "rich-text" && block.heading === page.title) return block.paragraphs.length ? [{ ...block, heading: undefined }] : [];
    if (block.type === "media") {
      if (seenImages.has(block.image.src)) return [];
      seenImages.add(block.image.src);
    }
    return [block];
  });

  return <main id="main-content" className={`editorial-page${isSummary ? " editorial-page--summary" : ""}`}>
    <header className="editorial-banner"><h1>{page.title}</h1></header>
    {isSummary && <aside role="note" className="editorial-summary-note">{page.locale === "cn" ? "本页为英文资料的中文摘要，非已核验的中文原文。" : "This page is a localized summary of the English material, not a verified source-language page."}</aside>}
    {isSummary || !sections ? <div className="editorial-summary"><SectionRenderer blocks={summaryBlocks} /></div> : sections.map((section, index) => <section
      className={`editorial-section editorial-section--${section.layout}${section.tone ? ` editorial-section--${section.tone}` : ""}`}
      key={index}
    >
      <div className="editorial-section__inner">{section.groups.map((indices, groupIndex) => <div className="editorial-section__group" key={groupIndex}>
        <SectionRenderer blocks={indices.map((blockIndex) => blocks[blockIndex])} />
      </div>)}</div>
    </section>)}
  </main>;
}
