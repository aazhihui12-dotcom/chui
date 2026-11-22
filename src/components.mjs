import { siteConfig } from "./data/site-content.mjs";
import { escapeHtml, joinHtml } from "./lib/html.mjs";

const navigation = [
  { href: "/", label: "首页" },
  { href: "/collections/", label: "当季选款" },
  { href: "/solutions/live-commerce/", label: "直播合作" },
  { href: "/solutions/wholesale/", label: "批发合作" },
  { href: "/showroom-supply-chain/", label: "展厅与供应链" },
  { href: "/knowledge/", label: "牛仔知识" }
];

function navLinks(currentPath, className = "nav-links") {
  return `<div class="${className}">${joinHtml(
    navigation.map(({ href, label }) => {
      const current = currentPath === href || (href !== "/" && currentPath.startsWith(href));
      return `<a href="${href}"${current ? ' aria-current="page"' : ""}>${label}</a>`;
    })
  )}</div>`;
}

export function renderSiteHeader(currentPath = "/") {
  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="昂玖熙首页">
        <span class="brand-cn">${siteConfig.brand.cn}</span>
        <span class="brand-en">${siteConfig.brand.en}</span>
      </a>
      <nav class="desktop-nav" aria-label="主导航">
        ${navLinks(currentPath)}
        <a class="header-contact" href="/contact/">预约选款</a>
      </nav>
      <details class="mobile-menu">
        <summary aria-label="打开主导航"><span></span><span></span></summary>
        <nav aria-label="主导航">
          ${navLinks(currentPath, "mobile-nav-links")}
          <a class="button button-dark" href="/contact/">预约选款</a>
        </nav>
      </details>
    </header>`;
}

export function renderContactActions(variant = "primary") {
  const className = variant === "compact" ? "contact-actions compact" : "contact-actions";
  return `
    <div class="${className}">
      <a class="button button-dark" href="/contact/">获取当季选款册</a>
      <a class="button button-line" href="tel:${siteConfig.contact.mobile}">电话咨询</a>
      <a class="wechat-link" href="/contact/#wechat" data-copy-wechat="${siteConfig.contact.wechat}" data-fallback-href="/contact/#wechat">微信咨询 <span aria-hidden="true">↗</span></a>
    </div>`;
}

export function renderSectionHeading({ eyebrow = "", title, intro = "", align = "left" }) {
  return `
    <div class="section-heading section-heading-${escapeHtml(align)}">
      ${eyebrow ? `<p class="eyebrow">${escapeHtml(eyebrow)}</p>` : ""}
      <h2>${escapeHtml(title)}</h2>
      ${intro ? `<p class="section-intro">${escapeHtml(intro)}</p>` : ""}
    </div>`;
}

export function renderSiteFooter() {
  const year = new Date().getFullYear();
  return `
    <footer class="site-footer">
      <div class="footer-brand">
        <p class="eyebrow">ANGJIUXI / WOMEN'S DENIM</p>
        <p class="footer-statement">从真实身形出发，<br>做好一条女装牛仔裤。</p>
      </div>
      <div class="footer-columns">
        <div>
          <p class="footer-label">CONTACT</p>
          <a href="tel:${siteConfig.contact.mobile}">${siteConfig.contact.mobile}</a>
          <a href="mailto:${siteConfig.contact.email}">${siteConfig.contact.email}</a>
        </div>
        <div>
          <p class="footer-label">SHOWROOM</p>
          <p>${siteConfig.contact.address}</p>
        </div>
        <div>
          <p class="footer-label">EXPLORE</p>
          <a href="/collections/">当季选款</a>
          <a href="/knowledge/">牛仔知识库</a>
          <a href="/contact/">预约到店</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${siteConfig.company}</span>
        <span>${siteConfig.brand.en}</span>
      </div>
    </footer>`;
}
