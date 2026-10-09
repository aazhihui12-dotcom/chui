import { sitePath } from "@/lib/site-path";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";
import { BrandLogo } from "./BrandLogo";

export function Footer({ locale }: { locale: Locale }) {
  const config = siteConfig[locale];

  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <section aria-label="APOWER">
          <BrandLogo className="site-footer__logo" width={230} />
          <a href={sitePath(`tel:${config.contact.phone.replace(/\s/g, "")}`)}>{locale === "cn" ? "电话" : "Phone"}: {config.contact.phone}</a>
          <a href={sitePath(`mailto:${config.contact.email}`)}>{locale === "cn" ? "邮箱" : "Email"}: {config.contact.email}</a>
          <address>{locale === "cn" ? "地址" : "Address"}: {config.contact.address}</address>
        </section>
        {config.navigation.map((item) => <nav key={item.href} aria-label={`${item.label} — footer`}>
          <a className="site-footer__heading" aria-label={`${item.label} — footer`} href={sitePath(item.href)}>{item.label}</a>
          <ul>
            {item.children?.map((child) => <li key={child.href}><a aria-label={child.href.endsWith("/Contact_Us") ? child.label : `${child.label} — footer`} href={sitePath(child.href)}>{child.label}</a></li>)}
          </ul>
        </nav>)}
      </div>
      <div className="site-footer__bottom">© {new Date().getFullYear()} APOWER TECH</div>
    </footer>
  );
}
