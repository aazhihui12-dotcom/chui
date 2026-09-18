import { readFile, writeFile, mkdir, copyFile, open } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { JSDOM, VirtualConsole } from "jsdom";

// These translations describe the captured English text, not a verified Chinese endpoint.
const pageLabels = {
  "/": ["LBH Appliances — Saving You Time and Cost, Building Your Brand", "LBH电器 — 节省时间与成本，成就您的品牌", "值得信赖的个护与家用电器合作伙伴。提供创新设计、研发和制造解决方案，帮助品牌打造有竞争力的产品。"],
  Exclusive_sale: ["Exclusive Sale", "独家销售", "我们重视您的商机，为您的品牌推荐独特创新的产品，并提供区域独家经销合作。以差异化设计提升品牌竞争力，减少价格竞争，赢得忠实客户。"],
  Contract_manufacturing_service: ["OEM Services", "代工服务", "专业工程师与您共同确认设计及制造需求。依托通过 ISO 9001:2000 认证的工厂，提供个护与家电代工服务；本页面标示起订量为 2,000 件，交货周期为 35–40 天，并提供批量优惠。"],
  PinZhiGuanLi: ["Quality Management", "品质管理", "以 ISO 9001:2000 为质量管理指引，从原料、零部件和半成品到成品，坚持标准化检验。自主开发驱动模块，精益制造高速电机，关注吹风机的每一处细节。"],
  Design_and_Development: ["Design and Development", "设计与研发", "由创始人 Tina 领导的研发团队汇集工程师和设计师，在成立四年内获得超过 40 项专利。从客户的创意与需求出发，综合考虑外观、尺寸、功能、模具、成本和生产周期。"],
  Order_Management: ["Order Management", "订单管理", "产品上市时间对您的业务至关重要。下单后由专属项目经理持续反馈定制产品的进展，提供生产通知，协调修改和实施，并收集您的建议以改善制造流程。"],
  Product_manufacturing: ["Product Manufacturing", "产品制造", "见证从零件到成品的完整制造过程：驱动主板、高速电机、外壳注塑、吹风机组装、测试与包装。按预算和交期完成批量订单。"],
  "Product_Warranty_and_After-Sales_Service": ["Product Warranty and After-Sales Service", "产品保修与售后服务", "所有出库产品提供一年保修。售后团队提供 24/7/365 支持，在联系后 8 小时内给出有效解决方案；支持免费更换或后续补货，无需提供质量问题证明。"],
  Company_Introduction: ["Company Introduction", "公司介绍", "LBH电器创立于 2020 年，专注于采用高速电机的个护小家电设计、研发、制造与销售。我们重视技术创新、设计美学和用户体验，并通过供应链与品牌伙伴合作创造价值。"],
  Lead_the_team: ["Leadership Team", "领导团队", "以专业、热情和对高品质个护家电解决方案的投入，真诚地与每一位客户合作，建立长期联系。"],
  Factory_tour: ["Factory Tour", "工厂参观", "走进通过 ISO 9001:2000 认证的制造工厂，了解组装现场、电机工厂、专用生产车间、制造设备和经过校准的检测工具。"],
  Milestone: ["Milestone", "发展历程", "从 2020 年创立到持续完善研发、供应链和制造体系，回顾 LBH电器的发展历程。"],
  Certification_certificate: ["LBH Product Certification", "产品认证", "查看 LBH电器的产品认证与证书。"],
  Sustainable_Development: ["Sustainable Development", "可持续发展", "生态优先，利润其次。通过先进设备和专业人才减少能耗与废弃物，发展高效电机产品、环保包装和可持续生产，并关注员工与社区的长期发展。"],
  Product_Laboratory: ["Product Lab", "产品实验室", "在产品开发各阶段严格把控质量，开展设计灵活性、采购零件、完整样机和成品抽检等测试。专业团队与先进检测设备共同保障产品质量。"],
  ProductIndex: ["Products", "产品中心", "探索高速多功能造型器、热风梳、直发器、卷发棒与吹风机系列。"],
  Contact_Us: ["Contact Us", "联系我们", "与 LBH电器团队沟通您的个护与家用电器项目，获取产品、定制与合作信息。"],
  FAQ: ["Frequently Asked Questions", "常见问题", "了解产品、产能、研发、样品、起订量、定制、认证、保修、物流与交期。"],
  We_are_here_to_offer_assistance: ["We Are Here to Help", "我们为您提供帮助", "了解独家销售、代工、品质管理、设计研发、订单管理、产品制造与售后服务。"],
  About_us: ["About Us", "关于我们", "了解 LBH电器、团队、工厂、发展历程、产品认证和可持续发展。"],
  Contact: ["Contact", "联系", "联系 LBH电器团队，讨论您的产品与合作需求。"],
  "Content/3012462.html": ["Personal Care Appliance Solutions", "个护小家电解决方案", "一位在小型空气电器领域拥有卓越研发和制造经验的宝贵合作伙伴。"],
  Product_Catalogue: ["Product Catalogue", "产品目录", "查看与下载 LBH电器产品目录。"],
  Blog: ["Blog", "博客", "浏览 LBH电器发布的文章与资讯。"],
  Why_choose_LHB_hair_dryer_products: ["Why Choose LHB Hair Dryer Products", "为什么选择LHB吹风机产品", "了解 LHB吹风机产品。"],
  Ventilation_duct_technology: ["Air Duct Technology", "风道技术", "了解产品的风道技术。"],
  "Content/3022032.html": ["What Makes Our Personal Care Appliances Stand Out?", "我们的个护电器有何不同？", "一体成型外壳兼顾无缝外观和耐用性。紧凑设计减少 10% 运输体积，每个集装箱可多装 500 件；自主模具与高效性能帮助客户控制成本。"],
  "Content/3022033.html": ["What Makes Our Personal Care Appliances Stand Out?", "我们的个护电器有何不同？", "一体成型外壳兼顾无缝外观和耐用性。紧凑设计减少 10% 运输体积，每个集装箱可多装 500 件；自主模具与高效性能帮助客户控制成本。"],
};
const categoryLabels = {
  "682971": ["High Speed Hair Multi-Styler", "高速多功能美发造型器"],
  "682972": ["Hair Dryer Brush", "热风梳"],
  "682973": ["Hair Straightener", "直发器"],
  "682974": ["Curling Iron", "卷发棒"],
  "682975": ["Hair Dryer", "吹风机"],
};
const faqTranslations = {
  "6860206": ["你们的供货能力如何？", "日产能为 5,000 件，年出货量为 150 万至 200 万件。"],
  "6860207": ["你们的主要产品有哪些？", "涵盖不同细分市场的高速吹风机、多功能空气造型工具、空气衣物护理产品，以及不同档次的个人护理与造型工具。"],
  "6860208": ["你们有哪些合作伙伴？", "合作伙伴包括 Radialight、VODANA、Sinbo、LIPWEL、VINTIS 等。"],
  "6860209": ["你们公司的研发能力如何？", "我们拥有多年小型空气电器研发与商业化经验，具备独立的风道和电机技术，拥有多项发明与实用新型专利，每年推出四款新产品。"],
  "6860210": ["产品采用哪些材料？", "材料包括 PP、PC、铝合金等。"],
  "6860211": ["产品的功率范围是多少？", "功率范围为 1300W-2000W。"],
  "6860212": ["可以寄送免费样品吗？", "可以，但需要您承担运费。如果您随后下单，这笔费用将全额退还。"],
  "6860213": ["最低起订量是多少？", "我们支持的最低起订量（MOQ）为 500 件。"],
  "6860214": ["可以选择哪些颜色？", "可以根据您的要求生产任何颜色。只需提供色号，其余工作由我们完成。"],
  "6860215": ["可以印制自己的标志吗？", "可以，前提是订单数量超过我们的最低起订量（MOQ）。"],
  "6860216": ["可以定制外包装盒吗？", "可以，但有最低起订量要求。我们可以发送样图供您确认。"],
  "6860217": ["你们有哪些认证？", "包括 ISO 9001、FCC、CE、UL、KC、PSE、UKCA 等，可满足全球绝大多数国家的认证要求。"],
  "6860218": ["保修期有多长？", "标准期限为一年。"],
  "6860219": ["不良品比例是多少？", "售后率低于千分之五。"],
  "6860220": ["产品采用私模吗？", "是的，所有产品均由我们自主设计和开发，采用独立模具。"],
  "6860221": ["如果需要样品，可以只制作一件吗？", "当然可以。我们也希望建立长期合作关系，以便为您专门预留样品。"],
  "6860222": ["先下小订单，再下大订单，可以优惠吗？", "我们期待长期合作，会在您的第二次订单中提供优惠。"],
  "6860223": ["传统吹风机与高速吹风机有什么区别？", "主要区别在于电机、风速、温度和附加功能。高速吹风机通常采用无刷电机，转速和风速更高，并常配备负离子等护发功能。传统吹风机多采用碳刷电机，风速较低，也更容易造成头发损伤。"],
  "6860224": ["运费高吗？", "运费会持续波动。我们有 5–6 家货运代理可供选择，可以为您筛选合适的方案。"],
  "6860225": ["我收到过更低的报价。", "我们可以尝试匹配您的目标价格，但更低的价格可能意味着更低的质量，这并非双方所期待的结果。"],
  "6860226": ["可以通过 FedEx 发货吗？", "可以，我们也有更节省成本的选项。"],
  "6860227": ["采用哪些运输方式？", "可以海运或空运。我们与多家货运代理和快递服务商有合作协议。"],
  "6860228": ["标准交货周期是多久？", "收到定金后，标准交期约为 30–35 个工作日。根据原料供应情况，部分型号和颜色的发货周期可缩短至 25 天或更少。"],
};
const specLabels = {
  model: "型号", voltage: "电压", wattage: "功率", "plate material": "面板材料", "plate coating": "面板涂层", heater: "发热体", "temp setting": "温度设置", "barrel size": "卷筒尺寸", "barrel coating": "卷筒涂层", "product weight": "产品重量", "power cord length": "电源线长度", "product size": "产品尺寸", "bldc motor": "无刷电机", "wind volume": "风量", "negative ions": "负离子", "noise level": "噪声", "wind control setting": "风速设置", "wind speed": "风速", "plasma generator": "等离子发生器", "temperature range": "温度范围",
};
const clean = (value) => (value ?? "").replace(/\s+/g, " ").trim();
const unique = (values) => [...new Set(values)];
const textOf = (node) => clean(node?.textContent);
const idOf = (pathname) => pathname.split("/").pop().replace(/\.html$/, "") || "home";
const ctaLabels = {
  "Get a Quote Now": "立即询价",
  "Request Full Product Catalog": "索取完整产品目录",
  "Join us today": "今天加入我们",
  "Contact Us": "联系我们",
  "Consult with Home Appliance Experts": "咨询家电专家",
  "Talk to a home appliance expert": "咨询家电专家",
  "Get a Quick Quote": "立即询价",
  "Get Product Catalog": "获取产品目录",
  "Order Now": "立即订购",
  "Inquire Now": "立即咨询",
};

async function hasImageSignature(filename) {
  const file = await open(filename, "r");
  try {
    const bytes = Buffer.alloc(32);
    const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
    if (bytesRead < 12) return false;
    return bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
      || bytes.subarray(0, 3).equals(Buffer.from([255, 216, 255]))
      || /^(GIF87a|GIF89a)$/.test(bytes.toString("ascii", 0, 6))
      || (bytes.toString("ascii", 0, 4) === "RIFF" && bytes.toString("ascii", 8, 12) === "WEBP")
      || (bytes.toString("ascii", 4, 8) === "ftyp" && /^(avif|avis)$/.test(bytes.toString("ascii", 8, 12)))
      || bytes.toString("ascii", 0, 2) === "BM";
  } finally {
    await file.close();
  }
}

export async function buildContent({ source = "source-cache", output = "content", publicDir = "public" } = {}) {
  const assetAliases = JSON.parse(await readFile(new URL("../content/asset-aliases.json", import.meta.url), "utf8"));
  // Rewrite after layout extraction: identical files may occupy separate source gallery positions.
  const localize = (_key, value) => typeof value === "string" ? assetAliases[value] || value : value;
  const manifest = JSON.parse(await readFile(path.join(source, "manifest.json"), "utf8"));
  const sourcePages = [...new Map(manifest.pages.map((page) => [page.pathname, page])).values()];
  const assetMap = new Map(manifest.assets.filter((asset) => asset.status === 200).map((asset) => [asset.sourceUrl, asset]));
  const imageAssets = new Set();
  for (const asset of assetMap.values()) {
    if (asset.contentType?.startsWith("image/") || await hasImageSignature(path.join(source, asset.localPath))) {
      imageAssets.add(asset.sourceUrl);
    }
  }
  const usedAssets = new Map();
  const docs = new Map();
  async function documentFor(page, locale) {
    const variant = page.localeVariants.find((item) => item.locale === locale);
    if (!variant || variant.status !== 200) throw new Error(`Missing captured ${locale} page: ${page.pathname}`);
    if (!docs.has(variant.cacheFile)) {
      const html = await readFile(path.join(source, variant.cacheFile), "utf8");
      const doc = new JSDOM(html, { virtualConsole: new VirtualConsole() }).window.document;
      // Some source FAQs place their only answer in the share-preview summary.
      doc.capturedArticleIntroduction = textOf(doc.querySelector(".news-introduction-deail"));
      doc.querySelectorAll("script,style,noscript,form,template,#HeaderZone,#FooterZone,mobilenav,.share,.shareitem").forEach((node) => node.remove());
      docs.set(variant.cacheFile, doc);
    }
    return docs.get(variant.cacheFile);
  }
  function localAsset(raw, alt = "", download = false) {
    if (!raw || /imgbg|touming|share-wx|qrcode|tracking/i.test(raw)) return;
    let url;
    try { url = new URL(raw, "https://gcdn.meidianbang.cn").href; } catch { return; }
    const asset = assetMap.get(url);
    if (!asset || (!download && !imageAssets.has(asset.sourceUrl))) return;
    const destination = `/${download ? "downloads" : "media"}/${path.basename(asset.localPath)}`;
    usedAssets.set(destination, asset.localPath);
    return { src: destination, alt: clean(alt) };
  }
  function imagesFor(root, title = "") {
    if (!root) return [];
    const images = [];
    for (const node of root.querySelectorAll("img")) {
      const image = localAsset(node.getAttribute("data-src") || node.getAttribute("src"), node.getAttribute("alt") || title);
      if (image) images.push(image);
    }
    // Backgrounds are parsed only into local image references, never emitted as source CSS.
    for (const node of root.querySelectorAll("[style]")) {
      for (const match of node.getAttribute("style").matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) {
        const image = localAsset(match[1], title);
        if (image) images.push(image);
      }
    }
    return [...new Map(images.map((image) => [image.src, image])).values()];
  }
  function paragraphsFor(root) {
    if (!root) return [];
    const nodes = [...root.querySelectorAll("p,li,h1,h2,h3,h4")].filter((node) => !node.querySelector("p,li,h1,h2,h3,h4"));
    const lines = nodes.length ? nodes.map(textOf) : [textOf(root)];
    return unique(lines.filter((text) => text && !text.includes("XX") && !/^Product$|^About$|^Touch$/.test(text)));
  }
  function sourceAction(anchor, locale, pageUrl) {
    const text = textOf(anchor.querySelector(".ButtonText")) || textOf(anchor);
    if (!text) return;
    const label = locale === "cn" ? (ctaLabels[text] || text) : text;
    const raw = clean(anchor.getAttribute("href"));
    // Captured empty buttons have no navigation target. Offer the same explicit
    // contact-inquiry fallback in either locale; do not infer paths from labels.
    if (!raw) return { label, href: `/${locale}/Contact_Us`, action: "inquiry" };
    let url;
    try { url = new URL(raw, pageUrl); } catch { return; }
    if (!['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) return;
    if (url.hostname === "lbhappliances.com" || url.hostname === "www.lbhappliances.com") {
      const pathname = url.pathname.replace(/^\/(en|cn)(?=\/|$)/, "") || "/";
      const href = `/${locale}${pathname === "/" ? "" : pathname}${url.search}${url.hash}`;
      return { label, href, ...(pathname === "/Contact_Us" ? { action: "inquiry" } : {}) };
    }
    return { label, href: url.href };
  }
  function blocksFor(root, locale = "en", pageUrl = "https://lbhappliances.com/", ctaOnly = false) {
    if (!root) return [];
    const blocks = [];
    const seen = new Set();
    const modules = root.querySelectorAll(ctaOnly ? ".ModuleButtonGiant" : ".ModuleImageTextContent,.ModuleDigitalIncreaseGiant,.ModuleButtonGiant,.ModuleSiteGalleryV2Giant,.ModuleImageGiant,.ModuleVideoGiant");
    for (const node of modules) {
      const paragraphs = paragraphsFor(node), text = paragraphs.join(" ");
      if (text && seen.has(text)) continue;
      if (text) seen.add(text);
      const images = imagesFor(node);
      if (node.matches(".ModuleButtonGiant")) {
        const actions = [...node.querySelectorAll("a")].map((anchor) => sourceAction(anchor, locale, pageUrl)).filter(Boolean);
        if (actions.length) blocks.push({ type: "cta", actions });
      } else if (node.matches(".ModuleDigitalIncreaseGiant")) {
        const raw = textOf(node);
        const items = [...raw.matchAll(/(\d[\d,]*\s*\+?)\s*([^\d]+?)(?=\s*\d|$)/g)].map((match) => ({ value: clean(match[1]), label: clean(match[2]) }));
        if (items.length) blocks.push({ type: "stats", items });
      } else if (paragraphs.length) {
        const heading = paragraphs[0].length < 160 ? paragraphs.shift() : undefined;
        const items = [...node.querySelectorAll("li")].map(textOf).filter(Boolean);
        if (images.length) blocks.push({ type: "split", heading: heading || "", paragraphs, image: images[0] });
        else blocks.push({ type: "rich-text", ...(heading ? { heading } : {}), paragraphs, ...(items.length ? { items } : {}) });
      } else if (images.length > 1) blocks.push({ type: "gallery", images });
      else if (images.length) blocks.push({ type: "media", image: images[0] });
    }
    return blocks;
  }
  function specificationsFor(doc) {
    const root = doc.querySelector(".params-content")?.cloneNode(true);
    if (!root) return [];
    root.querySelectorAll("br").forEach((node) => node.replaceWith("\n"));
    root.querySelectorAll("p,tr").forEach((node) => node.append("\n"));
    const rows = [];
    for (const raw of root.textContent.split("\n")) {
      const line = clean(raw).replace(/^'+|'+$/g, "");
      if (!line) continue;
      const colon = line.search(/[:：]/);
      if (colon >= 0) rows.push({ label: clean(line.slice(0, colon)), value: clean(line.slice(colon + 1)) });
      else if (/[°℃℉]/.test(line)) rows.push({ label: "Temperature range", value: line });
      else if (rows.length) rows[rows.length - 1].value += ` ${line}`;
    }
    return rows;
  }
  function basePage(page, locale, title, description, blocks, images, coverage = "full", sourceLocale = "en") {
    const variant = page.localeVariants.find((item) => item.locale === (sourceLocale === "cn" ? "cn" : "en"));
    const translated = locale !== sourceLocale;
    return {
      id: idOf(page.pathname), locale, legacyPath: page.pathname, kind: page.kind,
      title, description, seo: { title: `${title} | LBH APPLIANCES`, description }, blocks, images,
      provenance: { sourceUrl: variant.resolvedUrl, sourceLocale, languageVerified: Boolean(variant.languageVerified), translation: translated ? "authored" : "none", coverage },
    };
  }
  const categories = [];
  for (const [id, titles] of Object.entries(categoryLabels)) {
    const page = sourcePages.find((page) => page.pathname === `/Product/${id}.html`);
    const doc = await documentFor(page, "en"), root = doc.querySelector("#BodyMain1Zone");
    const productIds = unique([...root.querySelectorAll('.ModuleProductListGiant a[href*="ProductDetail/"]')].map((node) => idOf(new URL(node.getAttribute("href"), page.url).pathname)));
    categories.push({ id, legacyPath: page.pathname, title: { en: titles[0], cn: titles[1] }, productIds, image: imagesFor(root)[0] });
  }
  const products = [], articles = [], pages = [];
  for (const page of sourcePages) {
    const doc = await documentFor(page, "en"), cnDoc = await documentFor(page, "cn");
    const root = doc.querySelector("#BodyMain1Zone") || doc.body;
    const id = idOf(page.pathname);
    if (page.kind === "product-detail") {
      const model = textOf(doc.querySelector("h1.pro-name"));
      if (!model) throw new Error(`Missing model ${page.pathname}`);
      const category = categories.find((category) => category.productIds.includes(id));
      if (!category) throw new Error(`Missing category ${model}`);
      // The detail module also contains feature posters, loading graphics and
      // share thumbnails. Only the main carousel supplies product gallery photos.
      const gallery = imagesFor(root.querySelector(".ModuleProduteDetailMain .gallery-top"), model);
      if (!gallery.length) throw new Error(`Missing gallery ${model}`);
      const specifications = specificationsFor(doc);
      if (!specifications.length) throw new Error(`Missing specifications ${model}`);
      const panes = root.querySelectorAll(".particularsMain .tab-pane");
      const section = (node) => { const text = paragraphsFor(node), images = imagesFor(node, model); return [...(text.length ? [{ type: "rich-text", paragraphs: text }] : []), ...(images.length ? [{ type: "gallery", images }] : [])]; };
      const features = section(panes[0]), accessories = section(panes[1]);
      const locales = {};
      for (const locale of ["en", "cn"]) {
        const description = locale === "cn" ? `${model} ${category.title.cn}。查看产品规格、功能与可选配件，联系团队获取定制与报价信息。` : `${model} ${category.title.en}. View specifications, product features and optional accessories. Contact our team for customization and pricing.`;
        const blocks = [{ type: "hero", title: model, subtitle: category.title[locale], image: gallery[0] }, ...(gallery.length ? [{ type: "gallery", images: gallery }] : [])];
        locales[locale] = { ...basePage(page, locale, model, description, blocks, gallery), productId: id, model, categoryId: category.id, specifications: specifications.map((row) => ({ ...row, label: locale === "cn" ? (specLabels[row.label.toLowerCase()] || row.label) : row.label })), features, accessories, inquiryTitle: locale === "cn" ? `${model} 产品询盘` : `${model} Inquiry` };
      }
      products.push({ id, model, legacyPath: page.pathname, categoryId: category.id, image: gallery[0], gallery, locales });
    } else if (page.kind === "news-detail") {
      const sourceTitle = textOf(doc.querySelector(".newsDetailTitle"));
      const paragraphs = paragraphsFor(doc.querySelector("#readMore article"));
      const intro = doc.capturedArticleIntroduction;
      const isPlaceholder = sourceTitle === "标题" && !paragraphs.length;
      const body = paragraphs.length ? paragraphs : [intro].filter(Boolean);
      const publishedAt = textOf(doc.querySelector(".PublishTime")).replace(/^Time[：:]\s*/, "");
      const author = textOf(doc.querySelector(".Author")).replace(/^Author[：:]\s*/, "");
      const images = imagesFor(doc.querySelector("#readMore"));
      const category = faqTranslations[id] ? "faq" : "news", locales = {};
      for (const locale of ["en", "cn"]) {
        const translated = faqTranslations[id];
        const title = isPlaceholder ? (locale === "cn" ? "标题" : "Title") : locale === "cn" ? translated[0] : sourceTitle;
        const content = isPlaceholder ? [locale === "cn" ? "内容介绍" : "Content introduction"] : locale === "cn" ? [translated[1]] : body;
        const blocks = [{ type: "rich-text", paragraphs: content }, ...(images.length ? [{ type: "gallery", images }] : [])];
        locales[locale] = { ...basePage(page, locale, title, content[0] || title, blocks, images, isPlaceholder ? "source-placeholder" : "full"), articleId: id, publishedAt, author, category };
      }
      articles.push({ id, legacyPath: page.pathname, publishedAt, author, category, locales });
    } else {
      const category = categories.find((category) => category.legacyPath === page.pathname);
      const labels = category ? [category.title.en, category.title.cn, `探索 ${category.title.cn} 系列，查看产品型号、规格和定制选项。`] : pageLabels[page.pathname === "/" ? "/" : page.pathname.slice(1)] || (page.pathname.startsWith("/DownLoad/") ? ["Product Catalogue", "产品目录", "查看与下载产品目录。"] : ["News", "新闻资讯", "浏览最新文章与常见问题。"]);
      const images = imagesFor(root, labels[0]);
      const englishBlocks = blocksFor(root, "en", page.url);
      const description = englishBlocks.flatMap((block) => block.paragraphs || []).find((text) => text.length > 40 && !/[\u4e00-\u9fff]/.test(text)) || labels[0];
      const cnRoot = cnDoc.querySelector("#BodyMain1Zone") || cnDoc.body;
      const cnParagraphs = [...cnRoot.querySelectorAll(".ModuleImageTextContent")].flatMap(paragraphsFor);
      const cnCount = cnParagraphs.filter((text) => /[\u4e00-\u9fff]/.test(text)).length;
      const actualChinese = cnParagraphs.length > 2 && cnCount / cnParagraphs.length > 0.6;
      for (const locale of ["en", "cn"]) {
        const title = labels[locale === "en" ? 0 : 1];
        let blocks = locale === "en" ? englishBlocks : actualChinese ? blocksFor(cnRoot, locale, page.url) : [{ type: "rich-text", heading: title, paragraphs: [labels[2]] }, ...englishBlocks.filter((block) => block.type === "media" || block.type === "gallery"), ...blocksFor(cnRoot, locale, page.url, true)];
        if (locale === "cn" && page.pathname === "/") blocks.push({ type: "stats", items: [
          { value: "2 +", label: "全资自动化工厂" },
          { value: "10 +", label: "灵活付款方式" },
          { value: "20 +", label: "国际知名品牌合作伙伴" },
          { value: "4800 +", label: "成功定制样品" },
        ] });
        if (!blocks.length) blocks = [{ type: "rich-text", paragraphs: [locale === "cn" ? labels[2] : title] }];
        if (page.pathname === "/Milestone") {
          const milestones = [...root.querySelectorAll(".ModuleImageTextContent")].filter((node) => /^202\d\s/.test(textOf(node)));
          const cnYears = { "2020": ["激情创业", "Tina 创立 LBH，组建团队研发首款高速吹风机并推向市场。"], "2021": ["从经验中学习", "根据客户对温度和工作模式的反馈，进一步加大研发投入。"], "2022": ["完善体系", "组建专业团队，严格筛选供应商，完善质量体系，新一代高速吹风机投入量产。"], "2023": ["稳步前行", "完善制造、营销、质量与知识产权体系，建立内部研发中心，开展五场销售竞赛。"], "2024": ["业绩增长", "持续开拓北美市场，与当地知名品牌合作，在十大企业参与的竞标中胜出，营业额超过 5,000 万。"], "2025": ["快速进步", "第一季度销售额超过 2,000 万，推进新品研发、上市、品类扩展与测试，并与优秀供应商建立长期合作。"], "2026": ["持续探索与突破", "开拓欧洲与中东市场，同步推出 2–3 款创新个护家电，扩大全球本地品牌合作网络，并持续投入个护小家电研发。"] };
          const items = [...new Map(milestones.map((node) => {
            const paragraphs = paragraphsFor(node), year = paragraphs[0].slice(0, 4);
            return [year, { year, title: locale === "cn" && cnYears[year] ? cnYears[year][0] : paragraphs[0].slice(5), description: locale === "cn" && cnYears[year] ? cnYears[year][1] : paragraphs.slice(1).join(" ") }];
          })).values()];
          if (items.length) blocks.push({ type: "timeline", items });
        }
        const desc = locale === "cn" ? labels[2] : description;
        const record = basePage(page, locale, title, desc, [{ type: "hero", title, image: images[0] }, ...blocks], images, locale === "cn" && !actualChinese ? "localized-summary" : "full", locale === "cn" && actualChinese ? "cn" : "en");
        if (category) record.categoryId = category.id;
        if (/^\/(Contact|Contact_Us)$/.test(page.pathname)) record.kind = "contact";
        if (page.pathname.startsWith("/DownLoad/") || page.pathname === "/Product_Catalogue") {
          record.kind = "download";
          record.downloads = [...root.querySelectorAll("a[href]")].flatMap((node) => { const file = localAsset(node.getAttribute("href"), "", true); return file && !/\.(png|jpe?g|webp|gif)$/i.test(file.src) ? [{ label: textOf(node) || title, href: file.src, action: "download" }] : []; });
        }
        pages.push(record);
      }
    }
  }
  await mkdir(output, { recursive: true });
  for (const [file, symbol, type, data] of [["pages", "pages", "SitePage", pages], ["products", "products", "Product", products], ["articles", "articles", "Article", articles]]) {
    const extra = file === "products" ? `\nexport const categories: Category[] = ${JSON.stringify(categories, localize, 2)};\n` : file === "pages" ? '\nexport const englishHome = pages.find((page) => page.id === "home" && page.locale === "en")!;\n' : "";
    await writeFile(path.join(output, `${file}.ts`), `// Generated by scripts/build-content.mjs. Do not edit by hand.\nimport type { ${type}${file === "products" ? ", Category" : ""} } from "./schema";\n\nexport const ${symbol}: ${type}[] = ${JSON.stringify(data, localize, 2)};\n${extra}`);
  }
  for (const [destination, sourcePath] of usedAssets) {
    const target = path.join(publicDir, assetAliases[destination] || destination);
    await mkdir(path.dirname(target), { recursive: true });
    await copyFile(path.join(source, sourcePath), target);
  }
  const summary = { routes: sourcePages.length, pages: pages.length, products: products.length, articles: articles.length, faq: articles.filter((article) => article.category === "faq").length, sourcePlaceholders: articles.filter((article) => article.locales.en.provenance.coverage === "source-placeholder").length, localizedAssets: usedAssets.size };
  console.log(JSON.stringify(summary, null, 2));
  return summary;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const argument = (name, fallback) => args.includes(name) ? args[args.indexOf(name) + 1] : fallback;
  await buildContent({ source: argument("--source", "source-cache"), output: argument("--output", "content"), publicDir: argument("--public", "public") });
}
