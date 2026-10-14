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
          <div className="v3-social" role="group" aria-label="Follow Us"><p>Follow Us</p><div>{['Facebook','Instagram','LinkedIn','YouTube','X'].map((name,i)=><span key={name} title={`${name} — ${locale==='cn'?'链接待补充':'link coming soon'}`}><svg role="img" aria-label={name} width="22" height="22" viewBox="0 0 24 24"><path fill="currentColor" d={[
            'M14 21v-8h3l.5-4H14V7c0-1 .3-2 2-2h2V1h-3c-4 0-5 2-5 6v2H7v4h3v8z',
            'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6zm5-3h2v2h-2z',
            'M3 8h4v13H3zM3 2h4v4H3zM10 8h4v2c1-2 7-4 7 3v8h-4v-7c0-4-3-3-3 0v7h-4z',
            'M3 5h18a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2zm6 3v8l7-4z',
            'M3 3h5l5 7 6-7h2l-7 9 7 9h-5l-5-7-6 7H3l7-9zm4 2H6l11 14h1z',
          ][i]}/></svg></span>)}</div></div>
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
