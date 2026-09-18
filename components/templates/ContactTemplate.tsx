import type { SitePage } from "@/content/schema";
import { siteConfig } from "@/content/site";
import { ContactInquiry } from "@/components/interactive/ContactInquiry";
import "./content-pages.css";

export function ContactTemplate({ page }: { page: SitePage }) {
  const cn = page.locale === "cn";
  const { contact, labels } = siteConfig[page.locale];
  return <main id="main-content" className="contact-page support-page">
    <header className="support-banner"><h1>{page.title}</h1></header>
    <div className="support-container contact-layout">
      <section className="contact-intro"><p className="support-eyebrow">LBH APPLIANCES</p>
        <h2>{cn ? "让我们承接您的个护与家用电器新项目！" : "Let us take on your new personal care and home appliance project!"}</h2>
        <ContactInquiry locale={page.locale} title={page.title} label={labels.inquiry} email={contact.email} />
      </section>
      <section className="contact-details"><h2>{cn ? "中国办公室" : "China Office"}</h2>
        <address><p className="contact-company">{contact.company}</p><p>{contact.address}</p></address>
        <dl>
          <div><dt>{cn ? "电子邮箱" : "Email"}</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
          <div><dt>{cn ? "联系电话" : "Phone"}</dt><dd><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></dd></div>
          <div><dt>WhatsApp</dt><dd><a href={`https://wa.me/${contact.whatsapp.replace("+", "")}`}>WhatsApp</a></dd></div>
        </dl>
        <h3>{cn ? "工厂地址" : "Factory Address"}</h3>
        <p>{cn ? "广东省佛山市顺德区大良（五沙）中兴湾智谷产业园" : "Zhigu Industrial Park, Zhongxing Bay (Wusha), Deliang, Shunde District, Foshan City, Guangdong Province"}</p>
      </section>
    </div>
  </main>;
}
