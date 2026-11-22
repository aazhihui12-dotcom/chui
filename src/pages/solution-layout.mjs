import { renderContactActions } from "../components.mjs";

export function renderSolutionLayout({ eyebrow, title, intro, heroImage, heroAlt, stages, secondaryImage, secondaryAlt, secondaryTitle, secondaryText }) {
  return `
    <main id="main-content" class="page-shell">
      <section class="page-hero">
        <div class="page-hero-inner">
          <p class="eyebrow">${eyebrow}</p>
          <h1>${title}</h1>
          <p class="lead">${intro}</p>
        </div>
      </section>
      <img class="full-bleed-image" src="${heroImage}" alt="${heroAlt}" width="1600" height="1067">
      <section class="section">
        <div class="section-inner split">
          <div class="split-copy">
            <p class="eyebrow">WORKING METHOD</p>
            <h2>从真实需求开始，而不是从一份通用货盘开始</h2>
            <p>先说明渠道、人群和当前问题，再进入选款、拿样与合作政策确认。不同款式、工艺和排期分别沟通。</p>
          </div>
          <div class="stage-list">
            ${stages.map((stage) => `<div class="stage"><h3>${stage.title}</h3><p>${stage.text}</p></div>`).join("")}
          </div>
        </div>
      </section>
      <section class="section section-paper-deep">
        <div class="section-inner split reverse">
          <div class="split-media media-frame ratio-landscape" data-reveal><img src="${secondaryImage}" alt="${secondaryAlt}" loading="lazy" width="1600" height="1067"></div>
          <div class="split-copy" data-reveal>
            <p class="eyebrow">ANGJIUXI SUPPORT</p>
            <h2>${secondaryTitle}</h2>
            <p>${secondaryText}</p>
            ${renderContactActions("compact")}
          </div>
        </div>
      </section>
      <section class="cta-band">
        <div class="cta-band-inner">
          <div><p class="eyebrow">NEXT STEP</p><h2>把你的渠道、人群和选款方向告诉我们。</h2></div>
          ${renderContactActions("compact")}
        </div>
      </section>
    </main>`;
}
