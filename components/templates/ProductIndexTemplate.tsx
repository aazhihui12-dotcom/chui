import { pages } from "@/content/pages";
import { categories, products } from "@/content/products";
import type { SitePage, ImageAsset } from "@/content/schema";
import { ProductCatalog } from "@/components/interactive/ProductCatalog";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { VideoModal } from "@/components/interactive/VideoModal";
import { manufacturingPoster, manufacturingVideo } from "@/content/home";
import { ProductIndexServices, ProductIndexAssembly, ProductIndexPartners } from "./ProductIndexProof";
import { InquiryTrigger } from "@/components/interactive/InquiryTrigger";

const source = pages.find((page) => page.kind === "product-index" && page.locale === "en")!;
function sourceSection(heading: string, pattern: string[], source: SitePage = pages.find(page => page.kind === "product-index" && page.locale === "en")!) {
  const index = source.blocks.findIndex((block) => block.type === "rich-text" && block.heading === heading);
  if (index < 0) throw new Error(`Missing product overview section: ${heading}`);
  const blocks = source.blocks.slice(index + 1, index + 1 + pattern.length);
  if (blocks.length !== pattern.length || blocks.some((block, position) => block.type !== pattern[position])) {
    throw new Error(`Unexpected product overview structure: ${heading}`);
  }
  return blocks;
}
const heading = "What makes our personal care appliances stand out?";
const categoriesMedia = categories.map((category) => {
  const titleIndex = source.blocks.findIndex((block) => block.type === "rich-text" && block.heading === category.title.en);
  const image = source.blocks[titleIndex - 1];
  if (image?.type !== "media") throw new Error(`Missing category artwork: ${category.title.en}`);
  return image;
});
const asText = (block: typeof source.blocks[number]) => block.type === "rich-text" ? block.heading ?? block.paragraphs.join(" ") : "";
const asImage = (block: typeof source.blocks[number]): ImageAsset | undefined => block.type === "media" ? block.image : undefined;

export function ProductIndexTemplate({ page }: { page: SitePage }) {
  const locale = page.locale;
  const cn = locale === "cn";
  const customization = sourceSection(cn ? "定制化的独特小家电解决方案" : "Customized, Unique Small Appliance Solutions", Array(6).fill(["media", "rich-text", "rich-text"]).flat(), page);
  const production = sourceSection(cn ? "利用我们的定制化解决方案，最大限度地提高产品效能" : "Maximize Product Performance with", Array(8).fill(["media", "rich-text"]).flat(), page);
  const proof = sourceSection(cn ? "是什么让我们的个护家电产品脱颖而出？" : heading, Array(4).fill(["media", "rich-text"]).flat(), page);
  const certification = sourceSection(cn ? "全球认可的质量认证" : "Globally Recognized Quality Certification", ["rich-text"], page)[0];
  const factory = sourceSection(cn ? "探索工厂品质之源" : "Discover the Source of Factory Quality", ["rich-text"], page)[0];
  const customTitles = Array.from({ length: 6 }, (_, index) => asText(customization[index * 3 + 1]));
  const customDescriptions = Array.from({ length: 6 }, (_, index) => asText(customization[index * 3 + 2]));
  const productionTitles = Array.from({ length: 8 }, (_, index) => asText(production[index * 2 + 1]));
  const proofText = Array.from({ length: 4 }, (_, index) => asText(proof[index * 2 + 1]));
  return <main id="main-content" className="product-page product-index">
    <header className="product-index__banner"><h1>{cn ? "是什么让我们的个护家电产品脱颖而出？" : heading}</h1></header>
    <section className="product-index__catalog"><ProductCatalog products={products} categories={categories} locale={locale} filterable presentation="carousel" /></section>
    <section className="product-index__proof" aria-label={cn ? "制造优势" : "Manufacturing advantages"}>{[0, 1, 2, 3].map((index) => { const image = asImage(proof[index * 2]); return <article key={index}>{image && <img src={image.src} alt="" width="130" height="130" loading="lazy" />}<p>{cn ? proofText[index] : asText(proof[index * 2 + 1])}</p></article>; })}</section>
    <div className="button-row"><InquiryTrigger locale={locale} title={cn ? "立即询价" : "Get a Quick Quote"}>{cn ? "立即询价" : "Get a Quick Quote"}</InquiryTrigger><InquiryTrigger locale={locale} title={cn ? "索取完整产品目录" : "Request Full Product Catalog"} className="lbh-button lbh-button--outline">{cn ? "索取完整产品目录" : "Request Full Product Catalog"}</InquiryTrigger></div>
    <section className="product-index__categories" aria-label={cn ? "产品系列" : "Product ranges"}>{categories.map((category, index) => <a key={category.id} href={`/${locale}${category.legacyPath}`}>{categoriesMedia[index] && <img src={categoriesMedia[index].image.src} alt="" width="600" height="440" loading="lazy" />}<h2>{category.title[locale]} <span aria-hidden="true">↗</span></h2></a>)}</section>
    <section className="product-index__section product-index__customization"><h2>{cn ? "定制化的独特小家电解决方案" : "Customized, Unique Small Appliance Solutions"}</h2><div className="product-index__options">{customTitles.map((title, index) => { const image = asImage(customization[index * 3]); return <article key={title}>{image && <img src={image.src} alt="" width="150" height="150" loading="lazy" />}<h3>{cn ? title : asText(customization[index * 3 + 1])}</h3><p>{cn ? customDescriptions[index] : asText(customization[index * 3 + 2])}</p></article>; })}</div></section>
    <section className="product-index__section"><h2>{cn ? "探索工厂品质之源" : "Discover the Source of Factory Quality"}</h2><p className="product-index__intro">{asText(factory)}</p><VideoModal src={manufacturingVideo} poster={manufacturingPoster} locale={locale} /></section>
    <ProductIndexServices locale={locale} />
    <section className="product-index__section product-index__manufacturing"><h2>{cn ? "利用我们的定制化解决方案，最大限度地提高产品效能" : "Maximize Product Performance with Our Customized Solutions"}</h2><ol className="product-index__steps">{productionTitles.map((title, index) => { const image = asImage(production[index * 2]); return <li key={title}>{image && <img src={image.src} alt="" width="200" height="150" loading="lazy" />}<span>{String(index + 1).padStart(2, "0")}</span><h3>{cn ? title : asText(production[index * 2 + 1])}</h3></li>; })}</ol></section>
    <ProductIndexAssembly locale={locale} />
    <section className="product-index__section product-index__certifications"><h2>{cn ? "全球认可的质量认证" : "Globally Recognized Quality Certification"}</h2><p className="product-index__intro">{asText(certification)}</p><SectionRenderer blocks={page.blocks.filter((block) => block.type === "gallery").slice(0, 1)} /></section>
    <ProductIndexPartners locale={locale} />
    <section className="product-index__cta"><h2>{cn ? "开启您的产品定制" : "Start your product customization"}</h2><InquiryTrigger locale={locale} title={cn ? "开启您的产品定制" : "Start your product customization"}>{cn ? "联系我们" : "Contact Us"} <span aria-hidden="true">↗</span></InquiryTrigger></section>
  </main>;
}
