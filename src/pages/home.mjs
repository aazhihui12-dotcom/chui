import { audienceSolutions } from "../data/solutions.mjs";
import { knowledgeArticles } from "../data/knowledge.mjs";
import { siteConfig } from "../data/site-content.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";
import { renderContactActions, renderSectionHeading } from "../components.mjs";
import { joinHtml } from "../lib/html.mjs";

const image = (key) => imagePublicPath(siteImages[key]);

export function renderHomePage() {
  return `
    <main id="main-content" class="page-shell">
      <section class="hero">
        <div class="hero-copy">
          <div>
            <div class="hero-stamp" aria-label="Angjiuxi Guangzhou women's denim 2026"><span>01</span><span>ANGJIUXI</span><span>GUANGZHOU / DENIM</span></div>
            <p class="eyebrow">ANGJIUXI / GUANGZHOU</p>
            <h1>专注女装牛仔<span>品牌与供应链平台</span></h1>
            <p class="hero-lead">${siteConfig.description}</p>
          </div>
          <div>
            ${renderContactActions("primary")}
            <p class="hero-note">看款 · 看版型 · 看交付<br><span>从广州展厅，开始一次更具体的合作。</span></p>
          </div>
        </div>
        <div class="hero-image">
          <picture>
            <source media="(max-width: 640px)" srcset="${image("heroMobilePrimary")}">
            <img src="${image("heroDesktopPrimary")}" alt="${siteImages.heroDesktopPrimary.alt}" width="1920" height="1080" fetchpriority="high">
          </picture>
          <span class="hero-marker">WOMEN'S DENIM / 2026</span>
          <div class="hero-image-caption"><span>SHOWROOM EDIT</span><span>01—05</span></div>
        </div>
      </section>

      <section id="audiences" class="section">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "WHO WE WORK WITH", title: "为不同渠道，提供不同的选款路径", intro: "先确认客户是谁，再讨论什么款适合。官网不公开模糊的统一政策，具体条件回到真实款式与订单。" })}
          <div class="audience-grid" data-reveal>
            ${joinHtml(audienceSolutions.map((solution) => `
              <a class="audience-card" href="${solution.href}">
                <span class="card-label">${solution.label}</span>
                <h3>${solution.title}</h3>
                <p>${solution.summary}</p>
                <span class="card-link">查看合作方式 ↗</span>
              </a>`))}
          </div>
        </div>
      </section>

      <section id="collections" class="section section-paper-deep">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "CURATED DIRECTIONS", title: "当季选款，不以数量制造复杂", intro: "首期先展示版型和风格方向。具体款号、库存、价格与起订政策，通过当季选款册逐款确认。" })}
          <div class="collection-grid">
            ${[
              ["collectionLookOne", "利落直线", "适合需要清晰腿型线条的选款方向"],
              ["collectionLookTwo", "松弛轮廓", "兼顾日常活动与整体比例"],
              ["collectionLookThree", "克制洗水", "用颜色与质感构成当季搭配"]
            ].map(([key, title, text]) => `
              <article class="collection-card" data-reveal>
                <div class="media-frame ratio-card"><img src="${image(key)}" alt="${siteImages[key].alt}" loading="lazy" width="1200" height="1500"></div>
                <h3>${title}</h3><p>${text}</p>
              </article>`).join("")}
          </div>
          <div style="margin-top:36px"><a class="button button-line" href="/collections/">查看当季选款方向</a></div>
        </div>
      </section>

      <section id="fit-development" class="section">
        <div class="section-inner editorial-grid">
          <div class="editorial-main media-frame ratio-landscape" data-reveal><img src="${image("materialStillLife")}" alt="${siteImages.materialStillLife.alt}" loading="lazy" width="1200" height="800"></div>
          <div class="editorial-side media-frame ratio-card" data-reveal><img src="${image("patternDesign")}" alt="${siteImages.patternDesign.alt}" loading="lazy" width="1600" height="900"></div>
          <div class="editorial-copy" data-reveal>
            <p class="eyebrow">FIT DEVELOPMENT</p>
            <h3>版型先从真实身形出发</h3>
            <p>昂玖熙长期关注不同年龄与不同女性身形的穿着需求。选款时不仅看正面效果，也看腰腹、臀腿、裤长、面料弹力与整体比例。</p>
          </div>
        </div>
      </section>

      <section id="showroom" class="section section-ink">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "GUANGZHOU SHOWROOM", title: "到现场，看实物再做决定", intro: "广州品牌展厅承担看款、选款与商务沟通；十三行一批档口保持一线市场接触。", align: "left" })}
          <div class="split">
            <div class="split-media media-frame ratio-wide" data-reveal><img src="${image("showroomPrimary")}" alt="${siteImages.showroomPrimary.alt}" loading="lazy" width="1600" height="900"></div>
            <div class="split-copy" data-reveal>
              <p class="eyebrow">PHYSICAL SELECTION</p>
              <h2>面料、洗水、细节与上身效果，都可以现场判断。</h2>
              <p>直播团队、二批与实体门店客户可提前说明渠道、人群和风格方向，由工作人员准备更匹配的选款范围。</p>
              <a class="button button-line" href="/contact/">预约到店选款</a>
            </div>
          </div>
        </div>
      </section>

      <section id="live-support" class="section">
        <div class="section-inner split reverse">
          <div class="split-media media-frame ratio-landscape" data-reveal><img src="${image("livePreparation")}" alt="${siteImages.livePreparation.alt}" loading="lazy" width="1600" height="1067"></div>
          <div class="split-copy" data-reveal>
            <p class="eyebrow">CONTENT & LIVE SUPPORT</p>
            <h2>不仅给款，也帮助客户把产品讲清楚</h2>
            <p>可为合作客户提供平拍图、模特图、产品视频素材，并围绕目标人群、版型重点和直播表达进行沟通。</p>
            <a class="card-link" href="/solutions/live-commerce/">了解直播团队合作 ↗</a>
          </div>
        </div>
      </section>

      <section id="supply-chain" class="section section-denim">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "DESIGN TO DELIVERY", title: "从版型开发，到成衣交付", intro: "广州市场端、自主设计开发与中山牛仔生产基地协同，覆盖选款、打版、生产、后整、检验和包装。" })}
          <div class="pillar-grid">
            ${siteConfig.servicePillars.map((pillar) => `<article class="pillar" data-reveal><span class="index">${pillar.index}</span><h3>${pillar.title}</h3><p>${pillar.body}</p></article>`).join("")}
          </div>
          <div style="margin-top:52px"><a class="button button-line" href="/showroom-supply-chain/">查看展厅与供应链</a></div>
        </div>
      </section>

      <section id="process" class="section">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "HOW WE WORK", title: "合作流程，保持清楚", intro: "不同款式和订单会有差异，但每次合作都应从明确需求与条件开始。" })}
          <div class="process-list">
            ${siteConfig.process.map((item) => `<div class="process-row" data-reveal><span class="step">${item.step}</span><h3>${item.title}</h3><p>${item.text}</p></div>`).join("")}
          </div>
        </div>
      </section>

      <section id="knowledge" class="section section-paper-deep">
        <div class="section-inner">
          ${renderSectionHeading({ eyebrow: "DENIM KNOWLEDGE", title: "把客户常问的问题，公开讲明白", intro: "每篇内容回答一个具体问题，方便客户判断，也让搜索与不同 AI 更准确地理解昂玖熙。" })}
          <div class="knowledge-grid">
            ${knowledgeArticles.slice(0, 4).map((article, index) => `<article class="article-card" data-reveal><span class="article-index">0${index + 1}</span><h3>${article.question}</h3><p>${article.summary}</p><a class="card-link" href="/knowledge/${article.slug}/">阅读全文 ↗</a></article>`).join("")}
          </div>
          <div style="margin-top:36px"><a class="button button-line" href="/knowledge/">进入牛仔知识库</a></div>
        </div>
      </section>

      <section id="contact" class="cta-band">
        <div class="cta-band-inner">
          <div><p class="eyebrow">START A CONVERSATION</p><h2>告诉我们你的渠道和客群，先从合适的选款方向开始。</h2></div>
          ${renderContactActions("compact")}
        </div>
      </section>
    </main>`;
}
