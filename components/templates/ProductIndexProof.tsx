import { pages } from "@/content/pages";
import { homeCopy } from "@/content/home";
import { articles } from "@/content/articles";
import type { Locale, RichTextBlock } from "@/content/schema";
import { SectionRenderer } from "@/components/site/SectionRenderer";
import { ContentAction } from "@/components/site/ContentAction";

function sourceFor(locale: Locale) {
  const blocks = pages.find(page => page.kind === "product-index" && page.locale === locale)!.blocks;
  const text = (index: number) => { const block = blocks[index]; return block.type === "rich-text" ? [block.heading, ...block.paragraphs].filter(Boolean).join(" ") : ""; };
  const start = (heading: string) => { const index = blocks.findIndex(block => block.type === "rich-text" && block.heading === heading); if (index < 0) throw new Error("Missing " + locale + " overview section " + heading); return index; };
  return { blocks, text, start };
}
export function ProductIndexServices({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const { blocks, text, start } = sourceFor(locale);
  const first = start(cn ? "针对线下客户" : "Targeting Offline Customers");
  const benefits = start(cn ? "LBH的一站式服务为您节省时间、精力和成本" : "LBH's one-stop service saves you time, effort, and costs.");
  return <>
    <section className="product-index__section"><h2>{cn ? "差异化服务：精准满足您业务需求" : "Differentiated Services: Precisely Meeting Your Business Needs"}</h2>
      <div className="product-index__services">{[0, 1, 2].map(index => { const offset = first + index * 8; const image = blocks[offset + 1]; return <article key={index}>{image.type === "media" && <img src={image.image.src} alt="" width="500" height="320" loading="lazy" />}<div><h3>{text(offset)}</h3>{[0, 1, 2].map(item => <section key={item}><h4>{text(offset + 2 + item * 2)}</h4><p>{text(offset + 3 + item * 2)}</p></section>)}</div></article>; })}</div>
    </section>
    <section className="product-index__section product-index__benefits"><h2>{text(benefits)}</h2><ol>{Array.from({ length: 6 }, (_, index) => <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{text(benefits + index + 1)}</li>)}</ol></section>
  </>;
}
export function ProductIndexAssembly({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const { blocks, text, start } = sourceFor(locale);
  const first = start(cn ? "物料清单核对" : "Bill of Materials Verification");
  return <section className="product-index__section product-index__assembly"><h2>{cn ? "确保每份订单都能按时生产，并保证质量" : "Ensure that every order is produced on time and meets quality standards."}</h2><ol>{Array.from({ length: 10 }, (_, index) => { const source = blocks[first + index] as RichTextBlock; return <li key={index}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{source.heading}</h3><p>{source.paragraphs.join(" ")}</p></div></li>; })}</ol><p className="product-index__pledge">{text(start(cn ? "LBH 绝不会把问题留给客户解决，这是我们坚定不移的原则！" : "LBH will never leave problems for our clients to resolve—this is our unwavering principle!"))}</p><ContentAction action={{ label: cn ? "立即下单" : "Order Now", href: "/" + locale + "/Contact_Us", action: "inquiry" }} /></section>;
}
export function ProductIndexPartners({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const { blocks, start } = sourceFor(locale);
  const copy = homeCopy[locale];
  const first = start(cn ? "我们宝贵的合作伙伴" : "Our Valued Partners");
  const figures = blocks.filter(block => block.type === "stats").flatMap(block => block.items);
  const explanations = blocks.flatMap((block, index) => block.type === "stats" && blocks[index + 1]?.type === "rich-text" ? [blocks[index + 1]] : []);
  return <>
    <section className="product-index__section" aria-label={cn ? "品质实力" : "Quality in numbers"}><SectionRenderer blocks={[{ type: "stats", items: figures }]} /><SectionRenderer blocks={explanations} /></section>
    <section className="product-index__section"><h2>{cn ? "我们宝贵的合作伙伴" : "Our Valued Partners"}</h2><SectionRenderer blocks={[blocks[first + 1]]} /><div className="testimonials">{["Jeff Deng", "Warren Steve", "María Emilia"].map((name, index) => { const photo = blocks[first + 2 + index * 3]; return <figure key={name}>{photo.type === "media" && <img src={photo.image.src} alt={name} width="75" height="75" loading="lazy" />}<blockquote>{copy.testimonials[index]}</blockquote><figcaption>{name}</figcaption></figure>; })}</div></section>
    <section className="product-index__section product-index__faq"><h2>{cn ? "常见问题" : "FAQ"}</h2>{articles.filter(article => article.category === "faq").slice(0, 4).map(article => <details key={article.id}><summary>{article.locales[locale].title}</summary><p>{article.locales[locale].description}</p></details>)}<a className="text-link" href={"/" + locale + "/FAQ"}>{cn ? "查看全部常见问题" : "View all frequently asked questions"} →</a></section>
  </>;
}
