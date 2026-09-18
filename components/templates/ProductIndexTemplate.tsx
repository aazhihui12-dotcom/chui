import { pages } from "@/content/pages";
import { categories, products } from "@/content/products";
import type { SitePage, RichTextBlock, ImageAsset } from "@/content/schema";
import { ProductCatalog } from "@/components/interactive/ProductCatalog";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { VideoModal } from "@/components/interactive/VideoModal";
import { manufacturingPoster, manufacturingVideo } from "@/content/home";
import { ProductIndexServices, ProductIndexAssembly, ProductIndexPartners } from "./ProductIndexProof";

const source = pages.find((page) => page.kind === "product-index" && page.locale === "en")!;
function sourceSection(heading: string, length: number) {
  const index = source.blocks.findIndex((block) => block.type === "rich-text" && block.heading === heading);
  return source.blocks.slice(index + 1, index + 1 + length);
}
const customization = sourceSection("Customized, Unique Small Appliance Solutions", 18);
const production = sourceSection("Maximize Product Performance with", 16);
const proof = source.blocks.slice(2, 10);
const categoriesMedia = source.blocks.slice(17, 27).filter((block) => block.type === "media");
const asText = (block: typeof source.blocks[number]) => block.type === "rich-text" ? block.heading ?? block.paragraphs.join(" ") : "";
const asImage = (block: typeof source.blocks[number]): ImageAsset | undefined => block.type === "media" ? block.image : undefined;

export function ProductIndexTemplate({ page }: { page: SitePage }) {
  const locale = page.locale;
  const cn = locale === "cn";
  const customTitles = ["色彩选择", "电源适配", "控制系统", "品牌标识", "包装设计", "外观设计"];
  const customDescriptions = ["根据目标市场用户的偏好定制产品色彩。", "调整电压与功率，满足不同国家和地区的使用要求。", "定制主板程序，实现所需的产品功能模式。", "添加品牌标志和个性化元素，提升品牌辨识度。", "选择环保包装方案，体现可持续发展理念。", "选择符合美观与功能需求的材料和表面处理工艺。"];
  const productionTitles = ["提交需求", "确定数量", "结构设计", "建立3D模型", "制作原型", "功能调试", "样品与试订单生产", "正式生产"];
  const proofText = ["遵循系统化的产品制造流程，确保订单按时交付并保证质量。", "严格执行出厂检验流程，控制产品售后率。", "自主设计的专属模具提供有竞争力的价格，帮助节省成本。", "完善的国际认证与产品专利，为客户提供支持。"];
  const heading = (source.blocks[1] as RichTextBlock).heading!;
  return <main id="main-content" className="product-page product-index">
    <section className="product-index__catalog"><h1>{cn ? "我们的个护电器为何与众不同？" : heading}</h1><ProductCatalog products={products} categories={categories} locale={locale} filterable /></section>
    <section className="product-index__proof" aria-label={cn ? "制造优势" : "Manufacturing advantages"}>{[0, 1, 2, 3].map((index) => { const image = asImage(proof[index * 2]); return <article key={index}>{image && <img src={image.src} alt="" width="130" height="130" loading="lazy" />}<p>{cn ? proofText[index] : asText(proof[index * 2 + 1])}</p></article>; })}</section>
    <div className="button-row"><a className="lbh-button" href={`/${locale}/Contact_Us`}>{cn ? "立即询价" : "Get a Quick Quote"}</a><a className="lbh-button lbh-button--outline" href={`/${locale}/Contact_Us`}>{cn ? "索取完整产品目录" : "Request Full Product Catalog"}</a></div>
    <section className="product-index__categories" aria-label={cn ? "产品系列" : "Product ranges"}>{categories.map((category, index) => <a key={category.id} href={`/${locale}${category.legacyPath}`}>{categoriesMedia[index] && <img src={categoriesMedia[index].image.src} alt="" width="600" height="440" loading="lazy" />}<h2>{category.title[locale]} <span aria-hidden="true">↗</span></h2></a>)}</section>
    <section className="product-index__section product-index__customization"><h2>{cn ? "定制独特的小家电解决方案" : "Customized, Unique Small Appliance Solutions"}</h2><div className="product-index__options">{customTitles.map((title, index) => { const image = asImage(customization[index * 3]); return <article key={title}>{image && <img src={image.src} alt="" width="150" height="150" loading="lazy" />}<h3>{cn ? title : asText(customization[index * 3 + 1])}</h3><p>{cn ? customDescriptions[index] : asText(customization[index * 3 + 2])}</p></article>; })}</div></section>
    <section className="product-index__section"><h2>{cn ? "探索工厂品质之源" : "Discover the Source of Factory Quality"}</h2><p className="product-index__intro">{page.description}</p><VideoModal src={manufacturingVideo} poster={manufacturingPoster} locale={locale} /></section>
    <ProductIndexServices locale={locale} />
    <section className="product-index__section product-index__manufacturing"><h2>{cn ? "通过定制方案提升产品性能" : "Maximize Product Performance with Our Customized Solutions"}</h2><ol className="product-index__steps">{productionTitles.map((title, index) => { const image = asImage(production[index * 2]); return <li key={title}>{image && <img src={image.src} alt="" width="200" height="150" loading="lazy" />}<span>{String(index + 1).padStart(2, "0")}</span><h3>{cn ? title : asText(production[index * 2 + 1])}</h3></li>; })}</ol></section>
    <ProductIndexAssembly locale={locale} />
    <section className="product-index__section product-index__certifications"><h2>{cn ? "全球认可的品质认证" : "Globally Recognized Quality Certification"}</h2><p className="product-index__intro">{cn ? "根据客户要求，产品接受CCC、FCC、CE、IC、RoHS、UL及ISO 9001等技术认证与测试，以满足国际安全、质量和效率标准。" : asText(source.blocks[118])}</p><SectionRenderer blocks={source.blocks.filter((block) => block.type === "gallery").slice(0, 1)} /></section>
    <ProductIndexPartners locale={locale} />
    <section className="product-index__cta"><h2>{cn ? "开启您的产品定制" : "Start your product customization"}</h2><a className="lbh-button" href={`/${locale}/Contact_Us`}>{cn ? "联系我们" : "Contact Us"} <span aria-hidden="true">↗</span></a></section>
  </main>;
}
