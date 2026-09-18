import type { ReactNode } from "react";
import type { Locale } from "@/lib/i18n";
import { siteConfig } from "@/content/site";
import { DesktopNav } from "./DesktopNav";
import { LanguageSwitch } from "./LanguageSwitch";
import { MobileMenu } from "@/components/interactive/MobileMenu";
import { Footer } from "./Footer";
import { FloatingActions } from "./FloatingActions";
import { InquiryTrigger } from "@/components/interactive/InquiryTrigger";

export function Header({ locale }: { locale: Locale }) {
  const config = siteConfig[locale];

  return (
    <header className="site-header">
      <a className="site-brand" href={`/${locale}`} aria-label={`${config.name} home`}>
        <img src="/media/02c18594ff75b4cec3a7b5913466afc8c03f83ebd36105841df28808f49e93df.webp" alt="LBH APPLIANCES" width="132" height="24" />
      </a>
      <DesktopNav items={config.navigation} />
      <div className="site-header__actions">
        <InquiryTrigger locale={locale} title={config.labels.inquiry} className="header-inquiry" label={locale === "cn" ? "询盘" : "Inquiry"}>✉</InquiryTrigger>
        <LanguageSwitch locale={locale} />
        <MobileMenu locale={locale} items={config.navigation} />
      </div>
    </header>
  );
}

export function SiteShell({ locale, children }: { locale: Locale; children: ReactNode }) {
  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to content</a>
      <Header locale={locale} />
      {children}
      <Footer locale={locale} />
      <FloatingActions locale={locale} />
    </div>
  );
}
