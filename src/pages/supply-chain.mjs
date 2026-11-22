import { renderContactActions, renderSectionHeading } from "../components.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";

const image = (key) => imagePublicPath(siteImages[key]);

export function renderSupplyChainPage() {
  const steps = [
    ["patternDesign", "01 / 版型与制版", "自主设计开发团队负责趋势研究、版型开发、款式设计与打版。"],
    ["cuttingProduction", "02 / 铺布与裁剪", "生产流程根据订单与工艺安排面辅料、裁剪与车缝。"],
    ["denimQualityControl", "03 / 后整与检查", "从来料、生产到出货设置相应检查环节，关注尺寸、洗水和成衣细节。"],
    ["packingDelivery", "04 / 包装与交付", "完成检验后进入折叠、包装、入仓与交付流程。"]
  ];
  return {
    path: "/showroom-supply-chain/",
    title: "广州展厅与女装牛仔供应链｜昂玖熙",
    description: "了解昂玖熙广州品牌展厅、十三行一批档口、自主版型研发与中山自有牛仔生产基地的设计、生产、质检和包装流程。",
    body: `
      <main id="main-content" class="page-shell">
        <section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">SHOWROOM & SUPPLY CHAIN</p><h1>从市场一线，到生产交付</h1><p class="lead">广州档口与展厅获取客户和市场反馈，自主研发团队完成款式与版型，中山牛仔生产基地承担生产与交付协同。</p></div></section>
        <img class="full-bleed-image" src="${image("showroomPrimary")}" alt="${siteImages.showroomPrimary.alt}" width="1600" height="900">
        <section class="section"><div class="section-inner">${renderSectionHeading({ eyebrow: "PHYSICAL PRESENCE", title: "看款、沟通与市场反馈，都有真实现场", intro: "广州品牌展厅用于看款、选款和商务沟通；十三行一批档口保持与一线批发市场的持续接触。" })}<div class="split"><div class="split-media media-frame ratio-landscape"><img src="${image("selectionService")}" alt="${siteImages.selectionService.alt}" loading="lazy"></div><div class="split-copy"><h2>先看实物，再决定合作方式</h2><p>对于版型、面料、洗水和成衣细节，现场判断通常比只看一张图片更直接。客户可提前预约并说明渠道与人群。</p>${renderContactActions("compact")}</div></div></div></section>
        <section class="section section-ink"><div class="section-inner">${renderSectionHeading({ eyebrow: "PRODUCTION PROCESS", title: "四个可见的协同环节", intro: "以下图片用于说明生产与交付流程，不表示图片中的每件服装就是页面展示的具体款式。" })}<div class="collection-grid">${steps.map(([key, title, text]) => `<article class="collection-card" data-reveal><div class="media-frame ratio-wide"><img src="${image(key)}" alt="${siteImages[key].alt}" loading="lazy"></div><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div></section>
        <section class="section"><div class="section-inner split"><div class="split-copy"><p class="eyebrow">COOPERATION</p><h2>现货、贴牌和定制，使用不同的确认路径</h2><p>现货合作重点确认具体款式与当前条件；贴牌、换标、来样和定制则需要进一步确认样板、辅料、工艺、数量与排期。官网不使用统一数字替代真实订单沟通。</p>${renderContactActions("compact")}</div><div class="split-media media-frame ratio-landscape"><img src="${image("denimQualityControl")}" alt="${siteImages.denimQualityControl.alt}" loading="lazy"></div></div></section>
        <section class="cta-band"><div class="cta-band-inner"><div><p class="eyebrow">VISIT US</p><h2>预约广州展厅，看实物、聊客群与合作方向。</h2></div>${renderContactActions("compact")}</div></section>
      </main>`
  };
}
