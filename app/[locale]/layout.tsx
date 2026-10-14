import type { ReactNode } from "react";
import "../globals.css";
import "../source-ui.css";
import "../apower.css";
import "../home-desktop.css";
import "../home-responsive.css";
import "../home-sustainability.css";
import "../home-welcome.css";
import "../home-partners.css";
import "../home-motion.css";
import "../home-hover.css";
import "../home-hero-reference.css";
import "../apower-v3.css";
export { metadata } from "../(entry)/layout";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/site/Header";
import { isLocale, locales } from "@/lib/i18n";
import { InquiryDialog } from "@/components/interactive/InquiryDialog";
import { SourceStyles } from "@/components/site/SourceStyles";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{ children: ReactNode; params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return <html lang={locale === "cn" ? "zh-CN" : "en"}><body><SiteShell locale={locale}><SourceStyles />{children}<InquiryDialog locale={locale} /></SiteShell></body></html>;
}
