import { renderContactActions, renderSectionHeading } from "../components.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";

const image = (key) => imagePublicPath(siteImages[key]);

export function renderCollectionsPage() {
  return {
    path: "/collections/",
    title: "当季女装牛仔选款方向｜昂玖熙",
    description: "查看昂玖熙女装牛仔当季版型、洗水与穿着场景方向，具体款式、库存、价格和合作政策通过选款册逐款确认。",
    body: `
      <main id="main-content" class="page-shell">
        <section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">SEASONAL EDIT</p><h1>当季选款，先看版型与人群</h1><p class="lead">不以大量款号制造复杂。先展示版型、洗水和场景方向，再根据渠道与客群获取具体选款册。</p></div></section>
        <section class="section section-paper-deep">
          <div class="section-inner">
            ${renderSectionHeading({ eyebrow: "SELECTED DIRECTIONS", title: "四个观察方向", intro: "图片用于展示方向，不代表固定库存或公开报价；实际合作以当季款式为准。" })}
            <div class="collection-grid">
              ${[
                ["collectionLookOne", "直线与比例", "通过腰位、裤长和腿型关系观察整体比例。"],
                ["collectionLookTwo", "松弛与活动", "在轮廓感和日常活动之间寻找平衡。"],
                ["collectionLookThree", "洗水与质感", "用克制洗水、面料触感和细节构成风格。"],
                ["colorStory", "颜色组合", "按渠道客群组合深浅洗水与日常搭配方向。"]
              ].map(([key, title, text]) => `<article class="collection-card" data-reveal><div class="media-frame ratio-card"><img src="${image(key)}" alt="${siteImages[key].alt}" loading="lazy"></div><h3>${title}</h3><p>${text}</p></article>`).join("")}
            </div>
          </div>
        </section>
        <section class="section">
          <div class="section-inner split">
            <div class="split-media media-frame ratio-landscape"><img src="${image("materialStillLife")}" alt="${siteImages.materialStillLife.alt}" loading="lazy"></div>
            <div class="split-copy"><p class="eyebrow">HOW TO SELECT</p><h2>先说清楚渠道，再选择具体款式</h2><p>直播团队、二批档口和实体门店面对的人群与销售节奏不同。请告诉我们年龄层、身形、价位方向和上新需求，由工作人员整理更匹配的选款范围。</p>${renderContactActions("compact")}</div>
          </div>
        </section>
        <section class="cta-band"><div class="cta-band-inner"><div><p class="eyebrow">SEASONAL LINE SHEET</p><h2>获取当季选款册，逐款确认合作条件。</h2></div>${renderContactActions("compact")}</div></section>
      </main>`
  };
}
