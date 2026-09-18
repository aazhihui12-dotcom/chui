import { pages } from "@/content/pages";
import { homeCopy } from "@/content/home";
import { articles } from "@/content/articles";
import type { Locale, RichTextBlock } from "@/content/schema";
import { SectionRenderer } from "@/components/site/SectionRenderer";

const blocks = pages.find((page) => page.kind === "product-index" && page.locale === "en")!.blocks;
const start = (heading: string) => blocks.findIndex((block) => block.type === "rich-text" && block.heading === heading);
const text = (index: number) => { const block = blocks[index]; return block.type === "rich-text" ? block.heading ?? block.paragraphs.join(" ") : ""; };
const cnServices = [
  ["线下客户", "区域独家代理与价格支持", "品牌授权帮助建立市场竞争优势。", "研发资源", "可在30天内提供3D原型，支持新产品开发。", "快速交付", "原材料齐备后，最快30天安排发货。"],
  ["线上客户", "灵活交付", "可靠的交期安排与仓储支持。", "高性价比", "有竞争力的定价，提升整体价值。", "丰富产品选择", "覆盖不同细分市场的产品方案。"],
  ["品牌合作伙伴", "灵活起订量", "灵活的最低订购量与产品组合。", "定制标识", "支持小批量品牌标识印制。", "一站式营销支持", "提供高品质图片与视频，支持销售。"],
];

export function ProductIndexServices({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const first = start("Targeting Offline Customers");
  const benefits = start("LBH's one-stop service saves you time, effort, and costs.");
  const cnBenefits = ["了解市场与客户的实际需求", "设计创新、独特畅销的个护电器", "以有竞争力的价格实现创意", "呈现卓越品质，维护品牌形象", "持续推进并完成项目", "成为当地市场的独家销售伙伴"];
  return <>
    <section className="product-index__section"><h2>{cn ? "差异化服务，精准满足业务需求" : "Differentiated Services: Precisely Meeting Your Business Needs"}</h2>
      <div className="product-index__services">{cnServices.map((copy, index) => { const offset = first + index * 8; const image = blocks[offset + 1]; return <article key={index}>{image.type === "media" && <img src={image.image.src} alt="" width="500" height="320" loading="lazy" />}<div><h3>{cn ? copy[0] : text(offset)}</h3>{[0, 1, 2].map((item) => <section key={item}><h4>{cn ? copy[item * 2 + 1] : text(offset + 2 + item * 2)}</h4><p>{cn ? copy[item * 2 + 2] : text(offset + 3 + item * 2)}</p></section>)}</div></article>; })}</div>
    </section>
    <section className="product-index__section product-index__benefits"><h2>{cn ? "一站式服务，节省时间、精力与成本" : text(benefits)}</h2><ol>{cnBenefits.map((item, index) => <li key={item}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>{cn ? item : text(benefits + index + 1)}</li>)}</ol></section>
  </>;
}

export function ProductIndexAssembly({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const first = start("Bill of Materials Verification");
  const cnSteps = [
    ["物料清单核对", "核对高速无刷电机、PCB控制板、发热元件和温度传感器等核心零件。"],
    ["安装PCB控制板", "采用SMT工艺焊接元件，通电检查电压输出和PWM反馈信号。"],
    ["组装高速电机模块", "固定无刷电机，焊接三相线并用热缩管绝缘。"],
    ["安装发热元件", "将PTC元件固定在云母支架上，两侧覆盖云母绝缘层。"],
    ["集成风道系统", "将叶轮与电机轴对齐，安装导风罩并检查风道毛刺。"],
    ["壳体预装", "安装前壳滤网、后壳电源线和模式开关。"],
    ["密封与封装", "采用超声波焊接及耐高温卡扣连接壳体，并进行气密测试。"],
    ["综合测试", "冷风模式全速运行5分钟，热风模式连续运行40分钟并监测温度变化。"],
    ["纸箱包装", "使用坚固纸箱，保障搬运及运输安全。"],
    ["装箱保护", "为长途运输提供额外的包装与保护。"],
  ];
  return <section className="product-index__section product-index__assembly"><h2>{cn ? "确保每份订单按时生产并符合质量标准" : "Ensure that every order is produced on time and meets quality standards."}</h2><ol>{cnSteps.map(([title, description], index) => { const source = blocks[first + index] as RichTextBlock; return <li key={title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><h3>{cn ? title : source.heading}</h3><p>{cn ? description : source.paragraphs.join(" ")}</p></div></li>; })}</ol><p className="product-index__pledge">{cn ? "绝不将问题留给客户，是我们始终坚持的原则。" : text(start("LBH will never leave problems for our clients to resolve—this is our unwavering principle!"))}</p><a className="lbh-button" href={`/${locale}/Contact_Us`}>{cn ? "立即订购" : "Order Now"}</a></section>;
}

export function ProductIndexPartners({ locale }: { locale: Locale }) {
  const cn = locale === "cn";
  const copy = homeCopy[locale];
  const first = start("Our Valued Partners");
  const figures = blocks.filter((block) => block.type === "stats").flatMap((block) => block.items);
  const cnLabels = ["认证专利", "生产设备", "追加研发投入", "检验流程"];
  return <>
    <section className="product-index__section" aria-label={cn ? "品质实力" : "Quality in numbers"}><SectionRenderer blocks={[{ type: "stats", items: figures.map((item, index) => cn ? { value: index === 2 ? "17 %" : item.value, label: cnLabels[index] } : item) }]} /></section>
    <section className="product-index__section"><h2>{cn ? "重要合作伙伴" : "Our Valued Partners"}</h2><SectionRenderer blocks={[blocks[first + 1]]} /><div className="testimonials">{["Jeff Deng", "Warren Steve", "María Emilia"].map((name, index) => { const photo = blocks[first + 2 + index * 3]; return <figure key={name}>{photo.type === "media" && <img src={photo.image.src} alt={name} width="75" height="75" loading="lazy" />}<blockquote>{copy.testimonials[index]}</blockquote><figcaption>{name}</figcaption></figure>; })}</div></section>
    <section className="product-index__section product-index__faq"><h2>{cn ? "常见问题" : "FAQ"}</h2>{articles.filter((article) => article.category === "faq").slice(0, 4).map((article) => <details key={article.id}><summary>{article.locales[locale].title}</summary><p>{article.locales[locale].description}</p></details>)}<a className="text-link" href={`/${locale}/FAQ`}>{cn ? "查看全部常见问题" : "View all frequently asked questions"} →</a></section>
  </>;
}
