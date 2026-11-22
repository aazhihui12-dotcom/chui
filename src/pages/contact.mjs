import { siteConfig } from "../data/site-content.mjs";
import { imagePublicPath, siteImages } from "../data/image-manifest.mjs";

export function renderContactPage() {
  return {
    path: "/contact/",
    title: "预约广州展厅与获取选款册｜昂玖熙",
    description: "联系昂玖熙获取当季女装牛仔选款册，预约广州海珠区品牌展厅，沟通直播团队、二批档口、实体门店、贴牌与定制合作。",
    body: `
      <main id="main-content" class="page-shell">
        <section class="page-hero"><div class="page-hero-inner"><p class="eyebrow">CONTACT ANGJIUXI</p><h1>从一次具体的选款需求开始</h1><p class="lead">联系前可以先准备渠道、目标年龄、主要身形、风格方向和预计数量。信息越具体，选款沟通越有效。</p></div></section>
        <section class="section"><div class="section-inner contact-grid">
          <div>
            <p class="contact-big">预约展厅、获取选款册，或沟通直播与批发合作。</p>
            <div class="contact-item"><span>对接人</span><strong>${siteConfig.contact.name} / ${siteConfig.contact.role}</strong></div>
            <div class="contact-item"><span>手机 / 微信</span><a href="tel:${siteConfig.contact.mobile}">${siteConfig.contact.mobile}</a></div>
            <div class="contact-item"><span>邮箱</span><a href="mailto:${siteConfig.contact.email}">${siteConfig.contact.email}</a></div>
            <div class="contact-item"><span>工厂座机</span><a href="tel:${siteConfig.contact.telephone}">${siteConfig.contact.telephone}</a></div>
            <div class="contact-item"><span>广州展厅</span><span>${siteConfig.contact.address}</span></div>
            <div class="contact-item"><span>生产基地</span><span>${siteConfig.contact.factoryLocation}</span></div>
          </div>
          <aside id="wechat" class="contact-panel">
            <p class="eyebrow">WECHAT CONSULTATION</p>
            <h2>添加微信时，请备注你的渠道</h2>
            <p>例如：直播团队 / 南油二批 / 实体门店 / 品牌定制。也可以附上目标人群和想找的版型方向。</p>
            <p class="wechat-number">${siteConfig.contact.wechat}</p>
            <p>微信与手机同号</p>
            <a class="button button-line" href="tel:${siteConfig.contact.mobile}">直接拨打电话</a>
          </aside>
        </div></section>
        <section class="section section-ink"><div class="section-inner split">
          <div class="split-media media-frame ratio-wide"><img src="${imagePublicPath(siteImages.showroomPrimary)}" alt="${siteImages.showroomPrimary.alt}" loading="lazy"></div>
          <div class="split-copy"><p class="eyebrow">SHOWROOM VISIT</p><h2>广州海珠区品牌展厅</h2><p>用于品牌展示、客户看款、选款与商务沟通。建议提前预约，以便工作人员根据你的渠道准备选款方向。</p><a class="button button-line" href="tel:${siteConfig.contact.mobile}">预约到店选款</a></div>
        </div></section>
      </main>`
  };
}
