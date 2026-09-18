import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";

export function Footer({ locale }: { locale: Locale }) {
  const config = siteConfig[locale];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section aria-label={config.name}>
          <img className="site-footer__logo" src="/media/02c18594ff75b4cec3a7b5913466afc8c03f83ebd36105841df28808f49e93df.webp" alt="LBH APPLIANCES" width="230" height="27" />
          <a href={`tel:${config.contact.phone.replace(/\s/g, "")}`}>{locale === "cn" ? "电话" : "Phone"}: {config.contact.phone}</a>
          <a href={`mailto:${config.contact.email}`}>{locale === "cn" ? "邮箱" : "Email"}: {config.contact.email}</a>
          <address>{locale === "cn" ? "地址" : "Address"}: {config.contact.address}</address>
        </section>
        {config.navigation.map((item) => <nav key={item.href} aria-label={`${item.label} — footer`}>
          <a className="site-footer__heading" aria-label={`${item.label} — footer`} href={item.href}>{item.label}</a>
          <ul>
            {item.children?.map((child) => <li key={child.href}><a aria-label={child.href.endsWith("/Contact_Us") ? child.label : `${child.label} — footer`} href={child.href}>{child.label}</a></li>)}
          </ul>
        </nav>)}
      </div>
      <div className="site-footer__bottom">© {new Date().getFullYear()} LBH APPLIANCES</div>
    </footer>
  );
}
