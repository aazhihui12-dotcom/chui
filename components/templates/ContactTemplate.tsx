import type { SitePage } from "@/content/schema";
import { siteConfig } from "@/content/site";
import { InquiryForm } from "@/components/interactive/InquiryForm";
import "./content-pages.css";

export function ContactTemplate({ page }: { page: SitePage }) {
  const cn = page.locale === "cn";
  const { contact, labels } = siteConfig[page.locale];
  return <main id="main-content" className="contact-page support-page">
    <header className="contact-hero"><h1>{cn ? "让我们承接您的个护与家用电器新项目！" : "Let us take on your new personal care and home appliance project!"}</h1></header>
    <h2 className="contact-heading">{cn ? "立即联系我们" : "Contact Us Now"}</h2>
    <div className="support-container contact-layout">
      <section className="contact-details"><h2>{cn ? "中国办公室" : "China Office"}</h2>
        <dl className="contact-checklist">
          <div><dt>{cn ? "公司名称" : "Company Name"}</dt><dd className="contact-company">{contact.company}</dd></div>
          <div><dt>{cn ? "公司地址" : "Company Address"}</dt><dd><address>{contact.address}</address></dd></div>
          <div><dt>{cn ? "电子邮箱" : "Email"}</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
          <div><dt>{cn ? "联系电话" : "Phone"}</dt><dd><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></dd></div>
          <div><dt>WhatsApp</dt><dd><a aria-label="WhatsApp" href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}>{contact.phone}</a></dd></div>
          <div><dt>{cn ? "工厂地址" : "Factory Address"}</dt><dd>{cn ? "广东省佛山市顺德区大良（五沙）中兴湾智谷产业园" : "Zhigu Industrial Park, Zhongxing Bay (Wusha), Deliang, Shunde District, Foshan City, Guangdong Province"}</dd></div>
        </dl>
      </section>
      <section className="contact-inquiry-panel" aria-label={labels.inquiry}>
        <InquiryForm locale={page.locale} />
      </section>
    </div>
  </main>;
}
