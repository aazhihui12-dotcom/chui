import { siteConfig } from "../data/site-content.mjs";
import { knowledgeArticles } from "../data/knowledge.mjs";
import { escapeHtml } from "./html.mjs";
import { renderSiteFooter, renderSiteHeader } from "../components.mjs";

function normalizeBaseUrl(baseUrl) {
  return baseUrl.replace(/\/$/, "");
}

function absoluteUrl(baseUrl, pathname) {
  const root = normalizeBaseUrl(baseUrl);
  return pathname === "/" ? `${root}/` : `${root}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

export function buildMetadata(page, baseUrl) {
  return {
    title: page.title,
    description: page.description,
    canonical: absoluteUrl(baseUrl, page.path),
    ogImage: absoluteUrl(baseUrl, "/og.png")
  };
}

export function buildOrganizationJsonLd(baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${normalizeBaseUrl(baseUrl)}/#organization`,
    name: siteConfig.brand.cn,
    alternateName: siteConfig.brand.en,
    legalName: siteConfig.company,
    url: normalizeBaseUrl(baseUrl),
    description: siteConfig.positioning,
    telephone: siteConfig.contact.mobile,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "凤凰创意园20栋103",
      addressLocality: "广州市",
      addressRegion: "广东省",
      addressCountry: "CN"
    }
  };
}

export function buildLocalBusinessJsonLd(baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${normalizeBaseUrl(baseUrl)}/#showroom`,
    name: "昂玖熙广州品牌展厅",
    url: absoluteUrl(baseUrl, "/contact/"),
    telephone: siteConfig.contact.mobile,
    email: siteConfig.contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: "海珠区凤凰创意园20栋103",
      addressLocality: "广州市",
      addressRegion: "广东省",
      addressCountry: "CN"
    },
    parentOrganization: { "@id": `${normalizeBaseUrl(baseUrl)}/#organization` }
  };
}

export function buildServiceJsonLd(baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${normalizeBaseUrl(baseUrl)}/#service`,
    serviceType: "女装牛仔选款、现货批发、贴牌与定制供应服务",
    provider: { "@id": `${normalizeBaseUrl(baseUrl)}/#organization` },
    areaServed: { "@type": "Country", name: "中国" },
    audience: ["直播团队", "二批档口", "实体门店", "女装品牌客户"]
  };
}

export function buildArticleJsonLd(article, baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.question,
    description: article.summary,
    datePublished: article.updatedAt,
    dateModified: article.updatedAt,
    inLanguage: "zh-CN",
    mainEntityOfPage: absoluteUrl(baseUrl, `/knowledge/${article.slug}/`),
    author: { "@id": `${normalizeBaseUrl(baseUrl)}/#organization` },
    publisher: { "@id": `${normalizeBaseUrl(baseUrl)}/#organization` }
  };
}

export function buildFaqJsonLd(articles, baseUrl) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: absoluteUrl(baseUrl, "/knowledge/"),
    mainEntity: articles.map((article) => ({
      "@type": "Question",
      name: article.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: article.summary
      }
    }))
  };
}

export function buildBreadcrumbJsonLd(page, baseUrl) {
  const elements = [{ name: "首页", item: absoluteUrl(baseUrl, "/") }];
  if (page.path.startsWith("/knowledge/") && page.path !== "/knowledge/") {
    elements.push({ name: "牛仔知识库", item: absoluteUrl(baseUrl, "/knowledge/") });
  }
  if (page.path !== "/") {
    elements.push({ name: page.title.split("｜")[0], item: absoluteUrl(baseUrl, page.path) });
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: elements.map((element, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: element.name,
      item: element.item
    }))
  };
}

export function buildSitemapEntries(baseUrl) {
  const fixedRoutes = [
    "/",
    "/collections/",
    "/solutions/live-commerce/",
    "/solutions/wholesale/",
    "/showroom-supply-chain/",
    "/knowledge/",
    "/contact/"
  ];
  return [
    ...fixedRoutes.map((pathname) => ({ loc: absoluteUrl(baseUrl, pathname), lastmod: "2026-11-11" })),
    ...knowledgeArticles.map((article) => ({ loc: absoluteUrl(baseUrl, `/knowledge/${article.slug}/`), lastmod: article.updatedAt }))
  ];
}

function serializeJsonLd(value) {
  return JSON.stringify(value).replaceAll("<", "\\u003c");
}

export function renderDocument(page, baseUrl) {
  const metadata = buildMetadata(page, baseUrl);
  const structuredData = [
    buildOrganizationJsonLd(baseUrl),
    buildLocalBusinessJsonLd(baseUrl),
    buildServiceJsonLd(baseUrl),
    buildBreadcrumbJsonLd(page, baseUrl)
  ];
  if (page.article) structuredData.push(buildArticleJsonLd(page.article, baseUrl));
  if (page.path === "/" || page.path === "/knowledge/") structuredData.push(buildFaqJsonLd(knowledgeArticles.slice(0, page.path === "/" ? 4 : 8), baseUrl));
  return `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(metadata.title)}</title>
  <meta name="description" content="${escapeHtml(metadata.description)}">
  <link rel="canonical" href="${escapeHtml(metadata.canonical)}">
  <meta property="og:type" content="website">
  <meta property="og:locale" content="zh_CN">
  <meta property="og:site_name" content="昂玖熙 ANGJIUXI">
  <meta property="og:title" content="${escapeHtml(metadata.title)}">
  <meta property="og:description" content="${escapeHtml(metadata.description)}">
  <meta property="og:url" content="${escapeHtml(metadata.canonical)}">
  <meta property="og:image" content="${escapeHtml(metadata.ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css">
  ${structuredData.map((data) => `<script type="application/ld+json">${serializeJsonLd(data)}</script>`).join("\n  ")}
</head>
<body>
  <a class="skip-link" href="#main-content">跳到主要内容</a>
  ${renderSiteHeader(page.path)}
  ${page.body}
  ${renderSiteFooter()}
  <script src="/site.js" defer></script>
</body>
</html>`;
}
