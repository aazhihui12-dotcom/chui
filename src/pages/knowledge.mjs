import { knowledgeArticles, findKnowledgeArticle } from "../data/knowledge.mjs";
import { renderContactActions, renderSectionHeading } from "../components.mjs";

export function renderKnowledgeIndex() {
  return {
    path: "/knowledge/",
    title: "女装牛仔知识库｜昂玖熙",
    description: "面向直播团队、二批档口和实体门店的女装牛仔选款、版型、面料、洗水、拿样、补货与广州线下看款知识。",
    body: `
      <main id="main-content" class="page-shell">
        <section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">DENIM KNOWLEDGE</p><h1>把女装牛仔的常见问题，逐一讲明白</h1><p class="lead">每篇内容回答一个具体问题。既方便客户在联系前判断，也让搜索与不同 AI 更准确地理解昂玖熙的业务。</p></div></section>
        <section class="section section-paper-deep"><div class="section-inner">
          ${renderSectionHeading({ eyebrow: "8 STARTING QUESTIONS", title: "从选供应商，到直播组合选款", intro: "内容依据昂玖熙品牌知识库整理，不使用未核实的认证、排名、客户名称或经营数据。" })}
          <div class="knowledge-grid">
            ${knowledgeArticles.map((article, index) => `<article class="article-card" data-reveal><span class="article-index">${String(index + 1).padStart(2, "0")}</span><h2>${article.question}</h2><p>${article.summary}</p><a class="card-link" href="/knowledge/${article.slug}/">阅读全文 ↗</a></article>`).join("")}
          </div>
        </div></section>
        <section class="cta-band"><div class="cta-band-inner"><div><p class="eyebrow">YOUR QUESTION</p><h2>没有找到答案？把你的渠道和问题直接告诉我们。</h2></div>${renderContactActions("compact")}</div></section>
      </main>`
  };
}

export function renderKnowledgeArticle(slug) {
  const article = findKnowledgeArticle(slug);
  if (!article) return null;
  return {
    path: `/knowledge/${article.slug}/`,
    title: `${article.question}｜昂玖熙牛仔知识库`,
    description: article.summary,
    article,
    body: `
      <main id="main-content" class="page-shell">
        <article class="section">
          <div class="article-layout">
            <nav class="breadcrumbs" aria-label="面包屑导航"><a href="/">首页</a> / <a href="/knowledge/">牛仔知识库</a> / <span>当前文章</span></nav>
            <p class="eyebrow" style="margin-top:44px">ANGJIUXI DENIM ANSWERS</p>
            <h1>${article.question}</h1>
            <p class="article-summary">${article.summary}</p>
            ${article.sections.map((section) => `<section class="article-section"><h2>${section.heading}</h2>${section.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</section>`).join("")}
            <p class="breadcrumbs" style="margin-top:26px">资料依据：昂玖熙品牌知识库　·　更新日期：${article.updatedAt}</p>
            <div style="margin-top:52px">${renderContactActions("compact")}</div>
          </div>
        </article>
        <section class="cta-band"><div class="cta-band-inner"><div><p class="eyebrow">NEXT QUESTION</p><h2>从一个具体问题，开始一次更有效的选款沟通。</h2></div>${renderContactActions("compact")}</div></section>
      </main>`
  };
}
