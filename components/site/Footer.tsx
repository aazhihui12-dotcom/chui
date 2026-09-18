import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";

export function Footer({ locale }: { locale: Locale }) {
  const config = siteConfig[locale];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section aria-label={config.name}>
          <p className="site-footer__brand">LBH APPLIANCES</p>
          <p>{config.contact.company}</p>
          <a href={`mailto:${config.contact.email}`}>{config.contact.email}</a>
          <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`}>{config.contact.phone}</a>
        </section>
        <nav aria-label="Footer navigation">
          <p className="site-footer__heading">{locale === "cn" ? "快速链接" : "Quick links"}</p>
          <ul>
            {config.navigation.map((item) => <li key={item.href}><a aria-label={`${item.label} — footer`} href={item.href}>{item.label}</a></li>)}
            <li><a href={`/${locale}/Contact`}>{locale === "cn" ? "联系我们" : "Contact Us"}</a></li>
          </ul>
        </nav>
        <section aria-label={locale === "cn" ? "地址" : "Address"}>
          <p className="site-footer__heading">{locale === "cn" ? "地址" : "Address"}</p>
          <address>{config.contact.address}</address>
        </section>
      </div>
      <div className="site-footer__bottom">© {new Date().getFullYear()} LBH APPLIANCES</div>
    </footer>
  );
}
